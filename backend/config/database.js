import mongoose from 'mongoose';
import { ensureSuperAdmin } from '../utils/ensureSuperAdmin.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/real-estate-platform"
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureSuperAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
