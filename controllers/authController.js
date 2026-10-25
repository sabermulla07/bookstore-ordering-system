const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// Regular expression for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { full_name, email, username, password, confirmPassword, phone, address } = req.body;

    // Validation checks
    if (!full_name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Full Name, Email, Username, Password).'
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if email or username already taken
    const existingUser = await db.users.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const existingUsername = await db.users.findByEmailOrUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Database
    const newUser = await db.users.create({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      role: 'customer'
    });

    const safeUser = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      username: newUser.username,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role
    };

    // Auto login with session
    req.session.user = safeUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to BookVerse.',
      user: safeUser
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing registration.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your Email/Username and Password.'
      });
    }

    // Find user by email or username
    const user = await db.users.findByEmailOrUsername(identifier.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'customer'
    };

    req.session.user = safeUser;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${safeUser.full_name}!`,
      user: safeUser
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging in.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
};

exports.getCurrentUser = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  }
  return res.status(200).json({
    success: true,
    authenticated: false,
    user: null
  });
};

exports.getDbStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    status: db.getStatus()
  });
};
