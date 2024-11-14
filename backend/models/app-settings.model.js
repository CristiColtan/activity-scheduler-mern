import mongoose, { Schema } from "mongoose";

const AppSettingsSchema = new mongoose.Schema({
  roles: [
    {
      type: String,
    },
  ],
});

const AppSettings = mongoose.model("AppSettings", AppSettingsSchema);

export default AppSettings;
