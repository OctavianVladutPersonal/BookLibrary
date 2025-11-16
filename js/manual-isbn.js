/**
 * Manual ISBN Input Functions
 * Handles manual ISBN entry and book search
 */

async function processManualISBN() {
    const isbn = Utils.cleanISBN(DOM.manualISBNInput.value);

    if (!isbn) {
        StatusManager.updateStatus(DOM.manualStatus, 'Please enter an ISBN.');
        return;
    }

    if (!Utils.isValidISBN(isbn)) {
        StatusManager.updateStatus(DOM.manualStatus, 'Invalid ISBN format. Please enter a valid ISBN-10 or ISBN-13.');
        return;
    }

    await processISBN(isbn, false);
}

async function processISBN(isbn, fromPhoto = false) {
    const statusElement = fromPhoto ? DOM.photoStatus : DOM.manualStatus;
    StatusManager.updateStatus(statusElement, `Fetching book details for ISBN: ${isbn}...`);

    const bookDetails = await fetchBookByISBN(isbn);

    if (bookDetails) {
        document.getElementById('bookName').value = bookDetails.title;
        document.getElementById('authorName').value = bookDetails.author;

        const added = await addBookDirect(bookDetails.title, bookDetails.author);

        if (added) {
            // Book was successfully added
            showNewlyAddedBook(bookDetails.title, bookDetails.author);
            alert(`Book added: "${bookDetails.title}" by ${bookDetails.author}`);
            clearAllFlows();
            return true;
        } else {
            // Book was not added (duplicate or error)
            if (fromPhoto) {
                StatusManager.updateStatus(statusElement, 'Book not found in database. You can enter details manually.');
                DOM.analyzePhotoButton.disabled = false;
            } else {
                StatusManager.clearStatus(statusElement);
            }
            return false;
        }
    } else {
        // Book not found in APIs
        if (fromPhoto) {
            statusElement.textContent = 'Book not found in database. You can enter details manually.';
            DOM.analyzePhotoButton.disabled = false;
        } else {
            statusElement.innerHTML = `<span style="color: #e74c3c;">ISBN not found in database.</span><br>
            <em>Enter the title and author manually in the form above, or try searching by title:</em>
            <div style="margin-top: 10px; display: flex; gap: 5px;">
                <input type="text" id="search-by-title" placeholder="Book title" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <button type="button" id="search-title-button" style="background-color: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Search</button>
            </div>`;

            setTimeout(() => {
                const searchBtn = document.getElementById('search-title-button');
                const searchInput = document.getElementById('search-by-title');
                if (searchBtn) {
                    searchBtn.addEventListener('click', () => searchBookByTitle(searchInput.value));
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            searchBookByTitle(searchInput.value);
                        }
                    });
                }
            }, 100);
        }
        return false;
    }
}

async function searchBookByTitle(title) {
    if (!title.trim()) {
        alert('Please enter a book title');
        return;
    }

    try {
        StatusManager.showLoading(DOM.manualStatus, `Searching for "${title}"...`);

        const response = await fetch(`${Constants.OPEN_LIBRARY_SEARCH_API}?q=${encodeURIComponent(title)}&limit=${Constants.SEARCH_RESULT_LIMIT}`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const results = data.docs.slice(0, Constants.DISPLAY_RESULT_LIMIT);
            let resultsHTML = '<strong>Search Results:</strong><div style="margin-top: 10px;">';

            results.forEach((book) => {
                const author = book.author_name ? book.author_name[0] : 'Unknown';
                resultsHTML += `<div style="padding: 8px; margin: 5px 0; background: #f5f5f5; border-radius: 4px; cursor: pointer;"
                    onclick="selectBookResult('${book.title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}')">
                    <strong>${book.title}</strong><br>
                    <em>by ${author}</em>
                </div>`;
            });

            resultsHTML += '</div>';
            DOM.manualStatus.innerHTML = resultsHTML;
        } else {
            StatusManager.updateStatus(DOM.manualStatus, 'No books found with that title. Please enter details manually.');
        }
    } catch (error) {
        console.error('Search error:', error);
        StatusManager.showError(DOM.manualStatus, 'Search failed. Please enter details manually.');
    }
}

window.selectBookResult = function (title, author) {
    document.getElementById('bookName').value = title;
    document.getElementById('authorName').value = author;
    StatusManager.showSuccess(DOM.manualStatus, 'Book selected! Click "Add Book" to add it to your library.');
};
