import express from 'express';
import JobController from '../controllers/JobController.js';

const router = express.Router();

router.get('/matching-jobs', JobController.getMatchingJobs);


export default router;
