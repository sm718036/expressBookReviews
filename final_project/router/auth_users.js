const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const bcrypt = require("bcrypt");

let users = [];

const isValid = (username) => {
  return users.find((user) => user.username === username);
};

const authenticatedUser = (username) => {
  return users.find((user) => user.username === username);
};

//only registered users can login
regd_users.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!authenticatedUser(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  const user = authenticatedUser(username);
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ userId: user.username }, "secret", {
    expiresIn: "1d",
  });
  req.session.user = user.username;
  return res.status(200).json({
    message: `Welcome, ${user.username}`,
    token,
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "You must be logged in to post a reveiw",
    });
  }
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.session.user;
  const findBookByIsbn = books[isbn];
  if (!findBookByIsbn) {
    return res.status(404).json({
      message: "Book not found",
    });
  }
  if (!review) {
    return res.status(400).json({
      message: "Review content is required.",
    });
  }
  findBookByIsbn.reviews[username] = review; // Add new review
  res.send(`The review for the book with ISBN ${isbn} has been added.`);
});

// Code to delete book
regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "You must be logged in to delete user reviews.",
    });
  }
  const { isbn } = req.params;
  const username = req.session.user;
  if (!isbn) {
    return res.status(400).json({
      message: "ISBN is required.",
    });
  }
  const findBookByIsbn = books[isbn];
  if (!findBookByIsbn) {
    return res.status(404).json({
      message: "Book not found",
    });
  }
  if (books[isbn]?.reviews?.[username]) {
    delete books[isbn].reviews[username];
    res.send(`Reviews for the ISBN ${isbn} by the user ${username} deleted.`);
  } else {
    res.send("Review not found");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
