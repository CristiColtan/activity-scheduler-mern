import mongoose, { Schema } from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: new Date(),
    },
    priority: {
      type: String,
      required: true,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "to do",
      enum: ["to do", "in progress", "completed"],
      required: true,
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "commented",
            "completed",
            "assigned",
            "started",
            "in progress",
            "bug",
          ],
        },
        description: {
          type: String,
        },
        date: {
          type: Date,
          default: new Date(),
        },
        by: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    subtasks: [
      {
        title: {
          type: String,
        },
        date: {
          type: Date,
        },
        tag: {
          type: String,
        },
      },
    ],
    asseturls: {
      type: Array,
    },
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    is_trashed: {
      type: String,
      default: "No",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
