import mongoose, { Schema, model } from "mongoose";
const conversationSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "USER",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Conversation = model("Conversation", conversationSchema);
export default Conversation;
