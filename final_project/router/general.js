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

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const findBookByIsbn = Object.values(books).find(
    (book) => book.isbn === req.params.isbn
  );
  if (books) {
    return res.status(300).send(JSON.stringify(findBookByIsbn));
  } else {
    return res.status(404).send("Book not found");
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const findBookByAuthor = Object.values(books).find(
    (book) => book.author === req.params.author
  );
  if (books) {
    return res.status(300).send(JSON.stringify(findBookByAuthor));
  } else {
    return res.status(404).send("Book not found");
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const findBookByTitle = Object.values(books).find(
    (book) => book.title === req.params.title
  );
  if (books) {
    return res.status(300).send(JSON.stringify(findBookByTitle));
  } else {
    return res.status(404).send("Book not found");
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const findBookByIsbn = Object.values(books).find(
    (book) => book.isbn === req.params.isbn
  );
  if (books) {
    return res.status(300).send(JSON.stringify(findBookByIsbn.reviews));
  } else {
    return res.status(404).send("Book not found");
  }
});

// Task 10: Fetch all books using async/await
public_users.get('/async-books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:5000/');
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Fetch book details by ISBN using async/await
public_users.get('/async-isbn/:isbn', async (req, res) => {
  try {
      const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching book details" });
  }
});

// Task 12: Fetch books by author using async/await
public_users.get('/async-author/:author', async (req, res) => {
  try {
      const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 13: Fetch books by title using async/await
public_users.get('/async-title/:title', async (req, res) => {
  try {
      const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books by title" });
  }
});


module.exports.general = public_users;
