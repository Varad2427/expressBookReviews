
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: false,
    saveUninitialized: false
  })
);

// Verify the token for protected customer routes
app.use('/customer/auth/*', (req, res, next) => {
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token required'
    });
  }

  jwt.verify(token, 'accessToken', (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
