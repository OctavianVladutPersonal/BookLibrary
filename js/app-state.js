/**
 * Application State
 * Manages global state for the book library
 */

const AppState = {
    library: [],
    currentSortColumn: 'title',
    isAscending: true,
    isbnScanStream: null,
    isbnScanActive: false,
    photoCaptureStream: null,
    photoTaken: false,
    currentPage: 1,
    itemsPerPage: 10
};
