#!/usr/bin/env node
/**
 * Standalone seed (e.g. `npm run seed:superadmin`). Exits 0 even if DB is unavailable.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedSuperAdmin } from '../config/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnv = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: repoRootEnv });
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/real-estate-platform';

try {
  await mongoose.connect(uri);
  await seedSuperAdmin();
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.warn('[seedSuperAdmin] Skipped (no DB or error):', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(0);
}
