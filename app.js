document.addEventListener("DOMContentLoaded", function() {
    let verses = [];
    let currentIndex = 0;
    let bibleData = {};
    let currentBook = '';
    let currentChapter = '';
    let areControlsVisible = true;
    let isDarkMode = false;

    async function loadBibleData() {
        try {
            const response = await fetch('./bibleData.json');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            bibleData = await response.json();
        } catch (error) {
            console.error('Error loading Bible data:', error);
        }
    }

    function present() {
        if (verses.length === 0) return;

        const verse = verses[currentIndex];
        document.getElementById('verseDisplay').innerHTML = `
            <h2>${currentBook} ${currentChapter}:${verse.verse}</h2>
            <p><strong>${verse.verse}</strong> ${verse.text}</p>
        `;
    }

    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.querySelector('.container').classList.toggle('dark-mode', isDarkMode);
        document.querySelectorAll('.dropdown-button').forEach(button => button.classList.toggle('dark-mode', isDarkMode));
        document.querySelector('.verse-input').classList.toggle('dark-mode', isDarkMode);
        document.querySelector('.verse-display').classList.toggle('dark-mode', isDarkMode);
        document.querySelector('.bottom-buttons').classList.toggle('dark-mode', isDarkMode);
    }

    function hideControls() {
        document.querySelectorAll('.bottom-buttons, #verseInput').forEach(el => el.style.display = 'none');
        document.querySelector('#booksDropdown').style.display = 'none';
        document.querySelector('#chaptersDropdown').style.display = 'none';
        areControlsVisible = false;
    }

    function showControls() {
        document.querySelectorAll('.bottom-buttons, #verseInput').forEach(el => el.style.display = 'block');
        document.querySelector('#booksDropdown').style.display = 'block';
        document.querySelector('#chaptersDropdown').style.display = 'block';
        areControlsVisible = true;
    }

    async function fetchVerse(book, chapter, startVerse) {
        if (!bibleData[book] || !bibleData[book][chapter]) {
            document.getElementById('verseDisplay').innerHTML = `<p>Book or chapter not found.</p>`;
            return;
        }
        verses = bibleData[book][chapter].slice(startVerse - 1);
        currentIndex = 0;
        currentBook = book;
        currentChapter = chapter;
        present();
    }

    function displayChapters(book) {
        const chaptersContainer = document.getElementById("chaptersContainer");
        chaptersContainer.innerHTML = "";

        if (bibleData.hasOwnProperty(book)) {
            for (let chapter in bibleData[book]) {
                let item = document.createElement("a");
                item.innerText = `Chapter ${chapter}`;
                item.href = "#";
                item.onclick = async (e) => {
                    e.preventDefault();
                    await fetchVerse(book, chapter, 1);
                    chaptersContainer.classList.remove("show");
                    chaptersDropdown.innerText = `Chapter ${chapter}`;
                };
                chaptersContainer.appendChild(item);
            }
        }

        chaptersDropdown.disabled = false;
    }

    async function init() {
        await loadBibleData();
        const booksDropdown = document.getElementById("booksDropdown");
        const booksContainer = document.getElementById("booksContainer");
        const chaptersDropdown = document.getElementById("chaptersDropdown");
        const chaptersContainer = document.getElementById("chaptersContainer");
        const startVerseInput = document.getElementById('startVerse');
        const fetchButton = document.getElementById('fetchButton');
        const previousButton = document.getElementById('previousButton');
        const nextButton = document.getElementById('nextButton');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const hideButton = document.getElementById('hideButton');

        booksDropdown.addEventListener("click", function() {
            booksContainer.classList.toggle("show");
            chaptersContainer.classList.remove("show");
        });

        for (let book in bibleData) {
            let item = document.createElement("a");
            item.innerText = book;
            item.href = "#";
            item.onclick = async (e) => {
                e.preventDefault();
                displayChapters(book);
                booksContainer.classList.remove("show");
                booksDropdown.innerText = book;
            };
            booksContainer.appendChild(item);
        }

        chaptersDropdown.addEventListener("click", function() {
            chaptersContainer.classList.toggle("show");
            booksContainer.classList.remove("show");
        });

        window.addEventListener("click", function(event) {
            if (!event.target.matches('.dropdown-button')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                Array.from(dropdowns).forEach(function(openDropdown) {
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                });
            }
        });

        fetchButton.addEventListener('click', async function() {
            const selectedBook = booksDropdown.innerText.trim();
            const selectedChapter = chaptersDropdown.innerText.trim().replace('Chapter ', '');
            const startVerse = parseInt(startVerseInput.value);

            if (selectedBook && selectedChapter && !isNaN(startVerse)) {
                await fetchVerse(selectedBook, selectedChapter, startVerse);
                showControls();
            } else {
                console.error('Invalid input');
            }
        });

        previousButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                present();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < verses.length - 1) {
                currentIndex++;
                present();
            }
        });

        hideButton.addEventListener('click', () => {
            if (areControlsVisible) {
                hideControls();
            } else {
                showControls();
            }
        });

        darkModeToggle.addEventListener('click', toggleDarkMode);

        window.addEventListener('keydown', function(event) {
            if (event.key === 'ArrowRight') {
                if (currentIndex < verses.length - 1) {
                    currentIndex++;
                    present();
                }
            } else if (event.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    currentIndex--;
                    present();
                }
            } else if (event.key === 't' || event.key === 'T') {
                if (areControlsVisible) {
                    hideControls();
                } else {
                    showControls();
                }
            } else if (event.key === 'd' || event.key === 'D') {
                toggleDarkMode();
            }
        });
    }

    init();
});
