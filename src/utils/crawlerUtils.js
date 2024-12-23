import logger from '../config/logger.js';

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const extractLocation = (locationString) => {
  try {
    if (!locationString) return null;

    // Remove extra spaces and split by common delimiters
    const parts = locationString.trim().split(/[,\s]+/).filter(Boolean);
    
    // Default structure
    const location = {
      city: '',
      state: '',
      country: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };

    // Basic location parsing logic
    switch (parts.length) {
      case 1:
        location.city = parts[0];
        break;
      case 2:
        location.city = parts[0];
        location.state = parts[1];
        break;
      case 3:
        location.city = parts[0];
        location.state = parts[1];
        location.country = parts[2];
        break;
      default:
        location.city = parts[0] || '';
        location.state = parts[1] || '';
        location.country = parts[parts.length - 1] || '';
    }

    return location;
  } catch (error) {
    logger.error('Error parsing location:', error);
    return null;
  }
};


export const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
};


export const extractSkills = (text) => {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql',
    'aws', 'docker', 'kubernetes', 'mongodb', 'redis', 'typescript'
  ];

  const skills = [];
  const textLower = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      skills.push({
        name: skill,
        required: true
      });
    }
  });

  return skills;
};


export const parseDate = (dateString) => {
  try {
    if (!dateString) return null;
    return new Date(dateString);
  } catch (error) {
    logger.error('Error parsing date:', error);
    return null;
  }
};

