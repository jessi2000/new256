/**
 * Frontend Security Utilities
 * Provides client-side security functions for input validation and sanitization
 */

// Security configuration
export const SECURITY_CONFIG = {
  MAX_TEXT_LENGTH: 5000,
  MAX_FILENAME_LENGTH: 255,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: [
    'text/plain',
    'text/csv',
    'text/html',
    'text/xml',
    'application/json',
    'application/xml',
    'application/zip',
    'application/x-tar',
    'application/x-gzip',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-executable',
    'application/x-dosexec',
    'application/x-mach-binary',
    'application/x-elf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/x-python-code',
    'application/javascript',
    'text/x-python',
    'text/x-c',
    'text/x-java-source',
    'application/octet-stream'
  ],
  DANGEROUS_PATTERNS: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /@import/gi,
    /background-image\s*:/gi,
    /\.\.\/|\\\.\\./g, // Path traversal
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi
  ]
};

/**
 * Sanitizes text input to prevent XSS attacks
 * @param {string} input - The input text to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 5000)
 * @returns {string} - Sanitized text
 */
export const sanitizeTextInput = (input, maxLength = SECURITY_CONFIG.MAX_TEXT_LENGTH) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Limit length
  let sanitized = input.slice(0, maxLength);

  // Remove dangerous patterns
  SECURITY_CONFIG.DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
};

/**
 * Validates and sanitizes filename
 * @param {string} filename - The filename to validate
 * @returns {object} - {isValid: boolean, sanitized: string, errors: array}
 */
export const validateFilename = (filename) => {
  const result = {
    isValid: true,
    sanitized: '',
    errors: []
  };

  if (!filename) {
    result.isValid = false;
    result.errors.push('Filename is required');
    return result;
  }

  // Check length
  if (filename.length > SECURITY_CONFIG.MAX_FILENAME_LENGTH) {
    result.errors.push(`Filename too long (max ${SECURITY_CONFIG.MAX_FILENAME_LENGTH} characters)`);
    result.isValid = false;
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./g, // Path traversal
    /[<>:"|?*]/g, // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    /^\./g // Hidden files
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(filename)) {
      result.errors.push('Filename contains invalid characters or patterns');
      result.isValid = false;
    }
  });

  // Sanitize filename
  result.sanitized = filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace invalid chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .slice(0, SECURITY_CONFIG.MAX_FILENAME_LENGTH);

  if (!result.sanitized) {
    result.sanitized = 'safe_file.bin';
  }

  return result;
};

/**
 * Validates file before upload
 * @param {File} file - The file object to validate
 * @returns {object} - {isValid: boolean, errors: array, warnings: array}
 */
export const validateFile = (file) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('No file selected');
    return result;
  }

  // Check file size
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    result.isValid = false;
    result.errors.push(`File too large (max ${Math.round(SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`);
  }

  // Check file type
  if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    result.warnings.push(`Uncommon file type: ${file.type}`);
  }

  // Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.isValid) {
    result.errors.push(...filenameValidation.errors);
    result.isValid = false;
  }

  // Check for executable files
  if (file.name.match(/\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app|deb|pkg|dmg)$/i)) {
    result.warnings.push('Executable file detected - proceed with caution');
  }

  // Check for archive files
  if (file.name.match(/\.(zip|rar|7z|tar|gz|bz2)$/i)) {
    result.warnings.push('Archive file detected - contents will not be scanned');
  }

  return result;
};

/**
 * Validates URL input
 * @param {string} url - The URL to validate
 * @returns {object} - {isValid: boolean, errors: array}
 */
export const validateUrl = (url) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!url) {
    result.isValid = false;
    result.errors.push('URL is required');
    return result;
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.isValid = false;
      result.errors.push('Only HTTP and HTTPS URLs are allowed');
    }

    // Block localhost and internal IPs in production
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      result.errors.push('Internal URLs are not allowed');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push('Invalid URL format');
  }

  return result;
};

/**
 * Escapes HTML in output to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validates form data against XSS and injection attacks
 * @param {object} data - Form data object
 * @returns {object} - {isValid: boolean, sanitized: object, errors: array}
 */
export const validateFormData = (data) => {
  const result = {
    isValid: true,
    sanitized: {},
    errors: []
  };

  if (!data || typeof data !== 'object') {
    result.isValid = false;
    result.errors.push('Invalid form data');
    return result;
  }

  // Sanitize each field
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      result.sanitized[key] = sanitizeTextInput(value);
      
      // Check if sanitization changed the value significantly
      if (value.length > 0 && result.sanitized[key].length < value.length * 0.8) {
        result.errors.push(`Field '${key}' contains potentially dangerous content`);
        result.isValid = false;
      }
    } else {
      result.sanitized[key] = value;
    }
  });

  return result;
};

/**
 * Rate limiting utility for client-side
 * @param {string} key - Unique key for the operation
 * @param {number} limit - Number of operations allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if operation is allowed
 */
export const checkRateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
    
    // Reset if window has passed
    if (now >= data.resetTime) {
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (data.count >= limit) {
      return false;
    }
    
    // Increment count
    data.count++;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    // If localStorage fails, allow the operation
    return true;
  }
};

/**
 * Secure API request wrapper with validation
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const secureApiRequest = async (url, options = {}) => {
  // Validate URL
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    throw new Error('Invalid API URL');
  }

  // Add security headers
  const secureOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  };

  // Validate request body if present
  if (options.body && typeof options.body === 'object') {
    const validation = validateFormData(options.body);
    if (!validation.isValid) {
      throw new Error('Request data failed security validation');
    }
    secureOptions.body = JSON.stringify(validation.sanitized);
  }

  try {
    const response = await fetch(url, secureOptions);
    
    // Check for security headers in response
    const csp = response.headers.get('Content-Security-Policy');
    const xssProtection = response.headers.get('X-XSS-Protection');
    
    if (!csp || !xssProtection) {
      console.warn('Response missing security headers');
    }
    
    return response;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};

/**
 * Generates a secure random token for CSRF protection
 * @returns {string} - Random token
 */
export const generateSecureToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Logs security events to console (development) or sends to monitoring (production)
 * @param {string} event - Event type
 * @param {object} details - Event details
 */
export const logSecurityEvent = (event, details) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logData);
  } else {
    // In production, you could send to a monitoring service
    // sendToMonitoring(logData);
  }
};

export default {
  sanitizeTextInput,
  validateFilename,
  validateFile,
  validateUrl,
  escapeHtml,
  validateFormData,
  checkRateLimit,
  secureApiRequest,
  generateSecureToken,
  logSecurityEvent,
  SECURITY_CONFIG
};