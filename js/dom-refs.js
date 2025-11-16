/**
 * DOM Element References
 * Centralizes all DOM element references for easier maintenance
 */

const DOM = {
    // Book library
    addBookForm: document.getElementById('addBookForm'),
    bookListBody: document.getElementById('bookList'),
    searchInput: document.getElementById('searchInput'),
    tableHeaders: document.querySelectorAll('#bookTable th'),
    actionsHeader: document.getElementById('actions-header'),

    // Autocomplete
    bookNameInput: document.getElementById('bookName'),
    authorNameInput: document.getElementById('authorName'),
    bookNameAutocomplete: document.getElementById('bookName-autocomplete'),
    authorNameAutocomplete: document.getElementById('authorName-autocomplete'),

    // Auth
    authContainer: document.getElementById('auth-container'),
    authStatus: document.getElementById('auth-status'),
    addBookSection: document.getElementById('add-book-section'),
    userEmailDisplay: document.getElementById('user-email'),
    authError: document.getElementById('auth-error'),
    loginButton: document.getElementById('login-button'),
    signupButton: document.getElementById('signup-button'),
    logoutButton: document.getElementById('logout-button'),

    // Edit
    editBookSection: document.getElementById('edit-book-section'),
    editBookForm: document.getElementById('editBookForm'),
    editBookIdInput: document.getElementById('editBookId'),
    editBookNameInput: document.getElementById('editBookName'),
    editAuthorNameInput: document.getElementById('editAuthorName'),
    cancelEditButton: document.getElementById('cancelEditButton'),

    // ISBN Scanner
    scanISBNButton: document.getElementById('scan-isbn-button'),
    isbnScannerModal: document.getElementById('isbn-scanner-modal'),
    startScannerButton: document.getElementById('start-scanner-button'),
    cancelScannerButton: document.getElementById('cancel-scanner-button'),
    startPhotoButton: document.getElementById('start-photo-button'),
    video: document.getElementById('video'),
    barcodePreview: document.getElementById('barcode-preview'),
    scannerStatus: document.getElementById('scanner-status'),

    // Photo mode
    videoPhoto: document.getElementById('video-photo'),
    photoPreviewContainer: document.getElementById('photo-preview-container'),
    canvas: document.getElementById('canvas'),
    photoPreview: document.getElementById('photo-preview'),
    takePhotoButton: document.getElementById('take-photo-button'),
    cropPhotoButton: document.getElementById('crop-photo-button'),
    analyzePhotoButton: document.getElementById('analyze-photo-button'),
    retakePhotoButton: document.getElementById('retake-photo-button'),
    cancelPhotoButton: document.getElementById('cancel-photo-button'),
    photoStatus: document.getElementById('photo-status'),
    invalidISBNInput: document.getElementById('invalid-isbn-input'),
    invalidISBNField: document.getElementById('invalid-isbn-field'),
    invalidISBNRetryButton: document.getElementById('invalid-isbn-retry-button'),

    // Crop mode
    cropModal: document.getElementById('crop-modal'),
    cropImage: document.getElementById('crop-image'),
    cropOverlay: document.getElementById('crop-overlay'),
    cropContainer: document.getElementById('crop-container'),
    cropConfirmButton: document.getElementById('crop-confirm-button'),
    cropCancelButton: document.getElementById('crop-cancel-button'),

    // Manual mode
    manualISBNInput: document.getElementById('manual-isbn-input'),
    manualISBNSubmit: document.getElementById('manual-isbn-submit'),
    cancelManualButton: document.getElementById('cancel-manual-button'),
    manualStatus: document.getElementById('manual-status'),

    // Scanner tabs
    scannerTabs: document.querySelectorAll('.scanner-tab'),
    scannerModes: document.querySelectorAll('.scanner-mode')
};
