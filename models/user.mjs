import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
    imgPublicId: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.index({ username: "text", email: "text" });
const USER = mongoose.model("USER", userSchema);
export default USER;
