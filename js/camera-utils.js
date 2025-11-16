/**
 * Camera Utilities
 * Shared camera-related functions and error handling
 */

const CameraUtils = {
    /**
     * Check if running in a secure context (HTTPS, localhost, or file://)
     * @returns {boolean} True if secure context
     */
    isSecureContext() {
        return Constants.SECURE_PROTOCOLS.includes(location.protocol) ||
               Constants.SECURE_HOSTS.includes(location.hostname);
    },

    /**
     * Get camera constraints for environment-facing camera
     * @returns {Object} MediaStream constraints
     */
    getCameraConstraints() {
        return { ...Constants.CAMERA_CONSTRAINTS };
    },

    /**
     * Request camera access with error handling
     * @returns {Promise<MediaStream>} Camera stream
     * @throws {Error} With user-friendly error message
     */
    async requestCameraAccess() {
        if (!this.isSecureContext()) {
            throw new Error('INSECURE_CONTEXT');
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                this.getCameraConstraints()
            );
            return stream;
        } catch (error) {
            // Re-throw with original error for specific handling
            throw error;
        }
    },

    /**
     * Get user-friendly error message for camera errors
     * @param {Error} error - Camera error
     * @returns {string} User-friendly error message
     */
    getCameraErrorMessage(error) {
        if (error.message === 'INSECURE_CONTEXT') {
            return 'Camera access requires HTTPS or local access. Please use a secure connection or local server.';
        }

        switch (error.name) {
            case 'NotAllowedError':
                return 'Camera permission denied. Please allow camera access in your settings.';
            
            case 'NotFoundError':
            case 'NotFoundException':
                return 'No camera found on this device.';
            
            case 'NotReadableError':
            case 'TrackStartError':
                return 'Camera is being used by another app. Please close it and try again.';
            
            default:
                return `Error accessing camera: ${error.message || 'Unknown error'}`;
        }
    },

    /**
     * Get user-friendly alert message for camera errors
     * @param {Error} error - Camera error
     * @returns {string} Alert message
     */
    getCameraErrorAlert(error) {
        if (error.message === 'INSECURE_CONTEXT') {
            return 'Camera access requires HTTPS or local access. Please use a secure connection or run a local server.';
        }

        switch (error.name) {
            case 'NotAllowedError':
                return 'Camera permission was denied. Please allow camera access in your device settings to use ISBN scanning.';
            
            case 'NotFoundError':
            case 'NotFoundException':
                return 'No camera found on this device. Please use a device with a camera or enter the ISBN manually.';
            
            case 'NotReadableError':
            case 'TrackStartError':
                return 'Camera is currently in use by another application. Please close it and try again.';
            
            default:
                return `Error accessing camera: ${error.message || 'Unknown error'}`;
        }
    },

    /**
     * Stop media stream and release camera
     * @param {MediaStream} stream - Media stream to stop
     */
    stopMediaStream(stream) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    },

    /**
     * Initialize video element with stream
     * @param {HTMLVideoElement} videoElement - Video element
     * @param {MediaStream} stream - Media stream
     * @returns {Promise<void>}
     */
    async initializeVideo(videoElement, stream) {
        if (!videoElement || !stream) return;
        
        videoElement.srcObject = stream;
        
        try {
            await videoElement.play();
        } catch (error) {
            console.log('Video play error (may be normal):', error);
        }
    }
};
