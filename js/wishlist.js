const wishlistBooksElement = document.getElementById("wishlist-books");
const loaderElement = document.getElementById("loader");

// Truncate text to a specified length
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
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

// Toggle the navigation menu
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("open");
}

// Set the active navigation link based on the current page
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const homeLink = document.getElementById("homeLink");
  const wishlistLink = document.getElementById("wishlistLink");

  if (currentPath.includes("wishlist.html")) {
    wishlistLink.classList.add("active");
    homeLink.classList.remove("active");
  } else if (currentPath.includes("index.html")) {
    homeLink.classList.add("active");
    wishlistLink.classList.remove("active");
  }
}

// Fetch and display books from the wishlist
async function fetchWishlistBooks() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  updateWishlistCount(); // Update count when fetching wishlist

  if (wishlist.length === 0) {
    wishlistBooksElement.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  // Show loader before fetching books
  loaderElement.style.display = "grid";
  wishlistBooksElement.style.display = "none";

  try {
    const promises = wishlist.map((bookId) =>
      fetch(`https://gutendex.com/books/${bookId}`).then((res) => res.json())
    );
    const books = await Promise.all(promises);
    displayWishlistBooks(books);
  } catch (error) {
    console.error("Error fetching wishlist books:", error);
  } finally {
    loaderElement.style.display = "none";
    wishlistBooksElement.style.display = "grid";
  }
}

// Update the wishlist count display
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishlistCountElement = document.getElementById("wishlist-count");
  wishlistCountElement.textContent = `(${wishlist.length})`;
}

// Display the books on the wishlist page
function displayWishlistBooks(books) {
  wishlistBooksElement.innerHTML = "";
  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-item");
    bookElement.innerHTML = `
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
                    <div onclick="removeFromWishlist(${
                      book.id
                    })" class="n">Remove <i class="fa-solid fa-heart"></i></div>
                    <button onclick="viewDetails(${
                      book.id
                    })">View Details</button>
                </div>
            </div>
        `;
    wishlistBooksElement.appendChild(bookElement);
  });
}

// Remove a book from the wishlist
function removeFromWishlist(bookId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((id) => id !== bookId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  fetchWishlistBooks();
}

function viewDetails(bookId) {
  window.location.href = `book-details.html?id=${bookId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLink();
  if (window.location.pathname.includes("wishlist.html")) {
    fetchWishlistBooks();
  }
});
