/**
 * Photo Capture Functions
 * Handles photo capturing and OCR using Tesseract
 */

async function startPhotoCapture() {
    try {
        AppState.photoCaptureStream = await CameraUtils.requestCameraAccess();
        await CameraUtils.initializeVideo(DOM.videoPhoto, AppState.photoCaptureStream);
        
        // Show video and take photo button
        DOM.photoPreviewContainer.style.display = 'block';
        DOM.startPhotoButton.classList.add('hidden');
        DOM.takePhotoButton.classList.remove('hidden');
        
        StatusManager.updateStatus(DOM.photoStatus, 'Camera ready. Click "📸 Take Photo" to capture ISBN.');
    } catch (error) {
        console.error('Error accessing camera:', error);
        DOM.startPhotoButton.classList.remove('hidden');
        DOM.takePhotoButton.classList.add('hidden');
        DOM.photoPreviewContainer.style.display = 'none';
        
        StatusManager.updateStatus(DOM.photoStatus, CameraUtils.getCameraErrorMessage(error));
        
        // Show alert for certain errors
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError' || error.name === 'NotFoundException') {
            alert(CameraUtils.getCameraErrorAlert(error));
        }
    }
}

function capturePhoto() {
    try {
        const context = DOM.canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        DOM.canvas.width = DOM.videoPhoto.videoWidth || Constants.DEFAULT_CANVAS_WIDTH;
        DOM.canvas.height = DOM.videoPhoto.videoHeight || Constants.DEFAULT_CANVAS_HEIGHT;
        
        // Draw the current video frame
        context.drawImage(DOM.videoPhoto, 0, 0, DOM.canvas.width, DOM.canvas.height);
        const imageData = DOM.canvas.toDataURL('image/jpeg', Constants.IMAGE_QUALITY);
        DOM.photoPreview.src = imageData;
        DOM.photoPreview.style.display = 'block';

        // Stop camera stream after capturing photo
        CameraUtils.stopMediaStream(AppState.photoCaptureStream);
        AppState.photoCaptureStream = null;
        DOM.photoPreviewContainer.style.display = 'none';

        DOM.takePhotoButton.classList.add('hidden');
        DOM.cropPhotoButton.classList.remove('hidden');
        DOM.analyzePhotoButton.classList.remove('hidden');
        DOM.retakePhotoButton.classList.remove('hidden');
        StatusManager.updateStatus(DOM.photoStatus, 'Photo captured. You can crop it before analyzing.');
        AppState.photoTaken = true;
    } catch (error) {
        console.error('Error capturing photo:', error);
        StatusManager.showError(DOM.photoStatus, 'Error capturing photo. Please try again.');
    }
}

async function analyzePhoto() {
    StatusManager.showLoading(DOM.photoStatus, 'Analyzing photo for ISBN...');
    DOM.analyzePhotoButton.disabled = true;

    try {
        // Priority 1: Try canvas-based barcode detection
        const barcodeDetected = await detectBarcodeInImage(DOM.photoPreview.src);
        
        if (barcodeDetected) {
            const result = await processISBN(barcodeDetected, true);
            if (result) {
                stopPhotoCapture();
                closeISBNScanner();
                return;
            }
        }

        // Priority 2: Use OCR for ISBN text detection
        StatusManager.showLoading(DOM.photoStatus, 'Scanning image for ISBN text...');
        const { data: { text } } = await Tesseract.recognize(DOM.photoPreview.src, 'eng');
        console.log('OCR Text:', text);

        // Try extracting ISBN using utility function
        let isbn = Utils.extractISBN(text);

        if (!isbn) {
            // Try lenient pattern if strict extraction fails
            isbn = Utils.extractISBNLenient(text);
        }

        if (isbn) {
            console.log('ISBN to process:', isbn);
            
            const result = await processISBN(isbn, true);
            if (result) {
                // processISBN already calls showNewlyAddedBook and clearAllFlows on success
                // Close the scanner modal and stop photo capture after successful add
                stopPhotoCapture();
                closeISBNScanner();
            }
        } else {
            StatusManager.updateStatus(DOM.photoStatus, 'No ISBN found in photo. Try another photo or enter manually.');
            DOM.analyzePhotoButton.disabled = false;
        }
    } catch (error) {
        console.error('OCR error:', error);
        StatusManager.showError(DOM.photoStatus, 'Error analyzing photo. Try again.');
        DOM.analyzePhotoButton.disabled = false;
    }
}

async function detectBarcodeInImage(imageSrc) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        
        img.src = imageSrc;

        // Try using jsbarcode library if available
        if (typeof window.jsbarcode !== 'undefined') {
            try {
                const result = await scanBarcodeWithCanvas(canvas);
                if (result) {
                    return result;
                }
            } catch (e) {
                console.log('Canvas barcode detection failed, falling back to OCR');
            }
        }
        
        return null;
    } catch (error) {
        console.log('Barcode detection error:', error);
        return null;
    }
}

function scanBarcodeWithCanvas(canvas) {
    return new Promise((resolve) => {
        try {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple barcode detection: look for vertical lines (ISBN barcode pattern)
            const horizontalBands = [];
            const threshold = 100;
            
            for (let y = 0; y < canvas.height; y++) {
                let blackPixels = 0;
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const brightness = (r + g + b) / 3;
                    if (brightness < threshold) {
                        blackPixels++;
                    }
                }
                if (blackPixels > canvas.width * 0.2) {
                    horizontalBands.push(y);
                }
            }
            
            // If we found significant black pixel bands, assume barcode detected
            if (horizontalBands.length > 0) {
                const startBand = horizontalBands[0];
                const endBand = horizontalBands[horizontalBands.length - 1];
                const bandHeight = endBand - startBand;
                
                // If band is reasonably sized, it might be a barcode
                if (bandHeight > canvas.height * 0.1) {
                    console.log('Barcode pattern detected in image');
                    // Return a signal that barcode was detected (we can't decode without proper library)
                    resolve('barcode_detected');
                    return;
                }
            }
            
            resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

function retakePhoto() {
    // Hide the captured photo and show video stream again
    DOM.photoPreview.style.display = 'none';
    DOM.photoPreviewContainer.style.display = 'block';
    DOM.invalidISBNInput.style.display = 'none';
    
    // Reset button states - IMPORTANT: hide all photo action buttons initially
    DOM.takePhotoButton.classList.remove('hidden');
    DOM.cropPhotoButton.classList.add('hidden');
    DOM.analyzePhotoButton.classList.add('hidden');
    DOM.retakePhotoButton.classList.add('hidden');
    AppState.photoTaken = false;
    
    // Restart camera stream if needed
    if (!AppState.photoCaptureStream) {
        // Stream was stopped, need to restart it
        startPhotoCapture();
    } else {
        StatusManager.updateStatus(DOM.photoStatus, 'Camera ready. Click "📸 Take Photo" to capture ISBN.');
    }
}

function stopPhotoCapture() {
    CameraUtils.stopMediaStream(AppState.photoCaptureStream);
    AppState.photoCaptureStream = null;
    DOM.photoPreviewContainer.style.display = 'none';
    DOM.photoPreview.style.display = 'none';
    DOM.startPhotoButton.classList.remove('hidden');
    DOM.takePhotoButton.classList.add('hidden');
    DOM.analyzePhotoButton.classList.add('hidden');
    DOM.retakePhotoButton.classList.add('hidden');
    DOM.invalidISBNInput.style.display = 'none';
    StatusManager.updateStatus(DOM.photoStatus, 'Ready to capture. Click "▶️ Start Photo Capture" to begin.');
    AppState.photoTaken = false;
}

async function retryInvalidISBN() {
    const isbn = Utils.cleanISBN(DOM.invalidISBNField.value);
    
    if (!isbn) {
        StatusManager.updateStatus(DOM.photoStatus, 'Please enter an ISBN.');
        return;
    }
    
    if (!Utils.isValidISBN(isbn)) {
        StatusManager.updateStatus(DOM.photoStatus, 'Invalid ISBN format. Please check and try again.');
        return;
    }
    
    StatusManager.showLoading(DOM.photoStatus, 'Searching for ISBN...');
    const result = await processISBN(isbn, true);
    if (result) {
        DOM.invalidISBNInput.style.display = 'none';
        stopPhotoCapture();
        closeISBNScanner();
    } else {
        StatusManager.updateStatus(DOM.photoStatus, 'Book not found. Check the ISBN and try again.');
    }
}
