import { Router } from 'express';
import { pollController } from '../controllers/pollController.js';

export const pollRouter = Router();

pollRouter.get('/current', (req, res) => pollController.getCurrentPoll(req, res));
pollRouter.get('/history', (req, res) => pollController.getHistory(req, res));
pollRouter.post('/', (req, res) => pollController.createPoll(req, res));

