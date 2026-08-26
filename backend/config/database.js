import mongoose from 'mongoose';
import { seedSuperAdmin } from './seed.js';
import { migrateConversationIndexes } from './migrateConversations.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/real-estate-platform"
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedSuperAdmin();
    await migrateConversationIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
