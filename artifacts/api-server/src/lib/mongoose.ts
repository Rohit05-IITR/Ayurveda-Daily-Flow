import mongoose from "mongoose";
import { logger } from "./logger";

const MONGO_URI =
  "mongodb+srv://rohitmalviya0516_db_user:DincharyaIKO103@dincharayuserinfo.z7jtocz.mongodb.net/dincharya";

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB Connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }
}
