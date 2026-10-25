/**
 * Database Configuration & Connection Module
 * -------------------------------------------
 * Supports:
 * 1. Primary: MySQL (using mysql2/promise)
 * 2. Automatic Fallback: Persistent Embedded JSON Data Engine
 *    (Ensures the lab application works seamlessly out-of-the-box
 *     even before MySQL user credentials are fully set up)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'bookstore_db';

const LOCAL_DB_PATH = path.join(__dirname, '..', 'db', 'bookstore_data.json');

let pool = null;
let dbEngine = 'none'; // 'mysql' | 'local'
let dbStatus = {
  engine: 'none',
  connected: false,
  message: 'Initializing...',
  host: `${DB_HOST}:${DB_PORT}`,
  database: DB_NAME
};

// Default seed dataset
const defaultData = {
  categories: [
    { id: 1, name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, JavaScript, Node.js, React, Full-stack', icon: 'bi-code-slash' },
    { id: 2, name: 'Computer Science', slug: 'computer-science', description: 'Data Structures, Algorithms, OS, Networks & Architecture', icon: 'bi-cpu' },
    { id: 3, name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Machine Learning, Deep Learning, NLP & Data Science', icon: 'bi-robot' },
    { id: 4, name: 'Fiction & Literature', slug: 'fiction-literature', description: 'Classics, Sci-Fi, Thrillers, Mystery & Drama', icon: 'bi-journal-bookmark' },
    { id: 5, name: 'Business & Finance', slug: 'business-finance', description: 'Economics, Personal Finance, Startups & Leadership', icon: 'bi-graph-up-arrow' },
    { id: 6, name: 'Self-Improvement', slug: 'self-improvement', description: 'Productivity, Habits, Mindset & Psychology', icon: 'bi-lightbulb' }
  ],
  books: [
    {
      id: 1,
      title: 'Full Stack Web Development with Node.js & React',
      author: 'Alex R. Banks',
      category_id: 1,
      isbn: '978-0134682006',
      price: 649.00,
      original_price: 899.00,
      rating: 4.8,
      reviews_count: 142,
      stock: 28,
      description: 'Master modern full-stack development using Node.js, Express, MySQL, and React with real-world enterprise applications.',
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'TechPress Media',
      pages: 520,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      category_id: 2,
      isbn: '978-0132350884',
      price: 599.00,
      original_price: 750.00,
      rating: 4.9,
      reviews_count: 310,
      stock: 45,
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. A classic guide on writing pristine code.',
      cover_image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'Prentice Hall',
      pages: 464,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow',
      author: 'Aurélien Géron',
      category_id: 3,
      isbn: '978-1492032649',
      price: 850.00,
      original_price: 1199.00,
      rating: 4.9,
      reviews_count: 215,
      stock: 18,
      description: 'Through a series of recent breakthroughs, deep learning has boosted the entire field of machine learning. Learn concepts through concrete code.',
      cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'O\'Reilly Media',
      pages: 850,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'The Pragmatic Programmer: 20th Anniversary Edition',
      author: 'David Thomas & Andrew Hunt',
      category_id: 2,
      isbn: '978-0135957059',
      price: 699.00,
      original_price: 950.00,
      rating: 4.8,
      reviews_count: 189,
      stock: 32,
      description: 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization of modern software development.',
      cover_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'Addison-Wesley',
      pages: 352,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Atomic Habits: Tiny Changes, Remarkable Results',
      author: 'James Clear',
      category_id: 6,
      isbn: '978-0735211292',
      price: 450.00,
      original_price: 599.00,
      rating: 4.9,
      reviews_count: 580,
      stock: 60,
      description: 'An easy and proven way to build good habits and break bad ones. Learn the transformative power of 1% improvement everyday.',
      cover_image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'Penguin Random House',
      pages: 320,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'The Psychology of Money: Timeless Lessons on Wealth',
      author: 'Morgan Housel',
      category_id: 5,
      isbn: '978-9390166268',
      price: 350.00,
      original_price: 499.00,
      rating: 4.7,
      reviews_count: 430,
      stock: 55,
      description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people.',
      cover_image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'Harriman House',
      pages: 256,
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      title: 'Introduction to Algorithms (CLRS Fourth Edition)',
      author: 'Thomas H. Cormen et al.',
      category_id: 2,
      isbn: '978-0262046305',
      price: 999.00,
      original_price: 1399.00,
      rating: 4.8,
      reviews_count: 175,
      stock: 20,
      description: 'Comprehensive textbook on algorithms, from sorting and data structures to dynamic programming, graph algorithms, and NP-completeness.',
      cover_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80',
      is_featured: 0,
      publisher: 'MIT Press',
      pages: 1312,
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      title: 'JavaScript: The Definitive Guide (Master the Web)',
      author: 'David Flanagan',
      category_id: 1,
      isbn: '978-1491952023',
      price: 720.00,
      original_price: 999.00,
      rating: 4.6,
      reviews_count: 98,
      stock: 25,
      description: 'Since 1996, JavaScript: The Definitive Guide has been the bible for JavaScript programmers. Updated for modern ECMAScript standards.',
      cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80',
      is_featured: 0,
      publisher: 'O\'Reilly Media',
      pages: 706,
      created_at: new Date().toISOString()
    },
    {
      id: 9,
      title: '1984 (Centennial Collector\'s Edition)',
      author: 'George Orwell',
      category_id: 4,
      isbn: '978-0451524935',
      price: 299.00,
      original_price: 399.00,
      rating: 4.7,
      reviews_count: 340,
      stock: 40,
      description: 'Orwell\'s haunting vision of a totalitarian dystopian society ruled by Big Brother and thought police remains chillingly relevant.',
      cover_image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80',
      is_featured: 0,
      publisher: 'Signet Classics',
      pages: 328,
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category_id: 4,
      isbn: '978-0061120084',
      price: 320.00,
      original_price: 450.00,
      rating: 4.9,
      reviews_count: 412,
      stock: 35,
      description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
      cover_image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80',
      is_featured: 0,
      publisher: 'Harper Perennial',
      pages: 336,
      created_at: new Date().toISOString()
    },
    {
      id: 11,
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      category_id: 2,
      isbn: '978-1449373320',
      price: 890.00,
      original_price: 1150.00,
      rating: 4.9,
      reviews_count: 290,
      stock: 22,
      description: 'The big ideas behind reliable, scalable, and maintainable systems. Key concepts behind distributed databases, streams, and replication.',
      cover_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=80',
      is_featured: 1,
      publisher: 'O\'Reilly Media',
      pages: 616,
      created_at: new Date().toISOString()
    },
    {
      id: 12,
      title: 'Zero to One: Notes on Startups',
      author: 'Peter Thiel with Blake Masters',
      category_id: 5,
      isbn: '978-0804139298',
      price: 399.00,
      original_price: 525.00,
      rating: 4.6,
      reviews_count: 260,
      stock: 30,
      description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.',
      cover_image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500&auto=format&fit=crop&q=80',
      is_featured: 0,
      publisher: 'Crown Business',
      pages: 224,
      created_at: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 1,
      full_name: 'Admin Librarian',
      email: 'admin@bookhaven.com',
      username: 'admin',
      // password: password123
      password: '$2b$10$g9lLGsEH1a99rJc3bB0t5.KM8mYOFbrpCP.rDkQetBkAtG8kgxG/q',
      phone: '9876543210',
      address: 'Central Library, Knowledge City',
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      full_name: 'Saber Mulla',
      email: 'saber@example.com',
      username: 'sabermulla',
      // password: password123
      password: '$2b$10$g9lLGsEH1a99rJc3bB0t5.KM8mYOFbrpCP.rDkQetBkAtG8kgxG/q',
      phone: '9123456780',
      address: 'FC Road, Pune, Maharashtra 411005',
      role: 'customer',
      created_at: new Date().toISOString()
    }
  ],
  orders: [],
  order_items: []
};

// Helper: Read local DB
function readLocalData() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(defaultData));
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db file:', err.message);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

// Helper: Save local DB
function writeLocalData(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local db file:', err.message);
  }
}

// Initialize MySQL Schema and Seed Data
async function initMySQL(connection) {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4;`);
  await connection.query(`USE \`${DB_NAME}\`;`);

  // Create Users
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create Categories
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL UNIQUE,
      slug VARCHAR(80) NOT NULL UNIQUE,
      description VARCHAR(255) DEFAULT NULL,
      icon VARCHAR(50) DEFAULT 'bi-book',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create Books
  await connection.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(150) NOT NULL,
      category_id INT NOT NULL,
      isbn VARCHAR(20) UNIQUE,
      price DECIMAL(10, 2) NOT NULL,
      original_price DECIMAL(10, 2) DEFAULT NULL,
      rating DECIMAL(2, 1) DEFAULT 4.5,
      reviews_count INT DEFAULT 0,
      stock INT DEFAULT 50,
      description TEXT,
      cover_image VARCHAR(500) DEFAULT NULL,
      is_featured TINYINT(1) DEFAULT 0,
      publisher VARCHAR(150) DEFAULT 'Pearson / O''Reilly',
      pages INT DEFAULT 350,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create Orders
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_number VARCHAR(30) NOT NULL UNIQUE,
      total_amount DECIMAL(10, 2) NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'Cash On Delivery',
      status ENUM('Pending', 'Processing', 'Shipped', 'Delivered') DEFAULT 'Processing',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create Order Items
  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      book_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Check if categories seeded
  const [catRows] = await connection.query(`SELECT COUNT(*) as count FROM categories`);
  if (catRows[0].count === 0) {
    for (const c of defaultData.categories) {
      await connection.query(
        `INSERT INTO categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.name, c.slug, c.description, c.icon]
      );
    }
  }

  // Check if books seeded
  const [bookRows] = await connection.query(`SELECT COUNT(*) as count FROM books`);
  if (bookRows[0].count === 0) {
    for (const b of defaultData.books) {
      await connection.query(
        `INSERT INTO books (id, title, author, category_id, isbn, price, original_price, rating, reviews_count, stock, description, cover_image, is_featured, publisher, pages)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.title, b.author, b.category_id, b.isbn, b.price, b.original_price, b.rating, b.reviews_count, b.stock, b.description, b.cover_image, b.is_featured, b.publisher, b.pages]
      );
    }
  }

  // Check if users seeded
  const [userRows] = await connection.query(`SELECT COUNT(*) as count FROM users`);
  if (userRows[0].count === 0) {
    for (const u of defaultData.users) {
      await connection.query(
        `INSERT INTO users (id, full_name, email, username, password, phone, address, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.full_name, u.email, u.username, u.password, u.phone, u.address, u.role]
      );
    }
  }
}

// Connect Database with Graceful Fallback
async function connectDB() {
  console.log('🔄 Connecting to Database...');
  try {
    // Attempt connecting to MySQL server
    const initConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    console.log('✅ Connected to MySQL Server successfully!');
    await initMySQL(initConn);
    await initConn.end();

    // Create pool for runtime operations
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    dbEngine = 'mysql';
    dbStatus = {
      engine: 'MySQL 8.0',
      connected: true,
      message: 'Connected to active MySQL instance',
      host: `${DB_HOST}:${DB_PORT}`,
      database: DB_NAME
    };

    console.log(`🚀 MySQL Database [${DB_NAME}] initialized and ready.`);
  } catch (err) {
    console.warn(`⚠️ MySQL Connection note (${err.code || err.message}).`);
    console.warn(`💡 Switching seamlessly to Local Embedded Storage Engine.`);
    console.warn(`   (To switch to MySQL, update DB_PASSWORD in .env or run db/schema.sql)`);

    // Ensure db folder exists and write default json file
    const dbDir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    readLocalData();

    dbEngine = 'local';
    dbStatus = {
      engine: 'Embedded Data Engine',
      connected: true,
      message: 'Active (Out-of-the-box fallback). MySQL ready whenever credentials are set.',
      file: 'db/bookstore_data.json',
      database: 'bookstore_local'
    };
    console.log(`📦 Local Data Storage initialized with 12 pre-loaded books & sample users.`);
  }
  return dbStatus;
}

// Unified DAO Methods for Users, Books, Categories, and Orders
const db = {
  getEngine: () => dbEngine,
  getStatus: () => dbStatus,

  // --- USERS ---
  users: {
    async findByEmailOrUsername(identifier) {
      if (dbEngine === 'mysql') {
        const [rows] = await pool.query(
          `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
          [identifier, identifier]
        );
        return rows[0] || null;
      } else {
        const data = readLocalData();
        return data.users.find(
          u => u.email.toLowerCase() === identifier.toLowerCase() ||
               u.username.toLowerCase() === identifier.toLowerCase()
        ) || null;
      }
    },

    async findById(id) {
      if (dbEngine === 'mysql') {
        const [rows] = await pool.query(
          `SELECT id, full_name, email, username, phone, address, role, created_at FROM users WHERE id = ? LIMIT 1`,
          [id]
        );
        return rows[0] || null;
      } else {
        const data = readLocalData();
        const user = data.users.find(u => u.id === parseInt(id, 10));
        if (!user) return null;
        const { password, ...safeUser } = user;
        return safeUser;
      }
    },

    async create(userObj) {
      if (dbEngine === 'mysql') {
        const [result] = await pool.query(
          `INSERT INTO users (full_name, email, username, password, phone, address, role)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userObj.full_name, userObj.email, userObj.username, userObj.password, userObj.phone || null, userObj.address || null, userObj.role || 'customer']
        );
        return { id: result.insertId, ...userObj };
      } else {
        const data = readLocalData();
        const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
        const newUser = {
          id: newId,
          full_name: userObj.full_name,
          email: userObj.email,
          username: userObj.username,
          password: userObj.password,
          phone: userObj.phone || '',
          address: userObj.address || '',
          role: userObj.role || 'customer',
          created_at: new Date().toISOString()
        };
        data.users.push(newUser);
        writeLocalData(data);
        return newUser;
      }
    }
  },

  // --- CATEGORIES ---
  categories: {
    async getAll() {
      if (dbEngine === 'mysql') {
        const [rows] = await pool.query(`SELECT * FROM categories ORDER BY id ASC`);
        return rows;
      } else {
        const data = readLocalData();
        return data.categories;
      }
    }
  },

  // --- BOOKS ---
  books: {
    async getAll(filters = {}) {
      const { category, search, minPrice, maxPrice, sort, featured } = filters;

      if (dbEngine === 'mysql') {
        let sql = `
          SELECT b.*, c.name as category_name, c.slug as category_slug 
          FROM books b 
          JOIN categories c ON b.category_id = c.id 
          WHERE 1=1
        `;
        const params = [];

        if (category && category !== 'all') {
          sql += ` AND (c.slug = ? OR c.name = ?)`;
          params.push(category, category);
        }

        if (search) {
          sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
          const term = `%${search}%`;
          params.push(term, term, term);
        }

        if (minPrice) {
          sql += ` AND b.price >= ?`;
          params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
          sql += ` AND b.price <= ?`;
          params.push(parseFloat(maxPrice));
        }

        if (featured === '1' || featured === true) {
          sql += ` AND b.is_featured = 1`;
        }

        if (sort === 'price-low') {
          sql += ` ORDER BY b.price ASC`;
        } else if (sort === 'price-high') {
          sql += ` ORDER BY b.price DESC`;
        } else if (sort === 'rating') {
          sql += ` ORDER BY b.rating DESC`;
        } else if (sort === 'title') {
          sql += ` ORDER BY b.title ASC`;
        } else {
          sql += ` ORDER BY b.id DESC`;
        }

        const [rows] = await pool.query(sql, params);
        return rows;
      } else {
        const data = readLocalData();
        let list = data.books.map(b => {
          const cat = data.categories.find(c => c.id === b.category_id);
          return {
            ...b,
            category_name: cat ? cat.name : 'General',
            category_slug: cat ? cat.slug : 'general'
          };
        });

        if (category && category !== 'all') {
          list = list.filter(b => b.category_slug === category || b.category_name.toLowerCase() === category.toLowerCase());
        }

        if (search) {
          const s = search.toLowerCase();
          list = list.filter(b =>
            b.title.toLowerCase().includes(s) ||
            b.author.toLowerCase().includes(s) ||
            (b.isbn && b.isbn.toLowerCase().includes(s))
          );
        }

        if (minPrice) list = list.filter(b => b.price >= parseFloat(minPrice));
        if (maxPrice) list = list.filter(b => b.price <= parseFloat(maxPrice));
        if (featured === '1' || featured === true) list = list.filter(b => b.is_featured === 1);

        if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
        else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
        else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
        else if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
        else list.sort((a, b) => b.id - a.id);

        return list;
      }
    },

    async getById(id) {
      if (dbEngine === 'mysql') {
        const [rows] = await pool.query(`
          SELECT b.*, c.name as category_name, c.slug as category_slug 
          FROM books b 
          JOIN categories c ON b.category_id = c.id 
          WHERE b.id = ? LIMIT 1
        `, [id]);
        return rows[0] || null;
      } else {
        const data = readLocalData();
        const book = data.books.find(b => b.id === parseInt(id, 10));
        if (!book) return null;
        const cat = data.categories.find(c => c.id === book.category_id);
        return {
          ...book,
          category_name: cat ? cat.name : 'General',
          category_slug: cat ? cat.slug : 'general'
        };
      }
    },

    async create(bookObj) {
      if (dbEngine === 'mysql') {
        const [result] = await pool.query(`
          INSERT INTO books (title, author, category_id, isbn, price, original_price, rating, reviews_count, stock, description, cover_image, is_featured, publisher, pages)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          bookObj.title,
          bookObj.author,
          bookObj.category_id,
          bookObj.isbn,
          bookObj.price,
          bookObj.original_price || (bookObj.price * 1.25),
          bookObj.rating || 4.5,
          bookObj.reviews_count || 1,
          bookObj.stock || 25,
          bookObj.description,
          bookObj.cover_image,
          bookObj.is_featured ? 1 : 0,
          bookObj.publisher || 'Independent Press',
          bookObj.pages || 300
        ]);
        return { id: result.insertId, ...bookObj };
      } else {
        const data = readLocalData();
        const newId = data.books.length > 0 ? Math.max(...data.books.map(b => b.id)) + 1 : 1;
        const newBook = {
          id: newId,
          title: bookObj.title,
          author: bookObj.author,
          category_id: parseInt(bookObj.category_id, 10),
          isbn: bookObj.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          price: parseFloat(bookObj.price),
          original_price: parseFloat(bookObj.original_price || (bookObj.price * 1.25)),
          rating: parseFloat(bookObj.rating || 4.5),
          reviews_count: parseInt(bookObj.reviews_count || 1, 10),
          stock: parseInt(bookObj.stock || 25, 10),
          description: bookObj.description,
          cover_image: bookObj.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
          is_featured: bookObj.is_featured ? 1 : 0,
          publisher: bookObj.publisher || 'Independent Press',
          pages: parseInt(bookObj.pages || 300, 10),
          created_at: new Date().toISOString()
        };
        data.books.push(newBook);
        writeLocalData(data);
        return newBook;
      }
    }
  },

  // --- ORDERS ---
  orders: {
    async create(orderData, items) {
      if (dbEngine === 'mysql') {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          const [orderRes] = await connection.query(
            `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderData.user_id, orderData.order_number, orderData.total_amount, orderData.shipping_address, orderData.payment_method, 'Processing']
          );
          const orderId = orderRes.insertId;

          for (const item of items) {
            await connection.query(
              `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
               VALUES (?, ?, ?, ?)`,
              [orderId, item.id, item.quantity, item.price]
            );
            // Deduct stock
            await connection.query(
              `UPDATE books SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
              [item.quantity, item.id]
            );
          }

          await connection.commit();
          return { id: orderId, ...orderData, items };
        } catch (err) {
          await connection.rollback();
          throw err;
        } finally {
          connection.release();
        }
      } else {
        const data = readLocalData();
        const orderId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
        const newOrder = {
          id: orderId,
          user_id: orderData.user_id,
          order_number: orderData.order_number,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          status: 'Processing',
          created_at: new Date().toISOString(),
          items: items.map(it => ({
            book_id: it.id,
            title: it.title,
            quantity: it.quantity,
            unit_price: it.price
          }))
        };

        // Decrement stock
        for (const item of items) {
          const book = data.books.find(b => b.id === item.id);
          if (book) {
            book.stock = Math.max(0, (book.stock || 0) - item.quantity);
          }
        }

        data.orders.push(newOrder);
        writeLocalData(data);
        return newOrder;
      }
    },

    async getByUserId(userId) {
      if (dbEngine === 'mysql') {
        const [orders] = await pool.query(
          `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`,
          [userId]
        );
        for (const order of orders) {
          const [items] = await pool.query(`
            SELECT oi.*, b.title, b.cover_image, b.author 
            FROM order_items oi 
            JOIN books b ON oi.book_id = b.id 
            WHERE oi.order_id = ?
          `, [order.id]);
          order.items = items;
        }
        return orders;
      } else {
        const data = readLocalData();
        return data.orders.filter(o => o.user_id === parseInt(userId, 10)).reverse();
      }
    }
  }
};

module.exports = {
  connectDB,
  db
};
