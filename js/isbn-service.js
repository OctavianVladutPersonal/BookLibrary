/**
 * ISBN Scanner Functions
 * Handles ISBN fetching from Google Books and Open Library APIs
 */

async function fetchBookByISBN(isbn) {
    try {
        const cleanISBN = Utils.cleanISBN(isbn);
        console.log('Fetching book for ISBN:', cleanISBN);

        // Try Google Books API first
        try {
            console.log('Trying Google Books API...');
            const googleBooksResponse = await Utils.fetchWithTimeout(
                `${Constants.GOOGLE_BOOKS_API}?q=isbn:${cleanISBN}`
            );
            const googleBooksData = await googleBooksResponse.json();

            if (googleBooksData.items && googleBooksData.items.length > 0) {
                const bookInfo = googleBooksData.items[0].volumeInfo;
                console.log('Book found on Google Books:', bookInfo);
                return {
                    title: bookInfo.title || 'Unknown Title',
                    author: bookInfo.authors && bookInfo.authors.length > 0
                        ? bookInfo.authors[0]
                        : 'Unknown Author'
                };
            }
        } catch (error) {
            console.warn('Google Books API failed or timed out:', error.message);
        }

        // Fallback: Try Open Library API
        try {
            console.log('Trying Open Library API...');
            const openLibraryResponse = await Utils.fetchWithTimeout(
                `${Constants.OPEN_LIBRARY_API}?bibkeys=ISBN:${cleanISBN}&jscmd=data&format=json`
            );
            const openLibraryData = await openLibraryResponse.json();

            const key = `ISBN:${cleanISBN}`;
            if (openLibraryData && openLibraryData[key]) {
                const bookData = openLibraryData[key];
                console.log('Book found on Open Library:', bookData);
                return {
                    title: bookData.title || 'Unknown Title',
                    author: bookData.authors && bookData.authors.length > 0
                        ? bookData.authors[0].name
                        : 'Unknown Author'
                };
            }
        } catch (error) {
            console.warn('Open Library API failed or timed out:', error.message);
        }

        // Try converting ISBN-13 to ISBN-10
        const isbn10 = Utils.convertISBN13to10(cleanISBN);
        if (isbn10) {
            try {
                console.log('Trying Open Library with converted ISBN-10:', isbn10);
                const altResponse = await Utils.fetchWithTimeout(
                    `${Constants.OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn10}&jscmd=data&format=json`
                );
                const altData = await altResponse.json();
                const altKey = `ISBN:${isbn10}`;
                if (altData && altData[altKey]) {
                    const bookData = altData[altKey];
                    console.log('Book found on Open Library with ISBN-10:', bookData);
                    return {
                        title: bookData.title || 'Unknown Title',
                        author: bookData.authors && bookData.authors.length > 0
                            ? bookData.authors[0].name
                            : 'Unknown Author'
                    };
                }
            } catch (error) {
                console.warn('ISBN-10 conversion failed or timed out:', error.message);
            }
        }

        console.log('Book not found in any API for ISBN:', cleanISBN);
        return null;
    } catch (error) {
        console.error('Error fetching book by ISBN:', error);
        return null;
    }
}

async function addBookDirect(title, author) {
    if (!auth.currentUser) {
        alert("You must be logged in to add books.");
        return false;
    }

    if (title && author) {
        if (Utils.bookExists(title, author, AppState.library)) {
            alert(`"${title}" by ${author} is already in your library.`);
            return false;
        }

        try {
            await db.collection("books").add({
                title: title,
                author: author
            });
            console.log("Book added via ISBN scan!");
            return true;
        } catch (error) {
            console.error("Error adding book via ISBN: ", error);
            alert("Error adding book. Check console.");
            return false;
        }
    }
    return false;
}
