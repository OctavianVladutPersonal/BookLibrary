/**
 * Status Manager
 * Centralized status message updates
 */

const StatusManager = {
    /**
     * Update status element with a message
     * @param {HTMLElement} element - Status element
     * @param {string} message - Status message
     * @param {string} type - Optional CSS class type
     */
    updateStatus(element, message, type = null) {
        if (!element) return;
        
        if (type) {
            element.innerHTML = `<p class="status-${type}">${message}</p>`;
        } else {
            element.textContent = message;
        }
    },

    /**
     * Clear status message
     * @param {HTMLElement} element - Status element
     */
    clearStatus(element) {
        if (!element) return;
        element.textContent = '';
        element.innerHTML = '';
    },

    /**
     * Show loading status
     * @param {HTMLElement} element - Status element
     * @param {string} message - Loading message
     */
    showLoading(element, message) {
        this.updateStatus(element, `🔄 ${message}`);
    },

    /**
     * Show success status
     * @param {HTMLElement} element - Status element
     * @param {string} message - Success message
     */
    showSuccess(element, message) {
        this.updateStatus(element, `✓ ${message}`, 'good');
    },

    /**
     * Show error status
     * @param {HTMLElement} element - Status element
     * @param {string} message - Error message
     */
    showError(element, message) {
        this.updateStatus(element, `✗ ${message}`, 'error');
    },

    /**
     * Show warning status
     * @param {HTMLElement} element - Status element
     * @param {string} message - Warning message
     */
    showWarning(element, message) {
        this.updateStatus(element, `⚠ ${message}`, 'warn');
    },

    /**
     * Temporarily show a message then clear or revert
     * @param {HTMLElement} element - Status element
     * @param {string} message - Temporary message
     * @param {number} duration - Duration in ms
     * @param {Function} callback - Optional callback after timeout
     */
    showTemporary(element, message, duration = Constants.STATUS_UPDATE_DELAY_MS, callback = null) {
        this.updateStatus(element, message);
        
        setTimeout(() => {
            if (callback) {
                callback();
            } else {
                this.clearStatus(element);
            }
        }, duration);
    }
};
