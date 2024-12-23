import { Profile } from '../../models/Profile.js';

  class ProfileMatcher {
    static calculateMatchScore(profile, criteria) {
      let score = 0;
      const weights = {
        designation: 0.3,
        company: 0.25,
        location: 0.25,
        skills: 0.2
      };
  
      // Title/designation match
      if (profile.headline.toLowerCase().includes(criteria.designation.toLowerCase()) ||
          profile.currentPosition?.title.toLowerCase().includes(criteria.designation.toLowerCase())) {
        score += weights.designation;
      }
  
      // Company match
      if (profile.currentPosition?.company.toLowerCase().includes(criteria.company.toLowerCase())) {
        score += weights.company;
      }
  
      // Location match
      if (profile.locationDetails.city.toLowerCase() === criteria.location.toLowerCase()) {
        score += weights.location;
      } else if (profile.locationDetails.state.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += weights.location * 0.7;
      }
  
      // Skills match
      if (profile.skills && criteria.skills) {
        const skillsMatch = criteria.skills.filter(skill => 
          profile.skills.some(profileSkill => 
            profileSkill.name.toLowerCase().includes(skill.toLowerCase())
          )
        ).length / criteria.skills.length;
        
        score += skillsMatch * weights.skills;
      }
  
      return parseFloat(score.toFixed(2));
    }
  
    static async findMatchingProfiles(criteria) {
      const query = {
        'crawlStatus.isActive': true,
        $text: { 
          $search: `${criteria.designation} ${criteria.company}`
        }
      };
  
      if (criteria.location) {
        query['locationDetails.city'] = new RegExp(criteria.location, 'i');
      }
  
      const profiles = await Profile.find(query)
        .select('-crawlStatus -errorLog')
        .sort({ profileScore: -1 })
        .limit(100);
  
      const scoredProfiles = profiles.map(profile => ({
        profile,
        score: this.calculateMatchScore(profile, criteria)
      }));
  
      return scoredProfiles
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }
  }
  

export default ProfileMatcher;