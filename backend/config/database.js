import mongoose from 'mongoose';
import { seedSuperAdmin, seedSampleNews } from './seed.js';
import { migrateConversationIndexes } from './migrateConversations.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Copy .env.example to the repo root as .env and use the Atlas mongodb+srv:// URI."
      );
    }
    if (/127\.0\.0\.1|localhost/i.test(uri)) {
      console.warn(
        "MONGODB_URI points at local MongoDB. Atlas should look like mongodb+srv://...mongodb.net/..."
      );
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedSuperAdmin();
    await seedSampleNews();
    await migrateConversationIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
