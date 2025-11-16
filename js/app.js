/**
 * Application Initialization
 * Main entry point that initializes the entire application
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners
    setupEventListeners();

    // Setup authentication
    setupAuthStateListener(updateView);

    // Load initial books
    loadBooks();

    // Initialize autocomplete for book name and author fields
    Autocomplete.init(DOM.bookNameInput, DOM.bookNameAutocomplete, 'title');
    Autocomplete.init(DOM.authorNameInput, DOM.authorNameAutocomplete, 'author');

    console.log('Application initialized successfully');
});
