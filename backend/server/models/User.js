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
  duration: {
    type: Number,
    required: true,
    enum: [1, 2],
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
      // unique: true
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
    attendance: [attendanceSchema],
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
    semesterCount: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
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

const User = mongoose.model("Profiles", userSchema, "profiles");

export default User;
