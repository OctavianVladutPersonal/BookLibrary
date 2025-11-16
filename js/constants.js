/**
 * Application Constants
 * Centralized configuration values and magic numbers
 */

const Constants = {
    // API Timeouts
    FETCH_TIMEOUT_MS: 8000,
    
    // Camera Configuration
    CAMERA_CONSTRAINTS: {
        video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    },
    
    // Canvas Dimensions
    DEFAULT_CANVAS_WIDTH: 640,
    DEFAULT_CANVAS_HEIGHT: 480,
    
    // Image Quality
    IMAGE_QUALITY: 0.9,
    IMAGE_QUALITY_LOW: 0.85,
    
    // Crop Settings
    CROP_INITIAL_SIZE_RATIO: 0.7,
    CROP_MIN_WIDTH: 50,
    CROP_MIN_HEIGHT: 50,
    
    // Animation Durations
    HIGHLIGHT_DURATION_MS: 3000,
    STATUS_UPDATE_DELAY_MS: 1500,
    
    // ISBN Patterns
    ISBN_PATTERNS: {
        ISBN13_WITH_PREFIX: /ISBN[:\s-]*(97[89][\d\s-]{10}[\dX])/gi,
        ISBN10_WITH_PREFIX: /ISBN[:\s-]*(\d{9}[\dX])/gi,
        ISBN13_NO_PREFIX: /(97[89][\d\s-]{10}[\dX])/gi,
        ISBN10_NO_PREFIX: /\b(\d{9}[\dX])\b/gi,
        LENIENT: /[\d\-\s]{15,20}/g
    },
    
    // Validation Patterns
    ISBN_VALIDATION: /^(?:\d{9}[\dX]|\d{13})$/,
    
    // Barcode Detection
    BARCODE_THRESHOLD: 100,
    BARCODE_MIN_HEIGHT_RATIO: 0.1,
    BARCODE_MIN_WIDTH_RATIO: 0.2,
    
    // API Configuration
    GOOGLE_BOOKS_API: 'https://www.googleapis.com/books/v1/volumes',
    OPEN_LIBRARY_API: 'https://openlibrary.org/api/books',
    OPEN_LIBRARY_SEARCH_API: 'https://openlibrary.org/search.json',
    
    // Search Limits
    SEARCH_RESULT_LIMIT: 5,
    DISPLAY_RESULT_LIMIT: 3,
    
    // Security
    SECURE_PROTOCOLS: ['https:', 'file:'],
    SECURE_HOSTS: ['localhost', '127.0.0.1']
};
