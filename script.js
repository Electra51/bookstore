let currentPage = 1;
const booksPerPage = 10;
const bookListElement = document.getElementById("book-list");
const searchBar = document.getElementById("search-bar");
const genreFilter = document.getElementById("genre-filter");

function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("open");
}

async function fetchBooks(page = 1) {
  try {
    const response = await fetch(`https://gutendex.com/books?page=${page}`);
    console.log("page", page);
    const data = await response.json();
    displayBooks(data.results);
    // Handle Pagination
    document.getElementById("page-info").textContent = `Page ${page}`;
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

function displayBooks(books) {
  bookListElement.innerHTML = ""; // Clear existing content
  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-item");
    bookElement.innerHTML = `
            <img src="${book.formats["image/jpeg"]}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>By: ${book.authors.map((author) => author.name).join(", ")}</p>
            <p>Genre: ${book.subjects.join(", ")}</p>
            <button onclick="toggleWishlist(${book.id})">❤️</button>
        `;
    bookListElement.appendChild(bookElement);
  });
}

function toggleWishlist(bookId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.querySelectorAll(".book-item button").forEach((button) => {
    const bookId = parseInt(button.getAttribute("onclick").match(/\d+/)[0], 10);
    button.textContent = wishlist.includes(bookId) ? "❤️" : "♡";
  });
}

fetchBooks(currentPage);

document.getElementById("next-page").addEventListener("click", () => {
  currentPage++;
  fetchBooks(currentPage);
});

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchBooks(currentPage);
  }
});

searchBar.addEventListener("input", function () {
  // Implement search functionality
});

genreFilter.addEventListener("change", function () {
  // Implement genre filtering
});
