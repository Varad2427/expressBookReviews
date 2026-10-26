
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const JWT_SECRET = 'accessToken';

// Check if a username is registered
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    (user) =>
      user.username === username &&
      user.password === password
  );
};

// Register a new user
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username.trim())) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({
    username: username.trim(),
    password
  });

  return res.status(201).json({
    message: 'User successfully registered'
  });
});

// Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const accessToken = jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken
  });
});

// Verify the Bearer token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token required'
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    // Ensure the token belongs to a registered user
    if (!isValid(decoded.username)) {
      return res.status(401).json({
        message: 'User is not registered'
      });
    }

    req.user = decoded;
    next();
  });
};

// Add or update a review for a book
regd_users.put('/auth/review/:isbn', verifyToken, (req, res) => {
  const username = req.user.username;
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'A review is required'
    });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // One review per user per book; a new review updates the old one
  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added/updated successfully',
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', verifyToken, (req, res) => {
  const username = req.user.username;
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (
    !books[isbn].reviews ||
    !Object.prototype.hasOwnProperty.call(
      books[isbn].reviews,
      username
    )
  ) {
    return res.status(404).json({
      message: 'Review not found'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully',
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
