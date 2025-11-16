/**
 * Event Listeners Setup
 * Initializes all event listeners for the application
 */

function setupEventListeners() {
    // Book library
    DOM.addBookForm.addEventListener('submit', addBook);
    DOM.searchInput.addEventListener('input', () => {
        AppState.currentPage = 1; // Reset to first page on search
        updateView();
    });
    DOM.tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            sortLibrary(header.dataset.column);
        });
    });

    // Pagination
    document.getElementById('first-page-button').addEventListener('click', goToFirstPage);
    document.getElementById('prev-page-button').addEventListener('click', goToPreviousPage);
    document.getElementById('next-page-button').addEventListener('click', goToNextPage);
    document.getElementById('last-page-button').addEventListener('click', goToLastPage);

    // Auth
    DOM.signupButton.addEventListener('click', handleSignUp);
    DOM.loginButton.addEventListener('click', handleLogin);
    DOM.logoutButton.addEventListener('click', handleLogout);

    // Edit
    DOM.editBookForm.addEventListener('submit', updateBook);
    DOM.cancelEditButton.addEventListener('click', cancelEdit);

    // ISBN Scanner
    DOM.scanISBNButton.addEventListener('click', openISBNScanner);
    DOM.startScannerButton.addEventListener('click', startISBNScan);
    DOM.cancelScannerButton.addEventListener('click', closeISBNScanner);

    // Photo mode
    DOM.startPhotoButton.addEventListener('click', startPhotoCapture);
    DOM.takePhotoButton.addEventListener('click', capturePhoto);
    DOM.cropPhotoButton.addEventListener('click', () => {
        openCropModal(DOM.photoPreview.src);
    });
    DOM.cropConfirmButton.addEventListener('click', confirmCrop);
    DOM.cropCancelButton.addEventListener('click', closeCropModal);
    DOM.analyzePhotoButton.addEventListener('click', analyzePhoto);
    DOM.retakePhotoButton.addEventListener('click', retakePhoto);
    DOM.cancelPhotoButton.addEventListener('click', closeISBNScanner);
    DOM.invalidISBNRetryButton.addEventListener('click', retryInvalidISBN);

    // Manual mode
    DOM.manualISBNSubmit.addEventListener('click', processManualISBN);
    DOM.manualISBNInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processManualISBN();
        }
    });
    DOM.cancelManualButton.addEventListener('click', closeISBNScanner);

    // Scanner tabs
    setupScannerTabListeners();
}
