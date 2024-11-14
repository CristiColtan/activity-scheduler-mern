import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "Normal User",
    },
    roles: [
      {
        task: { type: Schema.Types.ObjectId, ref: "Task" },
        role: {
          type: String,
          required: true,
          default: "Not assigned yet",
        },
      },
    ],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    gender: {
      type: String,
      default: "Unknown",
    },
    city: {
      type: String,
      default: "Unknown",
    },
    is_admin: {
      type: String,
      required: true,
      default: "No",
    },
    is_active: {
      type: String,
      required: true,
      default: "Yes",
    },
    is_team_manager: {
      type: String,
      required: true,
      default: "No",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
