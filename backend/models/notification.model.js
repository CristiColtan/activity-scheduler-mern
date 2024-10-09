import mongoose, { Schema } from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: "alert",
      enum: ["alert", "message"],
    },
    text: {
      type: String,
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    sent_to: [{ type: Schema.Types.ObjectId, ref: "User" }],
    read_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
