
const express = require('express');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');

const app = express();

app.use(express.json());

// Helper endpoint used by the general routes
app.get('/api/books-data', (req, res) => {
  res.json(books);
});

// Customer routes: register, login, and authenticated reviews
app.use('/customer', customer_routes);

// General book routes
app.use('/', genl_routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
