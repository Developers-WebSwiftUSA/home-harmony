import asyncHandler from '../middleware/asyncHandler.js';
import Favorite from '../models/Favorite.model.js';
import Property from '../models/Property.model.js';

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user.id })
    .populate('propertyId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: favorites.length,
    data: favorites
  });
});

// @desc    Add to favorites
// @route   POST /api/favorites
// @access  Private
export const addFavorite = asyncHandler(async (req, res) => {
  const { propertyId, notes, alerts } = req.body;

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    userId: req.user.id,
    propertyId
  });

  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: 'Property already in favorites'
    });
  }

  const favorite = await Favorite.create({
    userId: req.user.id,
    propertyId,
    notes,
    alerts: alerts || {
      priceDrop: false,
      statusChange: false,
      newImages: false
    }
  });

  // Update property favorites count
  property.favorites += 1;
  await property.save();

  const populatedFavorite = await Favorite.findById(favorite._id)
    .populate('propertyId');

  res.status(201).json({
    success: true,
    data: populatedFavorite
  });
});

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
export const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findById(req.params.id);

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  if (favorite.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  // Update property favorites count
  const property = await Property.findById(favorite.propertyId);
  if (property && property.favorites > 0) {
    property.favorites -= 1;
    await property.save();
  }

  await favorite.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Removed from favorites'
  });
});

// @desc    Update favorite
// @route   PUT /api/favorites/:id
// @access  Private
export const updateFavorite = asyncHandler(async (req, res) => {
  const { notes, alerts } = req.body;

  const favorite = await Favorite.findById(req.params.id);

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  if (favorite.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (notes !== undefined) favorite.notes = notes;
  if (alerts) favorite.alerts = { ...favorite.alerts, ...alerts };

  await favorite.save();

  const populatedFavorite = await Favorite.findById(favorite._id)
    .populate('propertyId');

  res.status(200).json({
    success: true,
    data: populatedFavorite
  });
});

// @desc    Check if property is favorited
// @route   GET /api/favorites/check/:propertyId
// @access  Private
export const checkFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({
    userId: req.user.id,
    propertyId: req.params.propertyId
  });

  res.status(200).json({
    success: true,
    isFavorited: !!favorite,
    data: favorite
  });
});
