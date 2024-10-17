const loaderElement = document.getElementById("loader");

// Toggle the navigation menu
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("open");
}

async function fetchBookDetails(bookId) {
  // Show loader before fetching book details
  loaderElement.style.display = "block";

  try {
    const response = await fetch(`https://gutendex.com/books/${bookId}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const book = await response.json();
    displayBookDetails(book);
  } catch (error) {
    console.error("Error fetching book details:", error);
  } finally {
    // Hide loader after fetching book details or on error
    loaderElement.style.display = "none";
  }
}

function isBookInWishlist(bookId) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  return wishlist.includes(bookId);
}
function displayBookDetails(book) {
  const bookDetailsElement = document.getElementById("book-details");
  const languages = book.languages.join(", ");
  const isInWishlist = isBookInWishlist(book.id);
  bookDetailsElement.innerHTML = `
        <div class="book-detail">
            <div class="book-detail-img">
                <img src="${book.formats["image/jpeg"]}" alt="${
    book.title
  }" class="bimg">
            </div>
            <div class="bookh">
                <h2>${book.title}</h2>
                <div class="book-detail-download">
                    <p>Id: ${book.id}</p>
                    <p><i class="fas fa-download feature-icon"></i> ${
                      book.download_count
                    }</p>
                    <p><i class="fas fa-copyright feature-icon"></i> ${
                      book.copyright
                    }</p>
                </div>
                <p>Author: ${book.authors
                  .map((author) => author.name)
                  .join(", ")}</p>
                <p>Genres: ${book.subjects.join(", ")}</p>
                <p>Bookshelves: ${book.bookshelves.join(", ")}</p>
                <p>Language: ${languages === "en" ? "English" : languages}</p>
                <p>${book.description || "No description available."}</p>
                <div>${
                  isInWishlist
                    ? 'In wishlist <i class="fa-solid fa-heart feature-icon"></i>'
                    : 'Not in wishlist <i class="fa-regular fa-heart feature-icon"></i>'
                }</div>
                <button style="margin-top:15px">
                    <a style="color:white; text-decoration:none" href="${
                      book.formats["text/html"]
                    }" target="_blank">Read Online</a>
                </button>
            </div>
        </div>
    `;
}

// Update wishlist count display
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.getElementById(
    "wishlist-count"
  ).textContent = `(${wishlist.length})`;
}

// Extract book ID from the URL
function getBookIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// When the page loads, fetch and display book details
document.addEventListener("DOMContentLoaded", () => {
  const bookId = getBookIdFromURL();
  if (bookId) {
    fetchBookDetails(bookId);
  }
  updateWishlistCount(); // Update wishlist count on page load
});
