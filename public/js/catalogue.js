/**
 * Catalogue Page JavaScript
 * Handles filtering, search, sorting, grid/list view, modal view, and cart integration
 */

// Catalogue State
const catalogueState = {
  category: 'all',
  search: '',
  maxPrice: 1500,
  sort: 'featured',
  viewMode: 'grid', // 'grid' | 'list'
  allBooks: []
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Read initial query params from URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    catalogueState.category = urlParams.get('category');
  }
  if (urlParams.has('search')) {
    catalogueState.search = urlParams.get('search');
    const searchInput = document.getElementById('filter-search');
    if (searchInput) searchInput.value = catalogueState.search;
  }

  // Update Category active UI based on URL
  updateCategoryUI();

  // Setup Event Listeners
  setupCatalogueEvents();

  // Initial Fetch
  fetchCatalogueBooks();
});

// Setup All Controls & Filters
function setupCatalogueEvents() {
  // Category item clicks
  const categoryItems = document.querySelectorAll('.category-filter-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      catalogueState.category = item.dataset.category;
      updateCategoryUI();
      fetchCatalogueBooks();
    });
  });

  // Price range slider
  const priceSlider = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-range-val');
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      priceDisplay.textContent = `₹${parseInt(val).toLocaleString()}`;
      catalogueState.maxPrice = val;
    });
    priceSlider.addEventListener('change', () => {
      fetchCatalogueBooks();
    });
  }

  // Preset budget buttons
  document.querySelectorAll('.filter-budget-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const max = btn.dataset.max;
      if (priceSlider && priceDisplay) {
        priceSlider.value = max;
        priceDisplay.textContent = `₹${max}`;
        catalogueState.maxPrice = max;
        fetchCatalogueBooks();
      }
    });
  });

  // Search input and trigger button
  const searchInput = document.getElementById('filter-search');
  const searchBtn = document.getElementById('btn-search-trigger');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      catalogueState.search = searchInput.value.trim();
      fetchCatalogueBooks();
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        catalogueState.search = searchInput.value.trim();
        fetchCatalogueBooks();
      }
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogueState.sort = e.target.value;
      fetchCatalogueBooks();
    });
  }

  // View Mode Switchers
  const btnGrid = document.getElementById('btn-view-grid');
  const btnList = document.getElementById('btn-view-list');
  if (btnGrid && btnList) {
    btnGrid.addEventListener('click', () => {
      catalogueState.viewMode = 'grid';
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      renderBooks(catalogueState.allBooks);
    });
    btnList.addEventListener('click', () => {
      catalogueState.viewMode = 'list';
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      renderBooks(catalogueState.allBooks);
    });
  }

  // Reset Filters
  const btnReset = document.getElementById('btn-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      catalogueState.category = 'all';
      catalogueState.search = '';
      catalogueState.maxPrice = 1500;
      catalogueState.sort = 'featured';
      
      if (searchInput) searchInput.value = '';
      if (priceSlider) priceSlider.value = 1500;
      if (priceDisplay) priceDisplay.textContent = '₹1,500';
      if (sortSelect) sortSelect.value = 'featured';

      updateCategoryUI();
      fetchCatalogueBooks();
    });
  }

  // Add Book Admin Form
  const addBookForm = document.getElementById('add-book-form');
  if (addBookForm) {
    addBookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addBookForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Book inserted into Database successfully!', 'success');
          addBookForm.reset();
          const modalEl = document.getElementById('addBookModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          fetchCatalogueBooks();
        } else {
          showToast(data.message || 'Error inserting book.', 'error');
        }
      } catch (err) {
        showToast('Server communication error.', 'error');
      }
    });
  }
}

// Update Active Category in Sidebar UI
function updateCategoryUI() {
  const categoryItems = document.querySelectorAll('.category-filter-item');
  categoryItems.forEach(item => {
    if (item.dataset.category === catalogueState.category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Fetch Books from Server API
async function fetchCatalogueBooks() {
  const container = document.getElementById('catalogue-books-container');
  const countText = document.getElementById('catalogue-count-text');

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Fetching books...</span>
      </div>
      <p class="text-muted mt-2 small">Querying database...</p>
    </div>
  `;

  // Build query string
  const params = new URLSearchParams();
  if (catalogueState.category && catalogueState.category !== 'all') {
    params.set('category', catalogueState.category);
  }
  if (catalogueState.search) {
    params.set('search', catalogueState.search);
  }
  if (catalogueState.maxPrice) {
    params.set('maxPrice', catalogueState.maxPrice);
  }
  if (catalogueState.sort) {
    params.set('sort', catalogueState.sort);
  }

  try {
    const res = await fetch(`/api/books?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      catalogueState.allBooks = data.books || [];
      if (countText) {
        countText.textContent = `${catalogueState.allBooks.length} Books Found`;
      }
      renderBooks(catalogueState.allBooks);
    } else {
      container.innerHTML = `<div class="col-12 alert alert-warning">${data.message}</div>`;
    }
  } catch (err) {
    console.error('Fetch error:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <h5>Could not connect to database service.</h5>
        <p class="small text-muted">Make sure the Node.js server is running and database is reachable.</p>
      </div>
    `;
  }
}

// Render Books in Grid or List Mode
function renderBooks(books) {
  const container = document.getElementById('catalogue-books-container');

  if (!books || books.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 bg-white rounded-3 border">
        <i class="bi bi-journal-x text-muted display-4"></i>
        <h5 class="fw-bold mt-3 mb-1">No Books Matched Your Filters</h5>
        <p class="text-muted small mb-3">Try adjusting your price range, keywords, or selected genre.</p>
        <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="document.getElementById('btn-reset-filters').click()">
          <i class="bi bi-arrow-repeat me-1"></i>Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  if (catalogueState.viewMode === 'list') {
    // List View
    container.innerHTML = books.map(book => renderBookListItem(book)).join('');
  } else {
    // Grid View
    container.innerHTML = books.map(book => renderBookGridItem(book)).join('');
  }
}

// Render Grid Item
function renderBookGridItem(book) {
  const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
  return `
    <div class="col-sm-6 col-md-4">
      <div class="book-card">
        <div class="book-cover-wrap">
          <img src="${escapeHtml(book.cover_image)}" alt="${escapeHtml(book.title)}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'">
          ${discount > 0 ? `<span class="book-badge-discount">${discount}% OFF</span>` : ''}
          <span class="book-badge-category">${escapeHtml(book.category_name || 'Academic')}</span>
        </div>
        <div class="book-card-body">
          <h5 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h5>
          <div class="book-author"><i class="bi bi-person me-1"></i>${escapeHtml(book.author)}</div>
          <div class="book-rating">
            <span class="stars"><i class="bi bi-star-fill"></i></span>
            <span class="fw-bold">${book.rating || 4.5}</span>
            <span class="text-muted">(${book.reviews_count || 12})</span>
          </div>
          <div class="book-price-row">
            <div>
              <span class="current-price">₹${parseFloat(book.price).toFixed(2)}</span>
              ${book.original_price ? `<span class="original-price">₹${parseFloat(book.original_price).toFixed(2)}</span>` : ''}
            </div>
            <span class="badge ${book.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill">
              ${book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <div class="book-actions">
            <button class="btn-add-cart" onclick='addToCart(${JSON.stringify(book).replace(/'/g, "&apos;")})'>
              <i class="bi bi-cart-plus"></i> Add
            </button>
            <button class="btn-quick-view" onclick="openCatalogueQuickView(${book.id})" title="Details">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render List Item
function renderBookListItem(book) {
  const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
  return `
    <div class="col-12">
      <div class="book-card book-card-list">
        <div class="book-cover-wrap">
          <img src="${escapeHtml(book.cover_image)}" alt="${escapeHtml(book.title)}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'">
          ${discount > 0 ? `<span class="book-badge-discount">${discount}% OFF</span>` : ''}
          <span class="book-badge-category">${escapeHtml(book.category_name || 'Academic')}</span>
        </div>
        <div class="book-card-body justify-content-between">
          <div>
            <h5 class="book-title mb-1">${escapeHtml(book.title)}</h5>
            <div class="book-author mb-2"><i class="bi bi-person me-1"></i>By ${escapeHtml(book.author)}</div>
            <div class="book-rating mb-2">
              <span class="stars"><i class="bi bi-star-fill"></i></span>
              <span class="fw-bold">${book.rating || 4.5}</span>
              <span class="text-muted">(${book.reviews_count || 12} reviews) &bull; ${book.publisher || 'Tech Media'}</span>
            </div>
            <p class="text-secondary small mb-3 text-truncate" style="max-width: 600px;">
              ${escapeHtml(book.description || '')}
            </p>
          </div>
          <div class="d-flex flex-wrap align-items-center justify-content-between pt-2 border-top">
            <div>
              <span class="current-price fs-4">₹${parseFloat(book.price).toFixed(2)}</span>
              ${book.original_price ? `<span class="original-price">₹${parseFloat(book.original_price).toFixed(2)}</span>` : ''}
              <span class="badge ${book.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill ms-2">
                ${book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm px-3 rounded-pill" onclick="openCatalogueQuickView(${book.id})">
                <i class="bi bi-eye me-1"></i>Quick View
              </button>
              <button class="btn btn-primary btn-sm px-4 rounded-pill" onclick='addToCart(${JSON.stringify(book).replace(/'/g, "&apos;")})'>
                <i class="bi bi-cart-plus me-1"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Open Quick View Modal for Catalogue
async function openCatalogueQuickView(bookId) {
  try {
    const res = await fetch(`/api/books/${bookId}`);
    const data = await res.json();
    if (data.success && data.book) {
      const b = data.book;
      const modalBody = document.getElementById('quick-view-modal-content');
      modalBody.innerHTML = `
        <div class="row g-4">
          <div class="col-md-5 text-center">
            <img src="${escapeHtml(b.cover_image)}" alt="${escapeHtml(b.title)}" class="img-fluid rounded-3 shadow" style="max-height: 320px; object-fit: cover;">
          </div>
          <div class="col-md-7">
            <span class="badge bg-primary-subtle text-primary mb-2">${escapeHtml(b.category_name || 'Academic')}</span>
            <h4 class="fw-bold mb-1">${escapeHtml(b.title)}</h4>
            <p class="text-muted mb-2">By <strong>${escapeHtml(b.author)}</strong></p>
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="text-warning"><i class="bi bi-star-fill"></i> ${b.rating}</span>
              <span class="text-muted">(${b.reviews_count} reviews)</span>
              <span class="badge bg-success-subtle text-success ms-2">${b.stock} Copies in Stock</span>
            </div>
            <div class="mb-3">
              <span class="fs-3 fw-bold text-primary">₹${parseFloat(b.price).toFixed(2)}</span>
              ${b.original_price ? `<span class="text-muted text-decoration-line-through ms-2">₹${parseFloat(b.original_price).toFixed(2)}</span>` : ''}
            </div>
            <p class="text-secondary small mb-3">${escapeHtml(b.description)}</p>
            <div class="small text-muted mb-4 border-top pt-2">
              <div><strong>ISBN:</strong> ${escapeHtml(b.isbn || 'N/A')}</div>
              <div><strong>Publisher:</strong> ${escapeHtml(b.publisher || 'Tech Media')}</div>
              <div><strong>Pages:</strong> ${b.pages || 350} pages</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-primary rounded-pill px-4 flex-grow-1" onclick='addToCart(${JSON.stringify(b).replace(/'/g, "&apos;")}); bootstrap.Modal.getInstance(document.getElementById("quickViewModal")).hide();'>
                <i class="bi bi-cart-plus me-1"></i> Add to Cart
              </button>
              <a href="/cart" class="btn btn-warning rounded-pill px-4 text-dark fw-bold" onclick='addToCart(${JSON.stringify(b).replace(/'/g, "&apos;")})'>
                Buy Now
              </a>
            </div>
          </div>
        </div>
      `;
      const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
      modal.show();
    }
  } catch (e) {
    console.error(e);
  }
}
