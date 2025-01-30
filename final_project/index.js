const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret'; // Use an environment variable for security

// Middleware for parsing JSON
app.use(express.json());

// Session configuration
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for customer routes
const authenticateJWT = (req, res, next) => {
  const token = req.session.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid." });
    }
    req.user = decoded; // Attach decoded user data to request
    next();
  });
};

// Protect routes with authentication middleware
app.use("/customer/auth/*", authenticateJWT);

// Register routes
app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
