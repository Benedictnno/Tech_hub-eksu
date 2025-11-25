import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    organizationName: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    description: { type: String, required: true },
    link: { type: String, default: null },
    referenceId: { type: String, required: true, unique: true },
    status: { type: String, enum: [
      "Pending",
      "Approved - Awaiting Payment",
      "Approved - Payment Confirmed",
      "Rejected",
      "Cancelled"
    ], default: "Pending" },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paymentDeadline: { type: Date },
    paystack: {
      reference: { type: String },
      authorizationUrl: { type: String },
      accessCode: { type: String }
    }
  },
  { timestamps: true }
)

applicationSchema.index({ eventDate: 1, status: 1 })

export default mongoose.model("Application", applicationSchema)

