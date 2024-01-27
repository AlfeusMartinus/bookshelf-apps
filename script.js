const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';
const SAVED_EVENT = 'saved-books';
const RENDER_EVENT = 'render-books';
const searchBook = document.getElementById('searchBook');

function generateID() {
    return +new Date();
}

function generateBooksObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findBook(bookId) {
    for(const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for(const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    } 
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data != null) {
        for(const i of data) {
            books.push(i);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;

    const generateId = generateID();

    const checkComplete = document.getElementById('inputBookIsComplete');
    let tempCheck = Boolean;

    if (checkComplete.checked) {
        tempCheck = true;
    } else {
        tempCheck = false;
    }

    const bookObject = generateBooksObject(generateId, title, author, parseInt(year), tempCheck)
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBook(data) {
    const {id, title, author, year, isComplete} = data;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis : ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun : ' + year;

    const containerButton = document.createElement('div');
    containerButton.classList.add('action');


    const textContainer = document.createElement('article')
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear, containerButton);

    if (isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green')
        undoButton.innerText = 'Belum selesai di Baca';
        undoButton.addEventListener('click', function() {
            undoBookFromCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red')
        trashButton.innerText = 'Hapus buku';
        trashButton.addEventListener('click', function() {
            removeBookFromCompleted(id);
        });

        containerButton.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerText = 'Selesai dibaca'
        checkButton.addEventListener('click', function() {
            addBookCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red')
        trashButton.innerText = 'Hapus buku'
        trashButton.addEventListener('click', function() {
            removeBookFromCompleted(id);
        });

        containerButton.append(checkButton, trashButton);
    }

    return textContainer;
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) {
        return;
    }

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === null) {
        return;
    }

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


searchBook.addEventListener('submit', function(event) {
    const searchTitle = document.getElementById('searchBookTitle');
    const foundBooks = books.filter(book => book.title.toLowerCase().includes(searchTitle.value.toLowerCase()));
    const container = document.getElementById("result");
    container.innerText = '';

    if (searchTitle.value === '') {
        alert('Judul buku harus diisi');
        return;
    }

    if (foundBooks.length === 0) {
        container.innerText = 'Buku tidak ditemukan';
    } 
    
    for(const i of foundBooks) {
        const textTitle = document.createElement('h3');
        textTitle.innerText = i.title;

        const textAuthor = document.createElement('p');
        textAuthor.innerText = 'Penulis : ' + i.author;

        const textYear = document.createElement('p');
        textYear.innerText = 'Tahun : ' + i.year;

        container.append(textTitle, textAuthor, textYear);
    }

    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    
    submitForm.addEventListener('submit', function() {
        addBook();
    })
    
    if (isStorageExist()) {
        loadDataFromStorage();
    }

})

document.addEventListener(SAVED_EVENT, () => {
    alert('Data sukses Disimpan');
})

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    const completedBookList = document.getElementById('completeBookshelfList');

    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completedBookList.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
})