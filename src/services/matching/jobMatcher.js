import { Job } from '../../models/Job.js';
  class JobMatcher {
    static calculateMatchScore(job, criteria) {
      let score = 0;
      const weights = {
        title: 0.35,
        location: 0.25,
        skills: 0.25,
        employmentType: 0.15
      };
  
      // Title match
      if (job.title.toLowerCase().includes(criteria.designation.toLowerCase())) {
        score += weights.title;
      }
  
      // Location match
      if (job.locationDetails.city.toLowerCase() === criteria.location.toLowerCase()) {
        score += weights.location;
      } else if (job.locationDetails.state.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += weights.location * 0.7;
      }
  
      // Skills match
      if (job.skills && criteria.skills) {
        const skillsMatch = criteria.skills.filter(skill => 
          job.skills.some(jobSkill => jobSkill.name.toLowerCase().includes(skill.toLowerCase()))
        ).length / criteria.skills.length;
        
        score += skillsMatch * weights.skills;
      }
  
      // Employment type match
      if (criteria.employmentType && job.employmentType === criteria.employmentType) {
        score += weights.employmentType;
      }
  
      return parseFloat(score.toFixed(2));
    }
  
    static async findMatchingJobs(criteria) {
      const query = {
        status: 'ACTIVE',
        $text: { $search: criteria.designation }
      };
  
      if (criteria.location) {
        query['locationDetails.city'] = new RegExp(criteria.location, 'i');
      }
  
      const jobs = await Job.find(query)
        .select('-crawlStatus -errorLog')
        .limit(100);
  
      const scoredJobs = jobs.map(job => ({
        job,
        score: this.calculateMatchScore(job, criteria)
      }));
  
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }
  }

export default JobMatcher;