-- =======================================================
-- Database Schema for Online Book Store (BookVerse)
-- Designed for Web Technology Lab 06 Assignment
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- =======================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS `bookstore_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bookstore_db`;

-- 2. Users Table (Stores user credentials and profile)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `role` ENUM('customer', 'admin') DEFAULT 'customer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(80) NOT NULL UNIQUE,
    `slug` VARCHAR(80) NOT NULL UNIQUE,
    `description` VARCHAR(255) DEFAULT NULL,
    `icon` VARCHAR(50) DEFAULT 'bi-book',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Books Table (Stores book catalogue information)
CREATE TABLE IF NOT EXISTS `books` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `author` VARCHAR(150) NOT NULL,
    `category_id` INT NOT NULL,
    `isbn` VARCHAR(20) UNIQUE,
    `price` DECIMAL(10, 2) NOT NULL,
    `original_price` DECIMAL(10, 2) DEFAULT NULL,
    `rating` DECIMAL(2, 1) DEFAULT 4.5,
    `reviews_count` INT DEFAULT 0,
    `stock` INT DEFAULT 50,
    `description` TEXT,
    `cover_image` VARCHAR(500) DEFAULT NULL,
    `is_featured` TINYINT(1) DEFAULT 0,
    `publisher` VARCHAR(150) DEFAULT 'Pearson / O\'Reilly',
    `pages` INT DEFAULT 350,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `order_number` VARCHAR(30) NOT NULL UNIQUE,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'Cash On Delivery',
    `status` ENUM('Pending', 'Processing', 'Shipped', 'Delivered') DEFAULT 'Processing',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `book_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =======================================================
-- SEED INITIAL DATA
-- =======================================================

-- Categories Seed Data
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`) VALUES
(1, 'Web Development', 'web-development', 'HTML, CSS, JavaScript, Node.js, React, Full-stack', 'bi-code-slash'),
(2, 'Computer Science', 'computer-science', 'Data Structures, Algorithms, OS, Networks & Architecture', 'bi-cpu'),
(3, 'Artificial Intelligence', 'artificial-intelligence', 'Machine Learning, Deep Learning, NLP & Data Science', 'bi-robot'),
(4, 'Fiction & Literature', 'fiction-literature', 'Classics, Sci-Fi, Thrillers, Mystery & Drama', 'bi-journal-bookmark'),
(5, 'Business & Finance', 'business-finance', 'Economics, Personal Finance, Startups & Leadership', 'bi-graph-up-arrow'),
(6, 'Self-Improvement', 'self-improvement', 'Productivity, Habits, Mindset & Psychology', 'bi-lightbulb')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Books Seed Data
INSERT INTO `books` (`id`, `title`, `author`, `category_id`, `isbn`, `price`, `original_price`, `rating`, `reviews_count`, `stock`, `description`, `cover_image`, `is_featured`, `publisher`, `pages`) VALUES
(1, 'Full Stack Web Development with Node.js & React', 'Alex R. Banks', 1, '978-0134682006', 649.00, 899.00, 4.8, 142, 28, 'Master modern full-stack development using Node.js, Express, MongoDB, and React with real-world enterprise applications.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', 1, 'TechPress Media', 520),
(2, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 2, '978-0132350884', 599.00, 750.00, 4.9, 310, 45, 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. A classic guide on writing pristine code.', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=80', 1, 'Prentice Hall', 464),
(3, 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow', 'Aurélien Géron', 3, '978-1492032649', 850.00, 1199.00, 4.9, 215, 18, 'Through a series of recent breakthroughs, deep learning has boosted the entire field of machine learning. Learn concepts through concrete code.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80', 1, 'O\'Reilly Media', 850),
(4, 'The Pragmatic Programmer: 20th Anniversary Edition', 'David Thomas & Andrew Hunt', 2, '978-0135957059', 699.00, 950.00, 4.8, 189, 32, 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization of modern software development.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80', 1, 'Addison-Wesley', 352),
(5, 'Atomic Habits: Tiny Changes, Remarkable Results', 'James Clear', 6, '978-0735211292', 450.00, 599.00, 4.9, 580, 60, 'An easy and proven way to build good habits and break bad ones. Learn the transformative power of 1% improvement everyday.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80', 1, 'Penguin Random House', 320),
(6, 'The Psychology of Money: Timeless Lessons on Wealth', 'Morgan Housel', 5, '978-9390166268', 350.00, 499.00, 4.7, 430, 55, 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people.', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&auto=format&fit=crop&q=80', 1, 'Harriman House', 256),
(7, 'Introduction to Algorithms (CLRS Fourth Edition)', 'Thomas H. Cormen et al.', 2, '978-0262046305', 999.00, 1399.00, 4.8, 175, 20, 'Comprehensive textbook on algorithms, from sorting and data structures to dynamic programming, graph algorithms, and NP-completeness.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80', 0, 'MIT Press', 1312),
(8, 'JavaScript: The Definitive Guide (Master the World\'s Most-Used Language)', 'David Flanagan', 1, '978-1491952023', 720.00, 999.00, 4.6, 98, 25, 'Since 1996, JavaScript: The Definitive Guide has been the bible for JavaScript programmers. Updated for ECMAScript 2020 and modern practices.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80', 0, 'O\'Reilly Media', 706),
(9, '1984 (Centennial Collector\'s Edition)', 'George Orwell', 4, '978-0451524935', 299.00, 399.00, 4.7, 340, 40, 'Orwell\'s haunting vision of a totalitarian dystopian society ruled by Big Brother and thought police remains chillingly relevant.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80', 0, 'Signet Classics', 328),
(10, 'To Kill a Mockingbird', 'Harper Lee', 4, '978-0061120084', 320.00, 450.00, 4.9, 412, 35, 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80', 0, 'Harper Perennial', 336),
(11, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 2, '978-1449373320', 890.00, 1150.00, 4.9, 290, 22, 'The big ideas behind reliable, scalable, and maintainable systems. Key concepts behind distributed databases, streams, and replication.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=80', 1, 'O\'Reilly Media', 616),
(12, 'Zero to One: Notes on Startups, or How to Build the Future', 'Peter Thiel with Blake Masters', 5, '978-0804139298', 399.00, 525.00, 4.6, 260, 30, 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500&auto=format&fit=crop&q=80', 0, 'Crown Business', 224)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Sample Default Users (Password for both is: password123)
-- Hash generated via bcrypt: $2b$10$g9lLGsEH1a99rJc3bB0t5.KM8mYOFbrpCP.rDkQetBkAtG8kgxG/q
INSERT INTO `users` (`id`, `full_name`, `email`, `username`, `password`, `phone`, `address`, `role`) VALUES
(1, 'Admin Librarian', 'admin@bookhaven.com', 'admin', '$2b$10$g9lLGsEH1a99rJc3bB0t5.KM8mYOFbrpCP.rDkQetBkAtG8kgxG/q', '9876543210', 'Library Headquarters, Knowledge Park, Pune', 'admin'),
(2, 'Saber Mulla', 'saber@example.com', 'sabermulla', '$2b$10$g9lLGsEH1a99rJc3bB0t5.KM8mYOFbrpCP.rDkQetBkAtG8kgxG/q', '9123456780', 'FC Road, Shivajinagar, Pune, Maharashtra 411005', 'customer')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);
