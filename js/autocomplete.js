/**
 * Autocomplete Module
 * Provides autocomplete suggestions for book titles and authors using Open Library API
 */

const Autocomplete = {
    // Track active autocomplete dropdowns
    activeDropdown: null,
    // Debounce timer
    debounceTimer: null,
    // Current abort controller for canceling requests
    currentController: null,
    // Track last selected values to prevent re-showing dropdown
    lastSelectedValues: new Map(),

    /**
     * Initialize autocomplete for a specific input field
     * @param {HTMLInputElement} inputElement - The input element to attach autocomplete to
     * @param {HTMLElement} dropdownElement - The dropdown container for suggestions
     * @param {string} field - The field type ('title' or 'author')
     */
    init(inputElement, dropdownElement, field) {
        if (!inputElement || !dropdownElement) return;

        // Add input event listener with debouncing
        inputElement.addEventListener('input', (e) => {
            this.handleInput(e.target, dropdownElement, field);
        });

        // Add focus event to show suggestions
        inputElement.addEventListener('focus', (e) => {
            this.handleFocus(e.target, dropdownElement, field);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !dropdownElement.contains(e.target)) {
                this.hideDropdown(dropdownElement);
            }
        });

        // Handle keyboard navigation
        inputElement.addEventListener('keydown', (e) => {
            this.handleKeyboard(e, dropdownElement, inputElement);
        });
    },

    /**
     * Handle input event and show suggestions with debouncing
     */
    handleInput(inputElement, dropdownElement, field) {
        const query = inputElement.value.trim();

        // Check if this is the last selected value - don't show dropdown
        const lastSelected = this.lastSelectedValues.get(inputElement);
        if (lastSelected && lastSelected === query) {
            this.hideDropdown(dropdownElement);
            return;
        }

        if (query.length < 2) {
            this.hideDropdown(dropdownElement);
            return;
        }

        // Cancel previous request if exists
        if (this.currentController) {
            this.currentController.abort();
        }

        // Clear existing debounce timer
        clearTimeout(this.debounceTimer);

        // Show loading state
        this.showLoading(dropdownElement);

        // Debounce the API call
        this.debounceTimer = setTimeout(() => {
            this.getSuggestions(query, field, dropdownElement, inputElement);
        }, 300);
    },

    /**
     * Handle focus event - for title field, show author's books if author is selected
     */
    handleFocus(inputElement, dropdownElement, field) {
        const query = inputElement.value.trim();
        
        // If title field and author is filled, show author's books
        if (field === 'title' && !query) {
            const authorValue = DOM.authorNameInput?.value.trim();
            if (authorValue) {
                this.showLoading(dropdownElement);
                this.getBooksByAuthor(authorValue, dropdownElement, inputElement);
                return;
            }
        }
        
        // Otherwise show normal suggestions if there's text
        if (query.length >= 2) {
            this.handleInput(inputElement, dropdownElement, field);
        }
    },

    /**
     * Get books by a specific author
     */
    async getBooksByAuthor(authorName, dropdownElement, inputElement) {
        try {
            // Create new abort controller
            this.currentController = new AbortController();
            
            // Search Google Books for this author
            const url = `${Constants.GOOGLE_BOOKS_API}?q=inauthor:${encodeURIComponent(authorName)}&maxResults=15`;
            const response = await fetch(url, { 
                signal: this.currentController.signal 
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const suggestions = this.parseGoogleBooksSuggestions(data, 'title');
            
            // Filter to only show books by this specific author (case-insensitive match)
            const authorLower = authorName.toLowerCase();
            const filteredSuggestions = suggestions.filter(book => 
                book.author && book.author.toLowerCase().includes(authorLower)
            );
            
            this.showSuggestions(filteredSuggestions, dropdownElement, inputElement, 'title');
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error fetching books by author:', error);
            this.showError(dropdownElement);
        }
    },

    /**
     * Get suggestions from Google Books and Open Library APIs
     */
    async getSuggestions(query, field, dropdownElement, inputElement) {
        try {
            // Create new abort controller
            this.currentController = new AbortController();
            
            let suggestions = [];
            
            // Try Google Books first (faster and more comprehensive)
            try {
                if (field === 'title') {
                    const url = `${Constants.GOOGLE_BOOKS_API}?q=intitle:${encodeURIComponent(query)}&maxResults=10`;
                    const response = await fetch(url, { 
                        signal: this.currentController.signal 
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        suggestions = this.parseGoogleBooksSuggestions(data, field);
                    }
                } else {
                    const url = `${Constants.GOOGLE_BOOKS_API}?q=inauthor:${encodeURIComponent(query)}&maxResults=10`;
                    const response = await fetch(url, { 
                        signal: this.currentController.signal 
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        suggestions = this.parseGoogleBooksSuggestions(data, field);
                    }
                }
            } catch (error) {
                console.warn('Google Books API failed, trying Open Library:', error.message);
            }
            
            // If Google Books didn't return enough results, try Open Library as fallback
            if (suggestions.length < 3) {
                try {
                    let url;
                    if (field === 'title') {
                        url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`;
                    } else {
                        url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(query)}&limit=10`;
                    }
                    
                    const response = await fetch(url, { 
                        signal: this.currentController.signal 
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const openLibSuggestions = this.parseOpenLibrarySuggestions(data, field);
                        
                        // Merge and deduplicate
                        suggestions = this.mergeSuggestions(suggestions, openLibSuggestions, field);
                    }
                } catch (error) {
                    console.warn('Open Library API also failed:', error.message);
                }
            }
            
            this.showSuggestions(suggestions, dropdownElement, inputElement, field);
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error fetching suggestions:', error);
            this.showError(dropdownElement);
        }
    },

    /**
     * Parse Google Books API response
     */
    parseGoogleBooksSuggestions(data, field) {
        const results = [];

        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const volumeInfo = item.volumeInfo;
                
                if (field === 'title' && volumeInfo.title) {
                    results.push({
                        title: volumeInfo.title,
                        author: volumeInfo.authors && volumeInfo.authors.length > 0 
                            ? volumeInfo.authors[0] 
                            : null
                    });
                } else if (field === 'author' && volumeInfo.authors) {
                    volumeInfo.authors.forEach(author => {
                        if (author) results.push(author);
                    });
                }
            });
        }

        if (field === 'title') {
            const uniqueTitles = new Map();
            results.forEach(item => {
                if (!uniqueTitles.has(item.title)) {
                    uniqueTitles.set(item.title, item);
                }
            });
            return Array.from(uniqueTitles.values()).slice(0, 8);
        }

        return [...new Set(results)].slice(0, 8);
    },

    /**
     * Parse Open Library API response
     */
    parseOpenLibrarySuggestions(data, field) {
        const results = [];

        if (field === 'title') {
            if (data.docs && data.docs.length > 0) {
                data.docs.forEach(book => {
                    if (book.title) {
                        results.push({
                            title: book.title,
                            author: book.author_name ? book.author_name[0] : null
                        });
                    }
                });
            }
        } else {
            if (data.docs && data.docs.length > 0) {
                data.docs.forEach(author => {
                    if (author.name) {
                        results.push(author.name);
                    }
                });
            }
        }

        if (field === 'title') {
            const uniqueTitles = new Map();
            results.forEach(item => {
                if (!uniqueTitles.has(item.title)) {
                    uniqueTitles.set(item.title, item);
                }
            });
            return Array.from(uniqueTitles.values());
        }

        return [...new Set(results)];
    },

    /**
     * Merge suggestions from multiple sources and remove duplicates
     */
    mergeSuggestions(googleSuggestions, openLibSuggestions, field) {
        if (field === 'title') {
            const merged = new Map();
            
            // Add Google Books results first (higher priority)
            googleSuggestions.forEach(item => {
                merged.set(item.title.toLowerCase(), item);
            });
            
            // Add Open Library results if not duplicate
            openLibSuggestions.forEach(item => {
                if (!merged.has(item.title.toLowerCase())) {
                    merged.set(item.title.toLowerCase(), item);
                }
            });
            
            return Array.from(merged.values()).slice(0, 8);
        } else {
            // For authors, simple string deduplication
            const merged = new Set([...googleSuggestions, ...openLibSuggestions]);
            return Array.from(merged).slice(0, 8);
        }
    },

    /**
     * Display suggestions in dropdown
     */
    showSuggestions(suggestions, dropdownElement, inputElement, field) {
        if (suggestions.length === 0) {
            this.showNoResults(dropdownElement);
            return;
        }

        dropdownElement.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            
            // For titles, store author data
            if (field === 'title' && typeof suggestion === 'object') {
                item.textContent = suggestion.title;
                item.dataset.index = index;
                if (suggestion.author) {
                    item.dataset.author = suggestion.author;
                }
            } else {
                item.textContent = suggestion;
                item.dataset.index = index;
            }

            // Handle click
            item.addEventListener('click', () => {
                if (field === 'title' && item.dataset.author) {
                    inputElement.value = item.textContent;
                    // Store selected value
                    this.lastSelectedValues.set(inputElement, item.textContent);
                    // Auto-fill author field
                    const authorInput = DOM.authorNameInput;
                    if (authorInput && !authorInput.value.trim()) {
                        authorInput.value = item.dataset.author;
                        this.lastSelectedValues.set(authorInput, item.dataset.author);
                    }
                } else {
                    inputElement.value = item.textContent;
                    // Store selected value
                    this.lastSelectedValues.set(inputElement, item.textContent);
                }
                this.hideDropdown(dropdownElement);
                inputElement.focus();
            });

            // Handle hover
            item.addEventListener('mouseenter', () => {
                this.clearHighlight(dropdownElement);
                item.classList.add('autocomplete-active');
            });

            dropdownElement.appendChild(item);
        });

        dropdownElement.style.display = 'block';
        this.activeDropdown = dropdownElement;
    },

    /**
     * Show loading state
     */
    showLoading(dropdownElement) {
        dropdownElement.innerHTML = '<div class="autocomplete-item autocomplete-loading">Searching...</div>';
        dropdownElement.style.display = 'block';
        this.activeDropdown = dropdownElement;
    },

    /**
     * Show no results message
     */
    showNoResults(dropdownElement) {
        dropdownElement.innerHTML = '<div class="autocomplete-item autocomplete-no-results">No suggestions found</div>';
        dropdownElement.style.display = 'block';
        this.activeDropdown = dropdownElement;
    },

    /**
     * Show error message
     */
    showError(dropdownElement) {
        dropdownElement.innerHTML = '<div class="autocomplete-item autocomplete-error">Error loading suggestions</div>';
        dropdownElement.style.display = 'block';
        this.activeDropdown = dropdownElement;
    },

    /**
     * Hide dropdown
     */
    hideDropdown(dropdownElement) {
        dropdownElement.style.display = 'none';
        dropdownElement.innerHTML = '';
        if (this.activeDropdown === dropdownElement) {
            this.activeDropdown = null;
        }
    },

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(event, dropdownElement, inputElement) {
        if (dropdownElement.style.display !== 'block') return;

        const items = dropdownElement.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        // Don't handle keyboard for non-selectable items
        const firstItem = items[0];
        if (firstItem.classList.contains('autocomplete-loading') || 
            firstItem.classList.contains('autocomplete-no-results') ||
            firstItem.classList.contains('autocomplete-error')) {
            return;
        }

        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('autocomplete-active')) {
                currentIndex = index;
            }
        });

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.clearHighlight(dropdownElement);
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.add('autocomplete-active');
                items[currentIndex].scrollIntoView({ block: 'nearest' });
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.clearHighlight(dropdownElement);
                currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                items[currentIndex].classList.add('autocomplete-active');
                items[currentIndex].scrollIntoView({ block: 'nearest' });
                break;

            case 'Enter':
                if (currentIndex >= 0) {
                    event.preventDefault();
                    const selectedItem = items[currentIndex];
                    inputElement.value = selectedItem.textContent;
                    
                    // Store selected value
                    this.lastSelectedValues.set(inputElement, selectedItem.textContent);
                    
                    // Auto-fill author if available
                    if (selectedItem.dataset.author) {
                        const authorInput = DOM.authorNameInput;
                        if (authorInput && !authorInput.value.trim()) {
                            authorInput.value = selectedItem.dataset.author;
                            this.lastSelectedValues.set(authorInput, selectedItem.dataset.author);
                        }
                    }
                    
                    this.hideDropdown(dropdownElement);
                }
                break;

            case 'Escape':
                event.preventDefault();
                this.hideDropdown(dropdownElement);
                break;
        }
    },

    /**
     * Clear all highlights
     */
    clearHighlight(dropdownElement) {
        const items = dropdownElement.querySelectorAll('.autocomplete-item');
        items.forEach(item => item.classList.remove('autocomplete-active'));
    }
};
