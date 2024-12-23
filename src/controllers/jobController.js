import { JobMatcher } from '../services/matching/jobMatcher.js';
import logger from '../config/logger.js';
import { validateSearchParams } from '../utils/validators.js';

class JobController {
  static async getMatchingJobs(req, res) {
    try {
      const { designation, location, skills, employmentType, experience } = req.query;
      
      // Input validation
      const validationResult = validateSearchParams({ designation, location, skills });
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parameters',
          errors: validationResult.errors
        });
      }

      // Parse and sanitize inputs
      const searchCriteria = {
        designation: designation.trim(),
        location: location.trim(),
        skills: skills.split(',').map(skill => skill.trim()),
        employmentType: employmentType?.toUpperCase(),
        experience: experience?.toUpperCase()
      };

      // Get matching jobs with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const matchedJobs = await JobMatcher.findMatchingJobs(searchCriteria, page, limit);

      // Structure the response
      res.json({
        success: true,
        data: {
          jobs: matchedJobs.map(({ job, score }) => ({
            id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            locationDetails: job.locationDetails,
            employmentType: job.employmentType,
            skills: job.skills,
            experienceLevel: job.experienceLevel,
            salary: job.salary,
            postDate: job.postDate,
            sourceUrl: job.sourceUrl,
            matchScore: score
          })),
          pagination: {
            currentPage: page,
            totalItems: matchedJobs.length,
            itemsPerPage: limit
          },
          metadata: {
            searchCriteria: searchCriteria,
            timestamp: new Date()
          }
        }
      });
    } catch (error) {
      logger.error('Error in getMatchingJobs:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

//   static async getJobStats(req, res) {
//     try {
//       const stats = await JobMatcher.getJobStatistics();
//       res.json({
//         success: true,
//         data: stats
//       });
//     } catch (error) {
//       logger.error('Error in getJobStats:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error retrieving job statistics'
//       });
//     }
//   }
}

export default JobController;