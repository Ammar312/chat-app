import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const USER = mongoose.model("USER", userSchema);
export default USER;
