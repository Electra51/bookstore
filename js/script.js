let currentPage = 1;
const booksPerPage = 10;
const bookListElement = document.getElementById("book-list");
const searchBar = document.getElementById("search-bar");
const genreFilter = document.getElementById("genre-filter");

// Set active navigation link
function setActiveLink() {
  const links = document.querySelectorAll(".nav-links a");
  const currentUrl = window.location.href;

  links.forEach((link) => {
    link.classList.toggle(
      "active",
      currentUrl.includes(link.getAttribute("href"))
    );
  });
}

// Toggle mobile menu
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

async function fetchBooks(page = 1, searchTerm = "", genre = "") {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  try {
    const response = await fetch(`https://gutendex.com/books?page=${page}`);
    const data = await response.json();

    let filteredBooks = data.results.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!genre ||
          book.subjects.some((subject) =>
            subject.toLowerCase().includes(genre.toLowerCase())
          ))
    );

    displayBooks(filteredBooks);
    document.getElementById("page-info").textContent = `Page ${page}`;
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    loader.style.display = "none";
  }
}

// Save user preferences to localStorage
function savePreferences() {
  localStorage.setItem("searchTerm", searchBar.value);
  localStorage.setItem("genre", genreFilter.value);
}

// Load user preferences from localStorage
function loadPreferences() {
  const savedSearchTerm = localStorage.getItem("searchTerm");
  const savedGenre = localStorage.getItem("genre");

  if (savedSearchTerm) {
    searchBar.value = savedSearchTerm;
  }

  if (savedGenre) {
    genreFilter.value = savedGenre;
  }
}

// Update the search bar and genre filter
searchBar.addEventListener("input", () => {
  currentPage = 1;
  savePreferences();
  fetchBooks(currentPage, searchBar.value, genreFilter.value);
  updateButtonState();
});

genreFilter.addEventListener("change", () => {
  currentPage = 1;
  savePreferences();
  fetchBooks(currentPage, searchBar.value, genreFilter.value);
  updateButtonState();
});

// Display book list
function displayBooks(books) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  bookListElement.innerHTML = books
    .map((book) => {
      const isWishlisted = wishlist.includes(book.id);
      const heartIconClass = isWishlisted
        ? "fa-solid fa-heart"
        : "fa-regular fa-heart";

      return `
        <div class="book-item">
          <div class="book-card">
            <div class="book-img">
              <img src="${book.formats["image/jpeg"]}" alt="${
        book.title
      }" class="bimg">
            </div>
            <h3>${truncateText(book.title, 26)}</h3>
            <p>Id: ${book.id}</p>
            <p>Author: ${book.authors
              .map((author) => author.name)
              .join(", ")}</p>
            <p>Genre: ${truncateText(formatGenres(book.subjects), 26)}</p>
            <div class="book-card-btn">
              <div class="wishlist-btn" data-book-id="${book.id}">
                <i class="${heartIconClass}"></i>
              </div>
              <button onclick="viewDetails(${book.id})">View Details</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Truncate text for display
function truncateText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

// Format book genres
function formatGenres(subjects) {
  const commonGenres = [
    "Fiction",
    "Drama",
    "Poetry",
    "Adventure",
    "Fantasy",
    "Mystery",
    "Science",
    "Biography",
  ];
  const genres = subjects.filter((subject) =>
    commonGenres.some((genre) =>
      subject.toLowerCase().includes(genre.toLowerCase())
    )
  );
  return genres.length > 0 ? genres.join(", ") : "Other";
}

// View book details
function viewDetails(bookId) {
  window.location.href = `book-details.html?id=${bookId}`;
}

// Toggle Wishlist
function toggleWishlist(bookId, heartIcon) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Check if the book is already in the wishlist
  if (wishlist.includes(bookId)) {
    showToast(" ⚠️ This book is already in your wishlist.");
    return;
  }

  // Add the book to the wishlist
  wishlist.push(bookId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  // Change the icon to a solid heart
  heartIcon.classList.remove("fa-regular");
  heartIcon.classList.add("fa-solid");

  showToast(" ✔️ Book added to wishlist!");
  updateWishlistCount();
}

// Add event listener to the wishlist buttons
document.addEventListener("click", (event) => {
  if (event.target.closest(".wishlist-btn")) {
    const button = event.target.closest(".wishlist-btn");
    const heartIcon = button.querySelector("i");
    const bookId = parseInt(button.getAttribute("data-book-id"), 10);

    toggleWishlist(bookId, heartIcon);
  }
});

// Show toast message
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Update wishlist count display
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.getElementById(
    "wishlist-count"
  ).textContent = `(${wishlist.length})`;
}

function updateButtonState() {
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");

  // Disable the previous button if on the first page
  prevButton.disabled = currentPage === 1;

  // Here you can also manage the next button's disabled state
  // For example, if there's no more data to load, you might disable it
  // Assuming you know the total number of pages or books
  // nextButton.disabled = /* condition to disable next button */;
}

// Update the event listeners for the pagination buttons
document.getElementById("next-page")?.addEventListener("click", () => {
  const loader = document.getElementById("loader");
  const nextButton = document.getElementById("next-page");

  loader.style.display = "block"; // Show loader when "Next" is clicked
  nextButton.textContent = "Loading..."; // Change button text to loading

  currentPage++;
  fetchBooks(currentPage, searchBar.value, genreFilter.value).then(() => {
    nextButton.textContent = "Next"; // Restore button text once loading is done
    updateButtonState(); // Update button states
  });
});

document.getElementById("prev-page")?.addEventListener("click", () => {
  const loader = document.getElementById("loader");
  const prevButton = document.getElementById("prev-page");

  loader.style.display = "block"; // Show loader when "prev" is clicked
  prevButton.textContent = "Loading..."; // Change button text to loading

  if (currentPage > 1) {
    currentPage--;
    fetchBooks(currentPage, searchBar.value, genreFilter.value).then(() => {
      prevButton.textContent = "Previous";
      updateButtonState(); // Update button states
    });
  }
});

// Initialize page actions
function initPage() {
  setActiveLink();
  updateWishlistCount();
  loadPreferences(); // Load saved preferences on page load
  fetchBooks(currentPage);

  updateButtonState(); // Call to initialize button states
}

// Call initPage to initialize
initPage();
