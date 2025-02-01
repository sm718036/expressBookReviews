const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require('axios')
const JWT_SECRET_KEY = "vnsnfafeowqur234u23yifdhfksbadfwhiry238-vnvsr2iou423ysdbfasb"

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the user already exists in the array
    if (isValid(username)) throw new Error("User already exists");
    // Check if the username and password are provided
    if (!username || !password) {
      res.status(401).json({
        message: "Username and password is required."
      });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user object with the hashed password and save it to array
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    // Create a JWT token for the user
    const token = jwt.sign({userId: newUser.username}, JWT_SECRET_KEY, {expiresIn: '1d'})
    return res
      .status(200)
      .json({
        message: "User registered successfully.",
        Authorization: `Bearer ${token}`
      });
  } catch (error) {
    res.status(500).json({
      message: "Error while registering user"
    })
  }
});

// Get the book list available in the shop (Async Callback)
public_users.get("/", async (req, res) => {
  try {
    return res.status(200).send(JSON.stringify(books));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// Task 2: Get book details by ISBN (Using Promises)
public_users.get('/isbn/:isbn', (req, res) => {
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ message: "Book not found" });
      }
    });
  };

  getBookByISBN(req.params.isbn)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json(error));
});

// Task 3: Get books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    // Simulate an async operation (e.g., fetching books from a database)
    const result = await new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.author === author));
    });
    
    res.json(result.length ? {booksByAuthor: result} : { message: "No books found by this author" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Task 4: Get books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    // Simulate an async operation (e.g., fetching books from a database)
    const result = await new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.title === title));
    });

    res.json(result.length ? result : { message: "No books found with this title" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});


// Task 5: Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  res.json(books[isbn]?.reviews || { message: "No reviews available" });
});

module.exports.general = public_users;
