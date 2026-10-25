const { db } = require('../config/db');

exports.checkout = async (req, res) => {
  try {
    const { items, shipping_address, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add books before checkout.'
      });
    }

    if (!shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.'
      });
    }

    // Determine user ID (authenticated or fallback demo customer)
    const userId = (req.session && req.session.user) ? req.session.user.id : 2;

    // Calculate total amount
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await db.books.getById(item.id);
      if (!book) {
        return res.status(400).json({
          success: false,
          message: `Book with ID ${item.id} not found.`
        });
      }
      const qty = parseInt(item.quantity, 10) || 1;
      total += book.price * qty;
      orderItems.push({
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: qty
      });
    }

    // Add standard delivery fee / tax logic
    const finalTotal = total > 500 ? total : total + 40; // Free delivery over ₹500
    const orderNumber = 'BV-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    const orderRecord = await db.orders.create({
      user_id: userId,
      order_number: orderNumber,
      total_amount: finalTotal,
      shipping_address: shipping_address.trim(),
      payment_method: payment_method || 'Cash on Delivery'
    }, orderItems);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with BookVerse.',
      order: orderRecord
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order.'
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view your order history.'
      });
    }

    const orders = await db.orders.getByUserId(req.session.user.id);
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch order history.'
    });
  }
};
