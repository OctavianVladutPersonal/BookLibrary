/**
 * Scanner UI Functions
 * Handles scanner modal tab switching and UI state
 */

function switchScannerMode(mode) {
    // Clean up all modes before switching
    stopISBNScan();
    stopPhotoCapture();
    
    DOM.scannerModes.forEach(m => m.classList.remove('active'));
    DOM.scannerTabs.forEach(t => t.classList.remove('active'));

    document.getElementById(`${mode}-mode`).classList.add('active');
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
}

function setupScannerTabListeners() {
    DOM.scannerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            switchScannerMode(mode);

            // Don't auto-start camera, let user click the button
        });
    });
}
