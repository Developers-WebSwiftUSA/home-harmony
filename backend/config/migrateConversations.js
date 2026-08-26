import Conversation from '../models/Conversation.model.js';
import { buildDirectKey } from '../utils/conversationKey.js';

export const migrateConversationIndexes = async () => {
  const collection = Conversation.collection;

  try {
    await collection.dropIndex('participants_1_propertyId_1');
    console.log('Dropped legacy conversations index participants_1_propertyId_1');
  } catch (error) {
    if (error?.codeName !== 'IndexNotFound' && error?.code !== 27) {
      console.warn('Could not drop legacy conversation index:', error.message);
    }
  }

  const missingKey = await Conversation.find({
    $or: [{ directKey: null }, { directKey: { $exists: false } }],
    participants: { $size: 2 }
  });

  for (const conversation of missingKey) {
    const directKey = buildDirectKey(conversation.participants, conversation.propertyId);
    if (!directKey) continue;

    const duplicate = await Conversation.findOne({
      _id: { $ne: conversation._id },
      directKey
    }).select('_id');

    if (duplicate) {
      console.warn(
        `Skipping directKey backfill for conversation ${conversation._id}; duplicate ${duplicate._id} exists`
      );
      continue;
    }

    conversation.directKey = directKey;
    await conversation.save();
  }
};
