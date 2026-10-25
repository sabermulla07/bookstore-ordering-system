const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.getBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', bookController.getBookById);
router.post('/', bookController.createBook);

module.exports = router;
