import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Property from '../models/Property.model.js';
import {
  ensurePropertyCoordinates,
  isValidPropertyCoordinates,
} from '../utils/propertyLocation.js';

dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/real-estate-platform';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const properties = await Property.find({});
  let updated = 0;
  let skipped = 0;

  for (const property of properties) {
    const coords = property.location?.coordinates?.coordinates;
    if (isValidPropertyCoordinates(coords)) {
      skipped++;
      continue;
    }

    const location = property.location?.toObject?.() || property.location;
    const nextLocation = await ensurePropertyCoordinates(location);
    const nextCoords = nextLocation?.coordinates?.coordinates;

    if (!isValidPropertyCoordinates(nextCoords)) {
      console.warn(`Could not geocode: ${property.title}`);
      await delay(1100);
      continue;
    }

    property.location = nextLocation;
    await property.save();
    updated++;
    console.log(`Geocoded "${property.title}" -> [${nextCoords.join(', ')}]`);
    await delay(1100);
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
