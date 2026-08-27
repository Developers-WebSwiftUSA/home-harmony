import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import News from '../models/News.model.js';
import { activateScheduledNews } from '../utils/newsLifecycle.js';

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'article';

const uniqueSlug = async (base, excludeId) => {
  let slug = base;
  let i = 2;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await News.findOne(query).select('_id');
    if (!existing) return slug;
    slug = `${base}-${i}`;
    i += 1;
  }
};

const resolvePublishState = ({ publishNow, scheduledAt, existing }) => {
  const now = new Date();
  if (publishNow) {
    return { status: 'active', publishedAt: now };
  }
  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) {
      return { error: 'Please provide a valid schedule date' };
    }
    if (when > now) {
      return { status: 'scheduled', publishedAt: when };
    }
    return { status: 'active', publishedAt: when };
  }
  if (existing) {
    return { status: existing.status, publishedAt: existing.publishedAt };
  }
  return { status: 'active', publishedAt: now };
};

const publicFilter = () => ({
  status: 'active',
  publishedAt: { $lte: new Date() },
});

const serialize = (article) => article;

// @desc    Public news list (active only)
// @route   GET /api/news
// @access  Public
export const getPublicNews = asyncHandler(async (req, res) => {
  await activateScheduledNews();
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
  const articles = await News.find(publicFilter())
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title slug excerpt image category authorName publishedAt status');

  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles,
  });
});

// @desc    Public news article
// @route   GET /api/news/:slug
// @access  Public
export const getPublicNewsBySlug = asyncHandler(async (req, res) => {
  await activateScheduledNews();
  const { slug } = req.params;
  let article = await News.findOne({ slug, ...publicFilter() });
  if (!article && mongoose.Types.ObjectId.isValid(slug) && slug.length === 24) {
    article = await News.findOne({ _id: slug, ...publicFilter() });
  }
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }
  res.status(200).json({ success: true, data: article });
});

// @desc    Admin news list
// @route   GET /api/news/admin
// @access  Private/Admin
export const getAdminNews = asyncHandler(async (req, res) => {
  await activateScheduledNews();
  const { status, limit = 200 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 500);

  const [articles, grouped] = await Promise.all([
    News.find(query).sort({ publishedAt: -1, createdAt: -1 }).limit(parsedLimit).populate('createdBy', 'firstName lastName email'),
    News.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusCounts = grouped.reduce((acc, row) => {
    if (row._id) acc[row._id] = row.count;
    return acc;
  }, {});
  statusCounts.all = grouped.reduce((sum, row) => sum + row.count, 0);
  statusCounts.active = statusCounts.active || 0;
  statusCounts.scheduled = statusCounts.scheduled || 0;
  statusCounts.archived = statusCounts.archived || 0;

  res.status(200).json({
    success: true,
    count: articles.length,
    statusCounts,
    data: articles,
  });
});

// @desc    Admin news article
// @route   GET /api/news/admin/:id
// @access  Private/Admin
export const getAdminNewsById = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id).populate('createdBy', 'firstName lastName email');
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }
  res.status(200).json({ success: true, data: article });
});

// @desc    Create news
// @route   POST /api/news/admin
// @access  Private/Admin
export const createNews = asyncHandler(async (req, res) => {
  const { title, excerpt, content, image, category, authorName, publishNow, scheduledAt } = req.body;
  if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Title, excerpt, and content are required',
    });
  }

  const publishState = resolvePublishState({ publishNow, scheduledAt });
  if (publishState.error) {
    return res.status(400).json({ success: false, message: publishState.error });
  }
  const slug = await uniqueSlug(slugify(title));

  const article = await News.create({
    title: title.trim(),
    slug,
    excerpt: excerpt.trim(),
    content: content.trim(),
    image: image?.trim() || '',
    category: category?.trim() || 'News',
    authorName: authorName?.trim() || 'Admin',
    status: publishState.status,
    publishedAt: publishState.publishedAt,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: serialize(article) });
});

// @desc    Update news
// @route   PUT /api/news/admin/:id
// @access  Private/Admin
export const updateNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }

  const { title, excerpt, content, image, category, authorName, publishNow, scheduledAt, status } = req.body;

  if (title !== undefined) {
    article.title = title.trim();
    article.slug = await uniqueSlug(slugify(title), article._id);
  }
  if (excerpt !== undefined) article.excerpt = excerpt.trim();
  if (content !== undefined) article.content = content.trim();
  if (image !== undefined) article.image = image.trim();
  if (category !== undefined) article.category = category.trim() || 'News';
  if (authorName !== undefined) article.authorName = authorName.trim() || 'Admin';

  if (status === 'archived') {
    article.status = 'archived';
  } else {
    const publishState = resolvePublishState({ publishNow, scheduledAt, existing: article });
    if (publishState.error) {
      return res.status(400).json({ success: false, message: publishState.error });
    }
    article.status = publishState.status;
    article.publishedAt = publishState.publishedAt;
  }

  await article.save();
  res.status(200).json({ success: true, data: article });
});

// @desc    Publish scheduled/archived news now
// @route   PUT /api/news/admin/:id/publish
// @access  Private/Admin
export const publishNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }
  article.status = 'active';
  article.publishedAt = new Date();
  await article.save();
  res.status(200).json({ success: true, data: article });
});

// @desc    Archive news
// @route   PUT /api/news/admin/:id/archive
// @access  Private/Admin
export const archiveNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }
  article.status = 'archived';
  await article.save();
  res.status(200).json({ success: true, data: article });
});

// @desc    Delete news
// @route   DELETE /api/news/admin/:id
// @access  Private/Admin
export const deleteNews = asyncHandler(async (req, res) => {
  const article = await News.findById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: 'News article not found' });
  }
  await article.deleteOne();
  res.status(200).json({ success: true, message: 'News article deleted' });
});
