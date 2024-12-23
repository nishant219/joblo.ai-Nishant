import express from 'express';
import ProfileController from '../controllers/ProfileController.js';

const router = express.Router();

router.get('/matching-profiles', ProfileController.getMatchingProfiles);


export default router;
