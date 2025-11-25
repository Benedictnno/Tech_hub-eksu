import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
    default: null,
  },
  checkOut: {
    type: Date,
    default: null,
  },
  autoCheckout: {
    type: Boolean,
    default: false,
  },
});

const subscriptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["semester", "session"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    uniqueId: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isRegistered: {
      type: Boolean,
      default: true,
    },
    hasPaid: {
      type: Boolean,
      default: false,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    subscription: subscriptionSchema,
    attendance:{type: [attendanceSchema],
    default: [] 

    },
    qrCode: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    matric: {
      type: String,
      // required: true
    },
    membershipType: {
      type: String,
      // required: true
    },
    department: {
      type: String,
      // required: true
    },
    phone: {
      type: String,
      // required: true
    },

    skills: {
      type: [String],
      default: [],
    },

    level: {
      type: String,
      // required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
     
    },
    profession: {
      type: String,
    },
    programType: {
      type: String,
      enum: ["Fellowship", "Pre-Fellowship"],
    },
    accountStatus: {
      type: String,
      enum: ["Pending Payment", "Active", "Suspended"],
      default: "Pending Payment",
    },
    registrationToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    tokenExpiresAt: {
      type: Date,
    },
    tokenUsed: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentReference: {
      type: String,
    },
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profiles",
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if subscription is active
userSchema.methods.hasActiveSubscription = function () {
  if (!this.subscription) return false;

  const now = new Date();
  return this.subscription.active && now <= this.subscription.endDate;
};

userSchema.index({ 'attendance.date': 1 });

const User = mongoose.model("Profiles", userSchema, "profiles");

export default User;
