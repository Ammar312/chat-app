import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    // fromName: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    // },
    // fromEmail: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    //   unique: false,
    // },
    // // isRead: {
    // //   default: false,
    // // },
    // from_id: {
    //   type: String,
    //   required: true,
    // },
    conversationId: {
      type: String,
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    to_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true }
);

// messageSchema.index({ fromEmail: 1 }, { unique: false });

const Message = mongoose.model("message", messageSchema);
export default Message;
