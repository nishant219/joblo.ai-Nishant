export const validateSearchParams = ({ designation, location, skills }) => {
    const errors = [];
    
    // Validate designation
    if (!designation) {
      errors.push('Designation is required');
    } else if (typeof designation !== 'string') {
      errors.push('Designation must be a string');
    } else if (designation.trim().length < 2) {
      errors.push('Designation must be at least 2 characters long');
    } else if (designation.trim().length > 100) {
      errors.push('Designation must not exceed 100 characters');
    }
  
    // Validate location
    if (!location) {
      errors.push('Location is required');
    } else if (typeof location !== 'string') {
      errors.push('Location must be a string');
    } else if (location.trim().length < 2) {
      errors.push('Location must be at least 2 characters long');
    } else if (location.trim().length > 100) {
      errors.push('Location must not exceed 100 characters');
    }
  
    // Validate skills
    if (skills) {
      if (typeof skills !== 'string') {
        errors.push('Skills must be a comma-separated string');
      } else {
        const skillsArray = skills.split(',');
        if (skillsArray.some(skill => skill.trim().length < 2)) {
          errors.push('Each skill must be at least 2 characters long');
        }
        if (skillsArray.length > 20) {
          errors.push('Maximum 20 skills allowed');
        }
      }
    }
  
    return {
      success: errors.length === 0,
      errors
    };
  };
  

  export const validateProfileSearchParams = ({ designation, location, company }) => {
    const errors = [];
  
    // Validate designation
    if (!designation) {
      errors.push('Designation is required');
    } else if (typeof designation !== 'string') {
      errors.push('Designation must be a string');
    } else if (designation.trim().length < 2) {
      errors.push('Designation must be at least 2 characters long');
    } else if (designation.trim().length > 100) {
      errors.push('Designation must not exceed 100 characters');
    }
  
    // Validate location
    if (!location) {
      errors.push('Location is required');
    } else if (typeof location !== 'string') {
      errors.push('Location must be a string');
    } else if (location.trim().length < 2) {
      errors.push('Location must be at least 2 characters long');
    } else if (location.trim().length > 100) {
      errors.push('Location must not exceed 100 characters');
    }
  
    // Validate company
    if (!company) {
      errors.push('Company is required');
    } else if (typeof company !== 'string') {
      errors.push('Company must be a string');
    } else if (company.trim().length < 2) {
      errors.push('Company must be at least 2 characters long');
    } else if (company.trim().length > 100) {
      errors.push('Company must not exceed 100 characters');
    }
  
    return {
      success: errors.length === 0,
      errors
    };
  };
  

  export const validatePaginationParams = ({ page, limit }) => {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
    return {
      page: validatedPage,
      limit: validatedLimit,
      skip: (validatedPage - 1) * validatedLimit
    };
  };
  

  export const validateSortParams = (sortBy = 'createdAt', sortOrder = 'desc') => {
    const allowedSortFields = ['createdAt', 'title', 'company', 'location'];
    const allowedSortOrders = ['asc', 'desc'];
  
    return {
      sortBy: allowedSortFields.includes(sortBy) ? sortBy : 'createdAt',
      sortOrder: allowedSortOrders.includes(sortOrder) ? sortOrder : 'desc'
    };
  };
  
  export const sanitizeSearchText = (text) => {
    if (!text) return '';
    return text
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ');
  };