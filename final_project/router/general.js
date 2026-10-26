
const express = require('express');
const axios = require('axios');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();
const BOOKS_URL = 'http://localhost:5000/api/books-data';

// Retrieve all books using Axios and async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_URL);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books'
    });
  }
});

// Retrieve a book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_URL);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve book'
    });
  }
});

// Retrieve books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_URL);
    const author = req.params.author.toLowerCase();

    const result = Object.fromEntries(
      Object.entries(response.data).filter(([, book]) =>
        book.author.toLowerCase().includes(author)
      )
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to search by author'
    });
  }
});

// Retrieve books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_URL);
    const title = req.params.title.toLowerCase();

    const result = Object.fromEntries(
      Object.entries(response.data).filter(([, book]) =>
        book.title.toLowerCase().includes(title)
      )
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to search by title'
    });
  }
});

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'User already exists'
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: 'User successfully registered'
  });
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const response = await axios.get(BOOKS_URL);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve reviews'
    });
  }
});

module.exports.general = public_users;
