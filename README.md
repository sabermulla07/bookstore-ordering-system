# Web Technology Assignment - Lab 06
## Responsive Online Book Store Website (BookVerse)

A responsive, full-stack web application designed and developed using **Node.js**, **Express.js**, and **MySQL**, featuring complete user authentication, dynamic catalogue filtering, shopping cart, and database persistence.

---

### 📋 Assignment Problem Statement
> **6. With the help of ChatGPT / AI code generation tools, design and develop a responsive website for an online book store using Node JS and MySQL/MongoDB/Oracle having:**
> 1. **Home Page**
> 2. **Login Page**
> 3. **Catalogue Page**
> 4. **Registration Page (with direct Database connectivity)**

---

### 🌐 System Architecture & Technologies Used

```
+-------------------------------------------------------------------------+
|                          CLIENT / FRONTEND                              |
|  - HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons                          |
|  - Dynamic Client-Side Routing & RESTful fetch() API                    |
|  - Real-time Form Validation & Password Strength Meter                  |
|  - Local Storage Cart State Management                                  |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP Requests (JSON / Forms)
                                     v
+-------------------------------------------------------------------------+
|                       SERVER / APPLICATION TIER                         |
|  - Node.js (v24.x LTS) Runtime Environment                              |
|  - Express.js 4.x Web Server & Router                                   |
|  - express-session & cookie-parser (Session Authentication)             |
|  - bcryptjs (Salted Cryptographic Password Hashing)                     |
|  - Unified Data Access Object (DAO) Layer                               |
+------------------------------------+------------------------------------+
                                     |
                                     | Asynchronous Pool Connection
                                     v
+-------------------------------------------------------------------------+
|                        DATABASE PERSISTENCE TIER                        |
|  - MySQL 8.0 Community Server (InnoDB Engine) via mysql2/promise        |
|  - Tables: users, categories, books, orders, order_items                |
|  - Auto-Fallback: Built-in Persistent Data Engine for offline lab demo  |
+-------------------------------------------------------------------------+
```

---

### 📑 The 4 Required Pages Breakdown

#### 1) 🏠 Home Page (`/` or `index.html`)
- **Live Status Header**: Real-time indicator displaying database health (`MySQL 8.0 Connected: bookstore_db`).
- **Brand Navigation**: Responsive navbar with search input, dynamic cart count badge, and authentication state (Sign In / Register or Logged-in User Dropdown).
- **Hero Banner**: Inspiring typography, quick search box with redirect, and stats counter (10k+ books, 4.9★ rating).
- **Genre Showcase**: Quick category cards (Web Dev, Computer Science, AI & ML, Literature, Business, Self-Help).
- **Featured Books Section**: Dynamic carousel/grid loaded asynchronously from database (`GET /api/books?featured=1`).
- **Promotional Deals**: 25% Academic student discount banner and service trust badges (Free shipping over ₹500, SSL security).

#### 2) 🔐 Login Page (`/login`)
- **Responsive Split Card**: Informative student benefits sidebar paired with clean authentication form.
- **Form Controls**: Email/Username and Password fields with interactive eye icon to toggle password visibility.
- **Security**: Asynchronous submission to `POST /api/auth/login`. Password verified using **bcrypt** hash comparison.
- **Quick Evaluation Helpers**: One-click demo credential buttons for examiner testing:
  - **Student Demo**: `sabermulla` / `password123`
  - **Admin Demo**: `admin` / `password123`

#### 3) 📖 Catalogue Page (`/catalogue`)
- **Filter Sidebar**: Collapsible multi-parameter filtering panel:
  - **Category Filter**: All, Web Development, Computer Science, AI, Fiction, Business, Self-Help.
  - **Price Range Slider**: Dynamic slider from ₹200 to ₹1,500 with instant value indicator.
  - **Budget Presets**: One-click buttons (< ₹400, < ₹700, < ₹1000).
  - **Keyword Search**: Instant query by title, author, or ISBN.
- **View Mode Switcher**: Toggle between responsive **Grid View** and detailed **List View**.
- **Book Cards**: Display book cover, discount tag, category badge, author, ratings, stock status, and pricing.
- **Interactive Actions**:
  - **Add to Cart**: Instantly increments shopping cart with animated toast notification.
  - **Quick View Modal**: Displays full book synopsis, ISBN, publisher, pages, and direct purchase option.
- **Admin Book Insertion**: Live modal allowing direct insertion of new books into the MySQL database.

#### 4) 📝 Registration Page (`/register`)
- **Complete Profile Form**: Fields for Full Name, Email, Username, Phone Number, Delivery Address, Password, and Confirm Password.
- **Real-Time Client Validation**:
  - Email format validation with regex check.
  - Dynamic **Password Strength Meter** (Weak, Medium, Strong) with visual color fill.
  - Instant **Password Match Confirmation** indicator.
- **Database Connectivity**: Sends AJAX payload to `POST /api/auth/register`:
  - Enforces uniqueness on email and username in the database.
  - Generates salted hash with **bcryptjs** (10 salt rounds).
  - Inserts new user into MySQL `users` table and creates immediate session.
- **One-Click Test Data Button**: Instantly autofills sample student details for fast evaluation.

#### 🌟 Bonus Feature: Cart & Checkout (`/cart`)
- Shopping cart table with quantity adjusters (+ / -), item removal, and subtotal calculation.
- Automatic free shipping threshold application (orders over ₹500 get Free Delivery).
- Order checkout with multiple payment methods (Cash on Delivery, UPI, Cards) saving orders into `orders` and `order_items` tables.

---

### 🗄️ Relational Database Schema (`bookstore_db`)

| Table | Primary Key | Key Attributes | Foreign Keys |
| :--- | :--- | :--- | :--- |
| `users` | `id` (INT, AI) | `full_name`, `email` (UQ), `username` (UQ), `password` (Hash), `phone`, `address`, `role` | — |
| `categories` | `id` (INT, AI) | `name` (UQ), `slug` (UQ), `description`, `icon` | — |
| `books` | `id` (INT, AI) | `title`, `author`, `isbn` (UQ), `price`, `rating`, `stock`, `description`, `cover_image` | `category_id` $\rightarrow$ `categories(id)` |
| `orders` | `id` (INT, AI) | `order_number` (UQ), `total_amount`, `shipping_address`, `payment_method`, `status` | `user_id` $\rightarrow$ `users(id)` |
| `order_items` | `id` (INT, AI) | `quantity`, `unit_price` | `order_id` $\rightarrow$ `orders(id)`, `book_id` $\rightarrow$ `books(id)` |

---

### 🚀 How to Run the Project

#### Method 1: One-Click Windows Batch Runner (Recommended)
Simply double-click the included batch file:
```
run_server.bat
```
This script will:
1. Detect Node.js installation.
2. Install npm dependencies automatically if `node_modules` is missing.
3. Automatically launch your default web browser to `http://localhost:3000`.
4. Start the Node.js Express server.

#### Method 2: Manual Terminal Execution
1. Open PowerShell or Command Prompt in this `LAB 06` directory:
   ```powershell
   npm install
   ```
2. (Optional) If you wish to use your local MySQL server:
   - Ensure MySQL service is running.
   - Set your MySQL root password in `.env`:
     ```ini
     DB_PASSWORD=your_mysql_password
     ```
   - Import the schema via MySQL CLI or MySQL Workbench:
     ```powershell
     mysql -u root -p < db/schema.sql
     ```
   *(Note: If MySQL credentials are left blank or unavailable, the application automatically activates its embedded storage engine so it works 100% out-of-the-box without crashing!)*
3. Start the application:
   ```powershell
   node server.js
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### 🧪 Automated Verification Suite
To execute the automated unit test suite verifying all 4 pages and database endpoints:
```powershell
node test_server.js
```
Expected output:
```
🧪 Starting BookVerse Verification Tests...
  ✅ [PASS] 1. Home Page renders (GET /)
  ✅ [PASS] 2. Login Page renders (GET /login)
  ✅ [PASS] 3. Catalogue Page renders (GET /catalogue)
  ✅ [PASS] 4. Registration Page renders (GET /register)
  ✅ [PASS] 5. Books API returns catalogue data (GET /api/books)
  ✅ [PASS] 6. Categories API returns genre list (GET /api/books/categories)
  ✅ [PASS] 7. User Login verification (POST /api/auth/login)
  ✅ [PASS] 8. User Registration to database (POST /api/auth/register)
  ✅ [PASS] 9. Cart Checkout saves order to database (POST /api/orders/checkout)

📊 Test Results: 9/9 passed (100% success)
```

---

### 📁 Project Directory Structure
```
LAB 06/
├── config/
│   └── db.js                    # Dual-mode DB manager (MySQL + Auto-Fallback)
├── controllers/
│   ├── authController.js        # User registration, login & session
│   ├── bookController.js        # Catalogue query, filtering & book creation
│   └── orderController.js       # Cart checkout & order management
├── routes/
│   ├── authRoutes.js            # /api/auth routes
│   ├── bookRoutes.js            # /api/books routes
│   └── orderRoutes.js           # /api/orders routes
├── public/
│   ├── css/
│   │   └── style.css            # Responsive layout, animations & theme
│   ├── js/
│   │   ├── auth.js              # Password meter & client validation
│   │   ├── catalogue.js         # Catalogue filters, search, modal & sorting
│   │   └── main.js              # Navbar session, cart badge, toast system
│   ├── index.html               # 1) Home Page
│   ├── login.html               # 2) Login Page
│   ├── catalogue.html           # 3) Catalogue Page
│   ├── register.html            # 4) Registration Page
│   └── cart.html                # Cart & Checkout Page
├── db/
│   └── schema.sql               # MySQL DDL & Seed Script
├── .env                         # Server & Database Environment Variables
├── .env.example                 # Environment configuration template
├── server.js                    # Express Application Entrypoint
├── package.json                 # Project dependencies & scripts
├── run_server.bat               # 1-Click Windows Runner
├── test_server.js               # Automated 9-point verification suite
├── make_word_doc.py             # Academic Word Report Generator
├── WT_Assignment_06_Report.docx # Formatted Laboratory Assignment Report
└── README.md                    # Project Documentation
```

---

### 🎓 Academic Viva Questions & Answers

1. **What is the significance of using Node.js for an online book store?**
   - Node.js utilizes an event-driven, non-blocking I/O model based on the V8 JavaScript engine. This allows the server to handle thousands of concurrent requests (such as concurrent catalogue searches and book views) with minimal CPU and memory overhead compared to traditional thread-per-request architectures.

2. **Why is password hashing necessary, and why choose bcrypt?**
   - Storing passwords in plain text creates critical security liabilities. `bcrypt` utilizes a slow, adaptive cryptographic algorithm with configurable salt rounds. The random salt prevents pre-computed rainbow table attacks, and the work factor can be scaled over time as hardware speeds increase to mitigate brute-force cracking.

3. **How does connection pooling work in mysql2?**
   - Creating a new TCP connection to MySQL for every incoming HTTP request causes high latency and resource churn. A connection pool pre-allocates a fixed pool of active connections, loans them out when queries execute, and immediately returns them to the pool upon completion.

4. **What ensures responsiveness across diverse screen viewports?**
   - The application employs Bootstrap 5's flexbox-based 12-column grid system, relative viewport units, collapsible navigation menus for mobile devices, and CSS media queries to dynamically adjust typography and multi-column layouts across mobile phones, tablets, and wide desktop displays.
