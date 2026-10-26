
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

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
    'accessToken',
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken
  });
});

// Add or update a review (authenticated users only)
regd_users.put('/auth/review/:isbn', (req, res) => {
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

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully'
  });
});

// Delete your own review (authenticated users only)
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.user.username;
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: 'Review not found'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully'
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
