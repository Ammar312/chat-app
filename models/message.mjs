import mongoose, { Schema, Types } from "mongoose";

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
      type: Schema.Types.ObjectId,
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "USER",
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
  { timestamps: true }
);

// messageSchema.index({ fromEmail: 1 }, { unique: false });

const Message = mongoose.model("message", messageSchema);
export default Message;
