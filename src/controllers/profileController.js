import { ProfileMatcher } from '../services/matching/profileMatcher.js';
import logger from '../config/logger.js';
import { validateProfileSearchParams } from '../utils/validators.js';

class ProfileController {
  static async getMatchingProfiles(req, res) {
    try {
      const { 
        designation, 
        location, 
        company, 
        skills, 
        experienceYears,
        industry 
      } = req.query;

      // Input validation
      const validationResult = validateProfileSearchParams({
        designation,
        location,
        company
      });
      
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
        company: company.trim(),
        skills: skills?.split(',').map(skill => skill.trim()),
        experienceYears: parseInt(experienceYears) || undefined,
        industry: industry?.trim()
      };

      // Get matching profiles with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const matchedProfiles = await ProfileMatcher.findMatchingProfiles(
        searchCriteria,
        page,
        limit
      );

      // Structure the response
      res.json({
        success: true,
        data: {
          profiles: matchedProfiles.map(({ profile, score }) => ({
            id: profile._id,
            name: profile.name,
            headline: profile.headline,
            location: profile.location,
            locationDetails: profile.locationDetails,
            currentPosition: {
              title: profile.currentPosition.title,
              company: profile.currentPosition.company
            },
            skills: profile.skills.map(skill => ({
              name: skill.name,
              endorsements: skill.endorsements
            })),
            experience: profile.experience.map(exp => ({
              title: exp.title,
              company: exp.company,
              duration: exp.duration
            })),
            profileScore: profile.profileScore,
            matchScore: score,
            sourceUrl: profile.sourceUrl
          })),
          pagination: {
            currentPage: page,
            totalItems: matchedProfiles.length,
            itemsPerPage: limit
          },
          metadata: {
            searchCriteria: searchCriteria,
            timestamp: new Date()
          }
        }
      });
    } catch (error) {
      logger.error('Error in getMatchingProfiles:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


}


export default ProfileController;
