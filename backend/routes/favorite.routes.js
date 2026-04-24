import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite,
  checkFavorite
} from '../controllers/favorite.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getFavorites);
router.get('/check/:propertyId', checkFavorite);
router.post('/', addFavorite);
router.put('/:id', updateFavorite);
router.delete('/:id', removeFavorite);

export default router;
