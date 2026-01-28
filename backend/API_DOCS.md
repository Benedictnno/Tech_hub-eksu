# API Documentation for Tech Hub Eksu

_Base URL (backend)_  
`http://localhost:5000` (dev) or `https://tech-hub-eksu-08f4.onrender.com`

All paths below are relative to the backend root, e.g. `GET /api/auth/me` → `http://localhost:5000/api/auth/me`.

---

## 1. Authentication

### 1.1 Method

- **JWT** stored in an **HTTP-only cookie** named `jwt`.
- You do **not** send `Authorization: Bearer ...` headers.
- After `POST /api/auth/login`, the server:
  - Sets `Set-Cookie: jwt=<token>; HttpOnly; ...`
  - Returns user info + flags in JSON

For **all protected endpoints**, use:

- `fetch` → `credentials: 'include'`
- Axios → `withCredentials: true`
- **Fallback**: If cookies are blocked (e.g. cross-site restrictions), you can send the token in the `Authorization` header: `Authorization: Bearer <token>`.

### 1.2 Getting a Token

**POST `/api/auth/login`**

- See details in section **4.1 Auth**.
- On success:
  - Cookie `jwt` is set.
  - Response JSON includes `token` (same JWT) and user data.

### 1.3 Roles & Guards

- `User.role`: `"user"` or `"admin"`.
- **`protect` middleware**:
  - Reads `jwt` cookie.
  - Validates with `JWT_SECRET`.
  - Loads user into `req.user` (without password).
- **`admin` middleware**:
  - Requires `req.user.role === 'admin'`.
  - Used on `/api/admin/**`, some `/api/blog`, `/api/gallery` routes.
- **`verifyEligibility` middleware**:
  - Requires:
    - `isRegistered === true`
    - `hasPaid === true`
    - `isOnboarded === true`
    - `hasActiveSubscription() === true`
  - Used for attendance checkout.

---

## 2. Common Response Patterns

There is no strict global wrapper; patterns are:

- **Success**
  - `200 OK`: standard read/update.
  - `201 Created`: resource created.
  - Body: usually just the document or `{ message, data }`.
- **Errors**
  - `400 Bad Request`: validation / logical issues.
  - `401 Unauthorized`: missing/invalid auth, bad credentials.
  - `403 Forbidden`: authenticated but not allowed (e.g. inactive account).
  - `404 Not Found`: entity not found.
  - `409 Conflict`: e.g. already checked in.
  - `500 Internal Server Error`: unexpected error.

Common fields:

- `message: string` – human-friendly error.
- Some validation endpoints also include `details: [...]`.

---

## 3. Status Codes

- **200** – Success (read/update).
- **201** – Created.
- **400** – Validation/logic error.
- **401** – Not authenticated / invalid token / bad credentials.
- **403** – Forbidden (role or state).
- **404** – Not found.
- **409** – Conflict (e.g. already checked in).
- **500** – Server error.

---

## 4. All Endpoints

### 4.1 Auth (`/api/auth`)

#### 4.1.1 `GET /api/auth/me`

- **Auth**: `protect`
- **Description**: Get the currently authenticated user.
- **Request**: none.
- **Response 200**: User object (no password).

#### 4.1.2 `POST /api/auth/register`

- **Status**: Disabled (self-registration is blocked).
- **Response 403**:

```json
{
  "message": "Self-registration is disabled. Please contact an administrator."
}
```

#### 4.1.3 `POST /api/auth/login`

- **Auth**: Public
- **Rate limit**: 10 requests / 15 min per IP.
- **Body**:

```json
{
  "email": "user@example.com",
  "password": "string (min 6)"
}
```

- **Success 200**:
  - Sets `jwt` cookie.
  - Returns:

```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "role": "user" | "admin",
  "isRegistered": true,
  "hasPaid": false,
  "isOnboarded": false,
  "subscription": { /* or null */ },
  "accountStatus": "Pending Payment" | "Active" | "Suspended",
  "paymentStatus": "Pending" | "Paid" | "Failed",
  "semestersPaid": number,
  "mustChangePassword": true | false,
  "token": "jwt-string"
}
```

- **Error 401**:

```json
{ "message": "Invalid email or password" }
```

- **Error 403** (inactive account):

```json
{
  "message": "Account is not active",
  "accountStatus": "Pending Payment" | "Suspended",
  "paymentStatus": "Pending" | "Failed"
}
```

#### 4.1.4 `POST /api/auth/logout`

- **Auth**: Any (clears cookie).
- **Response 200**:

```json
{ "message": "Logout successful" }
```

#### 4.1.5 `POST /api/auth/change-password`

- **Auth**: `protect`
- **Body**:

```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8)"
}
```

- **Success 200**:

```json
{ "message": "Password changed successfully" }
```

- **Error 400**: current password incorrect.
- **Error 404**: user not found.

#### 4.1.6 `POST /api/auth/forgot-password`

- **Auth**: Public
- **Body**:

```json
{ "email": "user@example.com" }
```

- **Behavior**:
  - If user exists:
    - Generates `resetPasswordToken` and `resetPasswordExpires` (1 hour).
    - Sends email with link:  
      `APP_PUBLIC_URL/reset-password/:token`.
  - If user doesn’t exist:
    - Still returns the same response (to avoid enumeration).
- **Response 200**:

```json
{
  "message": "If an account with that email exists, a reset link has been sent"
}
```

#### 4.1.7 `POST /api/auth/reset-password/:token`

- **Auth**: Public (token-based)
- **Params**:
  - `token`: reset token from email.
- **Body**:

```json
{ "newPassword": "string (min 8)" }
```

- **Success 200**:

```json
{ "message": "Password has been reset successfully" }
```

- **Error 400**:

```json
{ "message": "Invalid or expired reset token" }
```

---

### 4.2 Users (`/api/users`)

#### 4.2.1 `GET /api/users/profile`

- **Auth**: `protect`
- **Description**: Get current user’s profile.
- **Response 200**: Full user document without password.

#### 4.2.2 `PUT /api/users/profile`

- **Auth**: `protect`
- **Description**: Update current user profile.
- **Body**: Any fields to update. Example:

```json
{
  "name": "New Name",
  "phone": "080...",
  "profession": "Software Developer",
  "profilePicture": "https://...",
  "password": "NewStrongPass1" // optional
}
```

- **Behavior**:
  - Each key in `req.body` is assigned to the user.
  - If `password` is provided, it is hashed via pre-save hook.
- **Response 200**:

```json
{
  "data": { /* updated user */ },
  "message": "Profile updated successfully"
}
```

> Frontend should only send valid/allowed fields (no whitelist on backend).

#### 4.2.3 `POST /api/users/change-password`

- **Auth**: `protect`
- **Description**: Change user password after verifying current one.
- **Body**:

```json
{
  "currentPassword": "string",
  "newPassword": "string (min 6)"
}
```

- **Response 200**:

```json
{ "message": "Password changed successfully" }
```

- **Error 400**: Incorrect current password.

#### 4.2.4 `GET /api/users/all-users`

- **Auth**: Public
- **Response**:

```json
{ "users": 123 }
```

#### 4.2.4 `GET /api/users/current-user`

- **Auth**: `protect`
- **Description**: Get current user (same as `/profile`, slightly different route name).

#### 4.2.5 `GET /api/users/qrcode`

- **Auth**: `protect`
- **Description**: Generate QR code for the user.
- **Response**:

```json
{
  "qrCode": "string-url-or-data",
  "userId": "string",
  "name": "string",
  "profileUrl": "string"
}
```

#### 4.2.6 `POST /api/users/make-payment`

- **Auth**: `protect`
- **Body**:

```json
{ "subscriptionType": "semester" | "session" }
```

- **Response**:

```json
{
  "message": "Payment processed successfully",
  "subscription": {
    "type": "semester" | "session",
    "startDate": "ISO",
    "endDate": "ISO",
    "active": true
  },
  "semestersPaidBalance": number,
  "hasPaid": true
}
```

#### 4.2.7 `POST /api/users/log-payment`

- **Auth**: `protect`
- **Body**:

```json
{ "reference": "paystack-ref-or-other" }
```

- **Response**:

```json
{ "message": "Payment reference logged successfully" }
```

#### 4.2.8 `GET /api/users/start-of-current-session`

- **Auth**: Public
- **Response**:

```json
{
  "success": true,
  "data": { /* active session */ },
  "message": "Active session retrieved successfully"
}
```

#### 4.2.9 `GET /api/users/:id`

- **Auth**: Public
- **Description**: Get user by id, with `sessionId` populated.
- **Response 200**: User without password.

---

### 4.3 Admin – User Management (`/api/admin`)

_All require `protect` + `admin`._

#### 4.3.1 `POST /api/admin/users/manual-create`

- **Body**:

```json
{
  "name": "Full Name",
  "email": "unique@example.com",
  "phone": "080...",
  "profession": "Developer",
  "programType": "Fellowship" | "Pre-Fellowship"
}
```

- **Behavior**:
  - Creates user with:
    - Password: `Techhubpassword1`
    - `accountStatus = "Pending Payment"`
    - `paymentStatus = "Pending"`
    - `registrationToken` + `tokenExpiresAt` (7 days default).
    - `firstLogin = true`, `onboardingCompleted = false`.
  - Sends registration email:
    - Link: `APP_PUBLIC_URL/registration/:registrationToken`
    - Includes fee and expiry info.
- **Response 201**:

```json
{
  "message": "User created and registration email sent",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "profession": "string",
    "programType": "Fellowship",
    "accountStatus": "Pending Payment",
    "paymentStatus": "Pending"
  }
}
```

#### 4.3.2 `GET /api/admin/users`

- **Query parameters** (all optional):

```text
accountStatus=Pending Payment|Active|Suspended
programType=Fellowship|Pre-Fellowship
paymentStatus=Pending|Paid|Failed
search=string  // matched against name, email, phone (case-insensitive)
```

- **Response 200**: Array of user documents (no password).

#### 4.3.3 `GET /api/admin/users/:id`

- **Response 200**: Single user (no password).

#### 4.3.4 `POST /api/admin/users/:id/resend-link`

- **Description**:
  - Regenerates registration token if:
    - Missing, expired, or already used.
  - Sends registration email again with fresh link.
- **Response 200**:

```json
{ "message": "Registration link sent" }
```

#### 4.3.5 `POST /api/admin/users/:id/confirm-payment`

- **Body (optional)**:

```json
{ "paymentReference": "MANUAL-REF-123" }
```

- **Behavior**:
  - Sets:
    - `accountStatus = "Active"`
    - `paymentStatus = "Paid"`
    - `paymentReference` (if provided & previously empty).
- **Response 200**:

```json
{ "message": "Payment confirmed and account activated" }
```

#### 4.3.6 `POST /api/admin/users/:id/suspend`

- **Behavior**:
  - Sets `accountStatus = "Suspended"`.
- **Response 200**:

```json
{
  "message": "User suspended",
  "user": { ... }
}
```

#### 4.3.7 `POST /api/admin/users/:id/reactivate`

- **Behavior**:
  - Sets `accountStatus = "Active"`.
- **Response 200**:

```json
{
  "message": "User reactivated",
  "user": { ... }
}
```

```json
{ "message": "User deleted" }
```

#### 4.3.9 `PUT /api/admin/users/:id`

- **Auth**: `protect` + `admin`
- **Description**: Update user details.
- **Body**:

```json
{
  "name": "string",
  "email": "string",
  "role": "user" | "admin",
  "programType": "Fellowship" | "Pre-Fellowship",
  "isRegistered": boolean,
  "hasPaid": boolean,
  "isOnboarded": boolean,
  "subscription": { /* subscription object */ }
}
```

- **Behavior**:
  - Checks for email uniqueness if email is changed.
  - Updates specified fields.
- **Response 200**: Updated user object.

---

### 4.4 Attendance (`/api/attendance`)

#### 4.4.1 `POST /api/attendance/checkin`

- **Auth**: Public (by `uniqueId`).
- **Body**:

```json
{ "uniqueId": "string" }
```

- **Success 200**:

```json
{
  "message": "Check-in successful",
  "checkInTime": "ISO date",
  "userId": "string",
  "attendance": {
    "date": "ISO date",
    "checkIn": "ISO date",
    "checkOut": null,
    "autoCheckout": false
  }
}
```

- **Errors**:
  - `404`: user not found.
  - `409`: already checked in today.

#### 4.4.2 `GET /api/attendance/total-checkedin`

- **Auth**: `protect`
- **Response**:

```json
{
  "total": 5,
  "users": [
    {
      "name": "string",
      "email": "string",
      "uniqueId": "string",
      "phone": "string",
      "checkInTime": "ISO date"
    }
  ]
}
```

#### 4.4.3 `POST /api/attendance/checkout`

- **Auth**: `protect`, `verifyEligibility`
- **Body**: none.
- **Success 200**:

```json
{
  "message": "Check-out successful",
  "checkOutTime": "ISO date"
}
```

- **Error 400**:

```json
{ "message": "No active check-in found for today" }
```

#### 4.4.4 `GET /api/attendance/history`

- **Auth**: `protect`
- **Response 200**: Array of attendance records, newest first.

---

### 4.5 Reservations (`/api/reservations`)

_Only key public/admin endpoints relevant to frontend:_

#### 4.5.1 Public

- **GET `/api/reservations/applications/track?referenceId=...`**
  - Track reservation by reference.

- **POST `/api/reservations/applications`**
  - Submit new reservation.
  - Body includes `fullName, email, phone, organizationName, eventTitle, eventDate, description, link?`.

- **POST `/api/reservations/applications/cancel`**
- **POST `/api/reservations/applications/resubmit`**

#### 4.5.2 Admin

- **GET `/api/reservations/admin/applications/pending`**
- **GET `/api/reservations/admin/applications/:id`**
- **GET `/api/reservations/admin/applications`**
  - Supports `status`, `startDate`, `endDate`, `page`, `limit`.
- **POST `/api/reservations/admin/applications/:id/approve`**
  - Triggers Paystack initialization.
- **POST `/api/reservations/paystack/webhook`**
  - Paystack callback (not called by frontend).
- **POST `/api/reservations/admin/applications/:id/reject`**
- **POST `/api/reservations/admin/applications/:id/request-modifications`**
- **GET `/api/reservations/admin/dashboard`**
  - Summary stats for admin dashboards.

---

### 4.6 Blog (`/api/blog`)

#### Public

- **GET `/api/blog`**
  - List published posts.
- **GET `/api/blog/:slug`**
  - Get single post by slug.

#### Admin (auth + admin)

- **POST `/api/blog`**
  - Create post, validated via `createPostValidator`.
- **PUT `/api/blog/:id`**
- **DELETE `/api/blog/:id`**
- **PATCH `/api/blog/:id/status`**
  - Toggle published/draft.
- **GET `/api/blog/admin/list`**
  - List all posts with filters (details in controller).

---

### 4.7 Gallery (`/api/gallery`)

#### Admin (auth + admin)

- **POST `/api/gallery/albums`**
  - Body:

```json
{
  "name": "Album Name",
  "description": "optional",
  "isPublic": true
}
```

- **POST `/api/gallery/albums/:albumId/photos`**

```json
{
  "photos": [
    {
      "publicId": "cloudinary-public-id",
      "title": "optional",
      "format": "string",
      "width": 800,
      "height": 600,
      "bytes": 123456
    }
  ]
}
```

- **DELETE `/api/gallery/photos/:id`**
  - Deletes photo and optionally Cloudinary image.

#### Public

- **GET `/api/gallery/albums`**
  - List public albums.

- **GET `/api/gallery/albums/:slug/photos`**
  - Get photos for album by slug.

---

### 4.8 Registration & Paystack (`/api/registration`)

#### 4.8.1 `GET /api/registration/token/:token`

- **Auth**: Public
- **Response 200**:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "profession": "string",
  "programType": "Fellowship" | "Pre-Fellowship",
  "registrationFee": 1500
}
```

- **Error 400**:

```json
{ "message": "Invalid token." | "Token already used." | "Token expired." }
```

#### 4.8.2 `POST /api/registration/paystack/:token/init`

- **Auth**: Public
- **Body**: `{}` (no fields).
- **Response 200**:

```json
{
  "authorizationUrl": "https://checkout.paystack.co/...",
  "reference": "REG-<userId>",
  "accessCode": "string"
}
```

> Frontend should redirect to `authorizationUrl`.

#### 4.8.3 `POST /api/registration/paystack/webhook`

- **Auth**: Paystack (verified by signature).
- **Frontend**: Do not call; this is a backend webhook.

---

### 4.9 Admin – Session Management (`/api/admin`)

_All require `protect` + `admin`._

#### 4.9.1 `POST /api/admin/set-session`

- **Description**: Create a new academic session. If `isActive` is true, all other sessions are set to `isActive: false`.
- **Body**:

```json
{
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "isActive": boolean
}
```

- **Response 200**:

```json
{
  "message": "Session created",
  "session": { /* session object */ }
}
```

#### 4.9.2 `GET /api/admin/sessions`

- **Description**: Get all academic sessions, sorted by creation date (newest first).
- **Response 200**: Array of session objects.

#### 4.9.3 `PUT /api/admin/update-session/:id`

- **Description**: Update an existing academic session. If `isActive` is sets to true, all other sessions are deactivated.
- **Body**:

```json
{
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "isActive": boolean
}
```

- **Response 200**:

```json
{
  "message": "Session updated",
  "session": { /* updated session object */ }
}
```

#### 4.9.4 `DELETE /api/admin/delete-session/:id`

- **Description**: Delete an academic session.
- **Response 200**:

```json
{ "message": "Session deleted" }
```

---

## 5. Data Models (Key Fields)

### 5.1 User

Important fields for frontend:

- **Identity & auth**
  - `_id`, `name`, `email`, `role`
- **Program & profile**
  - `phone`, `profession`, `programType`, `profilePicture`, `matric`, `department`, `skills`, `level`
- **Registration & payment**
  - `accountStatus`
  - `paymentStatus`
  - `registrationToken`, `tokenExpiresAt`, `tokenUsed`
  - `paymentReference`
- **Flags**
  - `firstLogin`, `onboardingCompleted`
  - `isRegistered`, `hasPaid`, `isOnboarded`
- **Attendance**
  - `uniqueId`
  - `attendance[]`
- **Subscription**
  - `subscription: { type, startDate, endDate, active }`

### 5.2 Reservation Application

- `fullName`, `email`, `phone`
- `organizationName`
- `eventTitle`
- `eventDate`
- `description`
- `link`
- `referenceId`
- `status`
- `paymentStatus`
- `paymentDeadline`
- `paystack: { reference, authorizationUrl, accessCode }`

### 5.3 BlogPost, Album, Photo

- **BlogPost**: `title`, `slug`, `content`, `excerpt`, `featured_image`, `status`, `published_at`.
- **Album**: `name`, `slug`, `description`, `folder`, `isPublic`, `coverPhoto`, `createdBy`, `createdAt`.
- **Photo**: `album`, `title`, `publicId`, `format`, `width`, `height`, `bytes`.

---

## 6. File Uploads

- Files (images) are uploaded **directly to Cloudinary** from the frontend.
- Backend stores metadata only via:

  - `POST /api/gallery/albums/:albumId/photos`

Fields include Cloudinary `publicId` and optional dimensions.

---

## 7. Error Handling Guide

- Always inspect:
  - `response.status`
  - `response.json().message`
- Typical patterns:
  - `400 { "message": "Validation error" or specific text }`
  - `401 { "message": "Not authorized, no token" }`
  - `403 { "message": "Account is not active", ... }`
  - `404 { "message": "User not found" }`
  - `500 { "message": "Server error", "error": "..." }`

On the frontend:

- Treat `message` as user-facing text.
- Optionally log `error` for debugging.

---

## 8. Frontend Integration Examples

### 8.1 Login & Fetch Authenticated User

```js
// Login
await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Get current user
const res = await fetch('/api/auth/me', {
  credentials: 'include',
});
const user = await res.json();
```

### 8.2 Admin Creates User (Registration Flow)

```js
await fetch('/api/admin/users/manual-create', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08012345678',
    profession: 'Frontend Dev',
    programType: 'Fellowship',
  }),
});
```

### 8.3 Registration Page (Token-Based) + Paystack

```js
const token = routeParams.token;

// Validate token and get display info
const infoRes = await fetch(`/api/registration/token/${token}`);
if (!infoRes.ok) {
  const err = await infoRes.json();
  // show err.message
}
const info = await infoRes.json(); // name, programType, registrationFee

// Start Paystack
const payRes = await fetch(`/api/registration/paystack/${token}/init`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
const { authorizationUrl } = await payRes.json();
window.location.href = authorizationUrl;
```

### 8.4 Forgot & Reset Password

```js
// Forgot password
await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

// On /reset-password/:token page
await fetch(`/api/auth/reset-password/${token}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newPassword }),
});
```

### 8.5 Update Profile

```js
await fetch('/api/users/profile', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Name',
    phone: '08099999999',
    profession: 'Product Designer',
  }),
});
```

---

### 4.9 Ecommerce – Product Management (`/api/products`)

#### 4.9.1 `GET /api/products`

- **Auth**: Public
- **Description**: List products with filtering and pagination.
- **Query parameters** (all optional):
  - `category`: Filter by product category.
  - `tags`: Comma-separated tags (e.g., `featured,new`). Matches any.
  - `minPrice`: Filter by minimum price.
  - `maxPrice`: Filter by maximum price.
  - `search`: Search in name and description (regex).
  - `status`: Filter by status (`available` by default).
  - `page`: Page number (default 1).
  - `limit`: Items per page (default 10).
  - `sort`: Sorting field (default `-createdAt`).

#### 4.9.2 `GET /api/products/:id`

- **Auth**: Public
- **Description**: Get a single product by ID or Slug.

#### 4.9.3 `POST /api/products`

- **Auth**: `protect` + `admin`
- **Description**: Create a new product.
- **Body**:
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "tags": ["string"],
  "images": [
    { "url": "string", "publicId": "string" }
  ],
  "stock": number,
  "status": "draft" | "available" | "out_of_stock" | "discontinued"
}
```

#### 4.9.4 `PUT /api/products/:id`

- **Auth**: `protect` + `admin`
- **Description**: Update an existing product.

#### 4.9.5 `DELETE /api/products/:id`

- **Auth**: `protect` + `admin`
- **Description**: Delete a product and its associated Cloudinary images.

---

## 9. User Registration Flow

When a user clicks a registration link (e.g., `https://your-app.com/registration/[token]`), the following sequence occurs:

1.  **Frontend Landing**: 
    - The frontend extracts the `token` from the URL.
    - It calls `GET /api/registration/token/:token` to validate the link.
    - If valid, it displays user details and the registration fee.

2.  **Initiating Payment**:
    - The user clicks to pay.
    - The frontend calls `POST /api/registration/paystack/:token/init`.
    - The backend returns an `authorizationUrl` (Paystack checkout).
    - The frontend redirects the user to Paystack.

3.  **Payment Completion & Account Activation**:
    - After payment, Paystack notifies the backend via `POST /api/registration/paystack/webhook`.
    - The backend verifies the event and updates the user:
        - `accountStatus` → `'Active'`
        - `paymentStatus` → `'Paid'`
        - `tokenUsed` → `true`

4.  **Final Confirmation Email**:
    - The backend automatically sends an activation email.
    - This email contains the login link (`/login`) and the default temporary password (`Techhubpassword1`).

5.  **First Login**:
    - The user logs in with the temporary password.
    - Because `firstLogin` is `true`, the system requires a mandatory password change before they can access the dashboard.

---

## 10. Multi-Semester Subscription Logic

The system supports two subscription types: `semester` and `session`.

### 10.1 Semester (1 Semester Access)
- User pays for one semester.
- `semestersPaid` is set to `0` after immediate consumption for the current session.
- Access expires at the end of the current active session.

### 10.2 Session (2 Semester Access)
- User pays for two semesters.
- `semestersPaid` is set to `1` after immediate consumption for the first semester.
- **Rollover**: When the admin creates a *new* active session, the first check-in attempt by the user will:
    1. Detect the session change.
    2. Consume the remaining paid semester (`semestersPaid` becomes `0`).
    3. Update the user's `sessionId` and `endDate` to match the new session.
    4. Allow the check-in to proceed.
