const { db } = require('../config/db');

exports.getBooks = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sort: req.query.sort,
      featured: req.query.featured
    };

    const books = await db.books.getAll(filters);
    return res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (err) {
    console.error('Error fetching books:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve books from database.'
    });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await db.books.getById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }
    return res.status(200).json({
      success: true,
      book
    });
  } catch (err) {
    console.error('Error fetching book by ID:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book details.'
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await db.categories.getAll();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.'
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, category_id, isbn, price, original_price, description, cover_image, publisher, pages } = req.body;

    if (!title || !author || !category_id || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, Author, Category, and Price are required.'
      });
    }

    const newBook = await db.books.create({
      title: title.trim(),
      author: author.trim(),
      category_id: parseInt(category_id, 10),
      isbn: isbn ? isbn.trim() : null,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      description: description ? description.trim() : 'Comprehensive guide and textbook.',
      cover_image: cover_image ? cover_image.trim() : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      publisher: publisher ? publisher.trim() : 'Independent Publishing',
      pages: pages ? parseInt(pages, 10) : 350,
      rating: 4.5,
      reviews_count: 5,
      is_featured: 0
    });

    return res.status(201).json({
      success: true,
      message: 'New book successfully added to catalogue!',
      book: newBook
    });
  } catch (err) {
    console.error('Error adding book:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add book to database.'
    });
  }
};
