import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Upload single image
// @route   POST /api/uploads/image
// @access  Private (seller/agent/admin)
export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided",
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    data: {
      url: imageUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

