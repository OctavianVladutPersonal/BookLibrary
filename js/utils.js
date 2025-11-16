/**
 * Utility Functions
 * Shared validation, formatting, and helper functions
 */

const Utils = {
    /**
     * Clean ISBN by removing spaces, hyphens, and 'ISBN' prefix
     * @param {string} isbn - Raw ISBN string
     * @returns {string} Cleaned ISBN
     */
    cleanISBN(isbn) {
        if (!isbn) return '';
        return isbn
            .replace(/^ISBN/i, '')
            .replace(/[\s\-]/g, '')
            .trim()
            .toUpperCase();
    },

    /**
     * Validate ISBN format (10 or 13 digits, possibly ending with X)
     * @param {string} isbn - ISBN to validate
     * @returns {boolean} True if valid ISBN format
     */
    isValidISBN(isbn) {
        if (!isbn) return false;
        const cleaned = this.cleanISBN(isbn);
        return Constants.ISBN_VALIDATION.test(cleaned);
    },

    /**
     * Extract ISBN from text using multiple patterns
     * @param {string} text - Text containing potential ISBN
     * @returns {string|null} Extracted ISBN or null
     */
    extractISBN(text) {
        if (!text) return null;

        // Try each pattern in order of specificity
        for (const pattern of Object.values(Constants.ISBN_PATTERNS)) {
            const match = text.match(pattern);
            if (match) {
                const cleaned = this.cleanISBN(match[match.length - 1]);
                if (this.isValidISBN(cleaned)) {
                    return cleaned;
                }
            }
        }

        return null;
    },

    /**
     * Extract ISBN from text using lenient pattern
     * @param {string} text - OCR text
     * @returns {string|null} Extracted ISBN or null
     */
    extractISBNLenient(text) {
        if (!text) return null;

        const lenientMatches = text.match(Constants.ISBN_PATTERNS.LENIENT);
        
        if (lenientMatches && lenientMatches.length > 0) {
            // Find the longest sequence and clean it
            const longestSequence = lenientMatches.reduce((a, b) => 
                a.length > b.length ? a : b
            );
            const cleanedISBN = this.cleanISBN(longestSequence);
            
            // Validate it looks like an ISBN
            if (this.isValidISBN(cleanedISBN)) {
                return cleanedISBN;
            }
        }

        return null;
    },

    /**
     * Check if a book already exists in the library
     * @param {string} title - Book title
     * @param {string} author - Book author
     * @param {Array} library - Library array from AppState
     * @returns {boolean} True if book exists
     */
    bookExists(title, author, library) {
        if (!title || !author || !library) return false;
        
        return library.some(book =>
            book.title.toLowerCase() === title.toLowerCase() &&
            book.author.toLowerCase() === author.toLowerCase()
        );
    },

    /**
     * Fetch with timeout wrapper
     * @param {string} url - URL to fetch
     * @param {number} timeoutMs - Timeout in milliseconds
     * @returns {Promise<Response>}
     */
    fetchWithTimeout(url, timeoutMs = Constants.FETCH_TIMEOUT_MS) {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
            )
        ]);
    },

    /**
     * Convert ISBN-13 to ISBN-10
     * @param {string} isbn13 - ISBN-13 string
     * @returns {string|null} ISBN-10 or null if not convertible
     */
    convertISBN13to10(isbn13) {
        const cleaned = this.cleanISBN(isbn13);
        if (cleaned.length === 13 && cleaned.startsWith('978')) {
            return cleaned.substring(3, 12);
        }
        return null;
    },

    /**
     * Truncate API key for display
     * @param {string} key - API key
     * @param {number} prefixLength - Characters to show at start
     * @param {number} suffixLength - Characters to show at end
     * @returns {string} Truncated key
     */
    truncateKey(key, prefixLength = 8, suffixLength = 4) {
        if (!key || key.length <= prefixLength + suffixLength) return key;
        return `${key.substring(0, prefixLength)}...${key.substring(key.length - suffixLength)}`;
    },

    /**
     * Create an HTML status message element
     * @param {string} type - Status type: 'good', 'warn', 'error'
     * @param {string} icon - Icon emoji
     * @param {string} message - Message text
     * @returns {string} HTML string
     */
    createStatusHTML(type, icon, message) {
        const className = `status-${type}`;
        return `<p class="${className}">${icon} ${message}</p>`;
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Encode string for HTML attribute
     * @param {string} str - String to encode
     * @returns {string} Encoded string
     */
    encodeForAttribute(str) {
        if (!str) return '';
        return encodeURIComponent(str);
    },

    /**
     * Decode string from HTML attribute
     * @param {string} str - String to decode
     * @returns {string} Decoded string
     */
    decodeFromAttribute(str) {
        if (!str) return '';
        return decodeURIComponent(str);
    },

    /**
     * Safe parse of potential error response
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>} Parsed error object
     */
    async parseErrorResponse(response) {
        try {
            const data = await response.json();
            return data;
        } catch {
            return { error: { message: 'Unknown error' } };
        }
    },

    /**
     * Format date for display
     * @param {Date|firebase.firestore.Timestamp} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        // Handle Firestore Timestamp
        if (date.toDate && typeof date.toDate === 'function') {
            date = date.toDate();
        }
        
        return date.toLocaleString();
    }
};
