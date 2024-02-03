import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    fromName: {
      type: String,
      required: true,
      lowercase: true,
    },
    fromEmail: {
      type: String,
      required: true,
      lowercase: true,
      unique: false,
    },
    // isRead: {
    //   default: false,
    // },
    from_id: {
      type: String,
      required: true,
    },
    to_id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamp: true }
);

messageSchema.index({ fromEmail: 1 }, { unique: false });

const Message = mongoose.model("message", messageSchema);
export default Message;
