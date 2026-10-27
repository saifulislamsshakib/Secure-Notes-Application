import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true, name: "user_email_unique" });

userSchema.index(
  { createdAt: -1, _id: -1 },
  { name: "user_createdAt_id_desc" },
);

const User = mongoose.model("User", userSchema);

export default User;
