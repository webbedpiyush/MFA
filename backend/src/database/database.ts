import mongoose from "mongoose";


import { config } from "../config/app.config";
const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to mongo database");
  } catch (error) {
    console.log("error connecting to mongo database");
    process.exit(1);
  }
};

export default connectDatabase;
