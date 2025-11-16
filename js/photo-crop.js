/**
 * Photo Crop Functions
 * Handles photo cropping after capture
 */

let cropState = {
    isDrawing: false,
    isResizing: false,
    resizeDirection: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    startWidth: 0,
    startHeight: 0,
    originalImageData: null
};

function openCropModal(imageSrc) {
    cropState.originalImageData = imageSrc;
    DOM.cropImage.src = imageSrc;
    DOM.cropModal.classList.remove('hidden');
    DOM.cropModal.style.display = 'flex';
    
    // Freeze the page to prevent scrolling and resizing
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Wait for image to load before setting up overlay
    DOM.cropImage.onload = () => {
        initializeCropOverlay();
    };
    
    // In case image is cached
    if (DOM.cropImage.complete) {
        initializeCropOverlay();
    }
}

function initializeCropOverlay() {
    const img = DOM.cropImage;
    const container = DOM.cropContainer;
    
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Initialize crop area to configured percentage of the image
    const width = img.width * Constants.CROP_INITIAL_SIZE_RATIO;
    const height = img.height * Constants.CROP_INITIAL_SIZE_RATIO;
    const left = (img.width - width) / 2;
    const top = (img.height - height) / 2;
    
    DOM.cropOverlay.style.left = left + 'px';
    DOM.cropOverlay.style.top = top + 'px';
    DOM.cropOverlay.style.width = width + 'px';
    DOM.cropOverlay.style.height = height + 'px';
    
    // Set up overlay dragging
    setupCropDragging();
}

function setupCropDragging() {
    const overlay = DOM.cropOverlay;
    
    overlay.addEventListener('mousedown', (e) => {
        // Check if clicking on a resize handle or edge
        const handle = e.target.closest('.crop-handle');
        const edge = e.target.closest('.crop-edge');
        
        if (handle) {
            cropState.isResizing = true;
            cropState.resizeDirection = handle.dataset.handle;
            cropState.startX = e.clientX;
            cropState.startY = e.clientY;
            cropState.startLeft = parseInt(overlay.style.left) || 0;
            cropState.startTop = parseInt(overlay.style.top) || 0;
            cropState.startWidth = parseInt(overlay.style.width) || 0;
            cropState.startHeight = parseInt(overlay.style.height) || 0;
            e.preventDefault();
            return;
        }
        
        if (edge) {
            cropState.isResizing = true;
            cropState.resizeDirection = edge.dataset.edge;
            cropState.startX = e.clientX;
            cropState.startY = e.clientY;
            cropState.startLeft = parseInt(overlay.style.left) || 0;
            cropState.startTop = parseInt(overlay.style.top) || 0;
            cropState.startWidth = parseInt(overlay.style.width) || 0;
            cropState.startHeight = parseInt(overlay.style.height) || 0;
            e.preventDefault();
            return;
        }
        
        // Otherwise, setup dragging the entire overlay
        cropState.isDrawing = true;
        cropState.startX = e.clientX;
        cropState.startY = e.clientY;
        cropState.startLeft = parseInt(overlay.style.left) || 0;
        cropState.startTop = parseInt(overlay.style.top) || 0;
    });
    
    overlay.addEventListener('touchstart', (e) => {
        const handle = e.target.closest('.crop-handle');
        const edge = e.target.closest('.crop-edge');
        
        if (handle) {
            cropState.isResizing = true;
            cropState.resizeDirection = handle.dataset.handle;
            cropState.startX = e.touches[0].clientX;
            cropState.startY = e.touches[0].clientY;
            cropState.startLeft = parseInt(overlay.style.left) || 0;
            cropState.startTop = parseInt(overlay.style.top) || 0;
            cropState.startWidth = parseInt(overlay.style.width) || 0;
            cropState.startHeight = parseInt(overlay.style.height) || 0;
            e.preventDefault();
            return;
        }
        
        if (edge) {
            cropState.isResizing = true;
            cropState.resizeDirection = edge.dataset.edge;
            cropState.startX = e.touches[0].clientX;
            cropState.startY = e.touches[0].clientY;
            cropState.startLeft = parseInt(overlay.style.left) || 0;
            cropState.startTop = parseInt(overlay.style.top) || 0;
            cropState.startWidth = parseInt(overlay.style.width) || 0;
            cropState.startHeight = parseInt(overlay.style.height) || 0;
            e.preventDefault();
            return;
        }
        
        cropState.isDrawing = true;
        cropState.startX = e.touches[0].clientX;
        cropState.startY = e.touches[0].clientY;
        cropState.startLeft = parseInt(overlay.style.left) || 0;
        cropState.startTop = parseInt(overlay.style.top) || 0;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (cropState.isResizing) {
            handleResize(e.clientX, e.clientY);
            return;
        }
        
        if (cropState.isDrawing) {
            const deltaX = e.clientX - cropState.startX;
            const deltaY = e.clientY - cropState.startY;
            
            const newLeft = Math.max(0, Math.min(cropState.startLeft + deltaX, DOM.cropImage.width - parseInt(overlay.style.width)));
            const newTop = Math.max(0, Math.min(cropState.startTop + deltaY, DOM.cropImage.height - parseInt(overlay.style.height)));
            
            overlay.style.left = newLeft + 'px';
            overlay.style.top = newTop + 'px';
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (cropState.isResizing) {
            handleResize(e.touches[0].clientX, e.touches[0].clientY);
            return;
        }
        
        if (cropState.isDrawing) {
            const deltaX = e.touches[0].clientX - cropState.startX;
            const deltaY = e.touches[0].clientY - cropState.startY;
            
            const newLeft = Math.max(0, Math.min(cropState.startLeft + deltaX, DOM.cropImage.width - parseInt(overlay.style.width)));
            const newTop = Math.max(0, Math.min(cropState.startTop + deltaY, DOM.cropImage.height - parseInt(overlay.style.height)));
            
            overlay.style.left = newLeft + 'px';
            overlay.style.top = newTop + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        cropState.isDrawing = false;
        cropState.isResizing = false;
    });
    
    document.addEventListener('touchend', () => {
        cropState.isDrawing = false;
        cropState.isResizing = false;
    });
}

function handleResize(clientX, clientY) {
    const overlay = DOM.cropOverlay;
    const img = DOM.cropImage;
    const direction = cropState.resizeDirection;
    
    const deltaX = clientX - cropState.startX;
    const deltaY = clientY - cropState.startY;
    
    let newLeft = cropState.startLeft;
    let newTop = cropState.startTop;
    let newWidth = cropState.startWidth;
    let newHeight = cropState.startHeight;
    
    // Minimum size constraints
    const minWidth = Constants.CROP_MIN_WIDTH;
    const minHeight = Constants.CROP_MIN_HEIGHT;
    
    // Handle different resize directions - corners and edges
    if (direction.includes('n')) {
        newTop = Math.max(0, cropState.startTop + deltaY);
        newHeight = Math.max(minHeight, cropState.startHeight - deltaY);
    }
    if (direction.includes('s')) {
        newHeight = Math.max(minHeight, cropState.startHeight + deltaY);
    }
    if (direction.includes('w')) {
        newLeft = Math.max(0, cropState.startLeft + deltaX);
        newWidth = Math.max(minWidth, cropState.startWidth - deltaX);
    }
    if (direction.includes('e')) {
        newWidth = Math.max(minWidth, cropState.startWidth + deltaX);
    }
    // Handle single edge dragging (top, bottom, left, right without diagonals)
    if (direction === 'top') {
        newTop = Math.max(0, cropState.startTop + deltaY);
        newHeight = Math.max(minHeight, cropState.startHeight - deltaY);
    } else if (direction === 'bottom') {
        newHeight = Math.max(minHeight, cropState.startHeight + deltaY);
    } else if (direction === 'left') {
        newLeft = Math.max(0, cropState.startLeft + deltaX);
        newWidth = Math.max(minWidth, cropState.startWidth - deltaX);
    } else if (direction === 'right') {
        newWidth = Math.max(minWidth, cropState.startWidth + deltaX);
    }
    
    // Constrain to image boundaries
    newLeft = Math.max(0, Math.min(newLeft, img.width - newWidth));
    newTop = Math.max(0, Math.min(newTop, img.height - newHeight));
    newWidth = Math.min(newWidth, img.width - newLeft);
    newHeight = Math.min(newHeight, img.height - newTop);
    
    overlay.style.left = newLeft + 'px';
    overlay.style.top = newTop + 'px';
    overlay.style.width = newWidth + 'px';
    overlay.style.height = newHeight + 'px';
}

function confirmCrop() {
    const img = DOM.cropImage;
    const overlay = DOM.cropOverlay;
    
    // Get the overlay coordinates
    const overlayLeft = parseInt(overlay.style.left) || 0;
    const overlayTop = parseInt(overlay.style.top) || 0;
    const overlayWidth = parseInt(overlay.style.width) || img.width;
    const overlayHeight = parseInt(overlay.style.height) || img.height;
    
    // Get the display dimensions of the image
    const displayRect = img.getBoundingClientRect();
    const containerRect = DOM.cropContainer.getBoundingClientRect();
    
    // Calculate scale factors between displayed size and actual image size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // Convert overlay coordinates to actual image coordinates
    const actualLeft = overlayLeft * scaleX;
    const actualTop = overlayTop * scaleY;
    const actualWidth = overlayWidth * scaleX;
    const actualHeight = overlayHeight * scaleY;
    
    // Create a canvas to draw the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = actualWidth;
    cropCanvas.height = actualHeight;
    
    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(img, actualLeft, actualTop, actualWidth, actualHeight, 0, 0, actualWidth, actualHeight);
    
    // Update the photo preview with cropped image
    const croppedImageData = cropCanvas.toDataURL('image/jpeg', Constants.IMAGE_QUALITY);
    DOM.photoPreview.src = croppedImageData;
    
    closeCropModal();
}

function closeCropModal() {
    DOM.cropModal.classList.add('hidden');
    DOM.cropModal.style.display = 'none';
    
    // Unfreeze the page
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
}
