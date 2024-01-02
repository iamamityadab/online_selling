const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Added 'path' module for handling file paths
const mysql = require('mysql');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname))); // Highlighted change

// Database connection pool
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'users_information',
});

// Throwing exception
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    connection.release();
  }
});

// Route to handle user signup
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error signing up');
    } else {
      console.log('User signed up successfully');
      res.status(200).send('User signed up successfully');
      res.redirect('/product.html');
    }
  });
});

// Route to handle user signin
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Error during sign-in');
    } else {
      if (result.length > 0) {
        // Redirect to the product page upon successful sign-in
        res.redirect('/product.html');
      } else {
        res.status(401).send('Invalid email or password');
      }
    }
  });
});

app.route('/contact')
  .get((req, res) => {
    // Handle GET request if needed
    res.status(200).send('Contact form page');
  })
  .post((req, res) => {
    // Handle POST request
    const { name, email, subject, message } = req.body;
    const sql = 'INSERT INTO contact_form (name, email, subject, message) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, subject, message], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error submitting form');
      } else {
        console.log('Form submitted successfully');
        res.status(200).send('Form submitted successfully');
      }
    });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
