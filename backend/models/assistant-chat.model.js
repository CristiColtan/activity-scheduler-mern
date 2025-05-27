import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const assistantChatSchema = new mongoose.Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messageSchema],
});

assistantChatSchema.index({ taskId: 1, userId: 1 }, { unique: true });

const AssistantChat = mongoose.model("AssistantChat", assistantChatSchema);

export default AssistantChat;
