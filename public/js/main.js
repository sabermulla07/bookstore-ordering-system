/**
 * BookVerse Shared Frontend Scripts
 * Handles: Session state, Cart management, Toast alerts, DB Status
 */

// Global User State
let currentUser = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  checkUserSession();
  checkDatabaseStatus();
  updateCartBadge();
  setupGlobalEvents();
});

// 1. Check Authentication Session
async function checkUserSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated && data.user) {
      currentUser = data.user;
      renderNavbarUser(data.user);
    } else {
      currentUser = null;
      renderNavbarGuest();
    }
  } catch (err) {
    console.warn('Session check warning:', err);
    renderNavbarGuest();
  }
}

// Render Logged-In User in Navbar
function renderNavbarUser(user) {
  const container = document.getElementById('navbar-auth-container');
  if (!container) return;

  container.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-person-circle fs-5"></i>
        <span class="fw-semibold">${escapeHtml(user.full_name.split(' ')[0])}</span>
        ${user.role === 'admin' ? '<span class="badge bg-danger ms-1">Admin</span>' : ''}
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
        <li class="px-3 py-2 text-muted small border-bottom">
          Signed in as <strong>@${escapeHtml(user.username)}</strong>
        </li>
        <li><a class="dropdown-item py-2" href="/cart"><i class="bi bi-bag-check me-2"></i>My Cart & Orders</a></li>
        ${user.role === 'admin' ? '<li><a class="dropdown-item py-2" href="#" data-bs-toggle="modal" data-bs-target="#addBookModal"><i class="bi bi-plus-circle me-2"></i>Add New Book</a></li>' : ''}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item py-2 text-danger" href="javascript:void(0)" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
      </ul>
    </div>
  `;
}

// Render Guest in Navbar
function renderNavbarGuest() {
  const container = document.getElementById('navbar-auth-container');
  if (!container) return;

  container.innerHTML = `
    <a href="/login" class="btn btn-outline-primary rounded-pill px-3 py-1 fw-semibold me-2">
      <i class="bi bi-box-arrow-in-right me-1"></i>Sign In
    </a>
    <a href="/register" class="btn btn-primary rounded-pill px-3 py-1 fw-semibold">
      <i class="bi bi-person-plus me-1"></i>Register
    </a>
  `;
}

// 2. Database Status Check
async function checkDatabaseStatus() {
  try {
    const res = await fetch('/api/auth/db-status');
    const data = await res.json();
    const badgeEl = document.getElementById('db-status-badge');
    if (badgeEl && data.status) {
      if (data.status.engine.includes('MySQL')) {
        badgeEl.className = 'db-badge mysql';
        badgeEl.innerHTML = `<span class="db-indicator-dot"></span> <strong>Database:</strong> MySQL 8.0 (${data.status.database})`;
      } else {
        badgeEl.className = 'db-badge';
        badgeEl.innerHTML = `<span class="db-indicator-dot"></span> <strong>Database Engine:</strong> Active (Ready for MySQL / JSON)`;
      }
    }
  } catch (err) {
    // Ignore error in display
  }
}

// 3. User Logout
async function handleLogout() {
  try {
    const res = await fetch('/api/auth/logout');
    const data = await res.json();
    if (data.success) {
      showToast('Logged out successfully.', 'info');
      setTimeout(() => {
        window.location.href = '/login';
      }, 700);
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// 4. Cart Management via LocalStorage
const CART_STORAGE_KEY = 'bookverse_cart_items';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(book, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === book.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: parseFloat(book.price),
      cover_image: book.cover_image,
      isbn: book.isbn,
      quantity: quantity
    });
  }
  saveCart(cart);
  showToast(`Added "${book.title.slice(0, 25)}..." to your cart!`, 'success');
}

function removeFromCart(bookId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== parseInt(bookId, 10));
  saveCart(cart);
  showToast('Item removed from cart.', 'info');
}

function updateCartQuantity(bookId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === parseInt(bookId, 10));
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      return removeFromCart(bookId);
    }
    saveCart(cart);
  }
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
}

function updateCartBadge() {
  const badgeEl = document.getElementById('navbar-cart-count');
  if (!badgeEl) return;
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badgeEl.textContent = totalCount;
  badgeEl.style.display = totalCount > 0 ? 'inline-block' : 'none';
}

// 5. Toast Notification System
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  
  let icon = 'bi-info-circle';
  if (type === 'success') icon = 'bi-check-circle-fill text-success';
  if (type === 'error') icon = 'bi-exclamation-triangle-fill text-danger';
  if (type === 'warning') icon = 'bi-exclamation-circle-fill text-warning';

  toast.innerHTML = `
    <i class="bi ${icon} fs-5"></i>
    <div class="flex-grow-1">${escapeHtml(message)}</div>
    <button type="button" class="btn-close btn-close-sm" style="font-size:0.75rem;" onclick="this.parentElement.remove()"></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 6. Utility Functions
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  return '₹ ' + parseFloat(amount).toFixed(2);
}

function setupGlobalEvents() {
  // Global search redirect from navbar
  const navSearchForm = document.getElementById('nav-search-form');
  if (navSearchForm) {
    navSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('nav-search-input')?.value.trim();
      if (query) {
        window.location.href = `/catalogue?search=${encodeURIComponent(query)}`;
      }
    });
  }
}
