const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing and security middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bookverse_wt_lab_06_secure_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false // true if HTTPS in production
    }
  })
);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

// Page Routing (Friendly URLs for Lab evaluation)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/catalogue', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'catalogue.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// 404 Catch-all
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server after connecting to Database
async function startServer() {
  try {
    const status = await connectDB();
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`📚 BookVerse Online Book Store Server is Running!`);
      console.log(`🌐 Local URL: http://localhost:${PORT}`);
      console.log(`🗄️  Active Database Engine: ${status.engine}`);
      console.log(`📑 1) Home Page:         http://localhost:${PORT}/`);
      console.log(`🔐 2) Login Page:        http://localhost:${PORT}/login`);
      console.log(`📖 3) Catalogue Page:    http://localhost:${PORT}/catalogue`);
      console.log(`📝 4) Registration Page: http://localhost:${PORT}/register`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
