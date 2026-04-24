import express from 'express';
import { getPublicAgents, getPublicAgent } from '../controllers/agent.controller.js';

const router = express.Router();

router.get('/', getPublicAgents);
router.get('/:id', getPublicAgent);

export default router;
