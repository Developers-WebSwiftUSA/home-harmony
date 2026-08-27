import express from 'express';
import {
  getPublicNews,
  getPublicNewsBySlug,
  getAdminNews,
  getAdminNewsById,
  createNews,
  updateNews,
  publishNews,
  archiveNews,
  deleteNews,
} from '../controllers/news.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getPublicNews);
router.get('/admin', protect, authorize('admin'), getAdminNews);
router.post('/admin', protect, authorize('admin'), createNews);
router.get('/admin/:id', protect, authorize('admin'), getAdminNewsById);
router.put('/admin/:id', protect, authorize('admin'), updateNews);
router.put('/admin/:id/publish', protect, authorize('admin'), publishNews);
router.put('/admin/:id/archive', protect, authorize('admin'), archiveNews);
router.delete('/admin/:id', protect, authorize('admin'), deleteNews);
router.get('/:slug', getPublicNewsBySlug);

export default router;
