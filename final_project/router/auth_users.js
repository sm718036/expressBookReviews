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
  const findBookByIsbn = Object.values(books).find(
    (book) => book.isbn === isbn
  );
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
  // Check if the user already posted a review for this ISBN
  const existingReview = findBookByIsbn.reviews.find(review => review.reviewer === username);

  if (existingReview) {
      existingReview.comment = review; // Modify existing review
      res.json({ message: "Review updated successfully.", review: existingReview.comment });
  } else {
    findBookByIsbn.reviews.push({ reviewer: username, comment: review }); // Add new review
      res.json({ message: "Review added successfully.", reviews: findBookByIsbn.reviews });
  }
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
  const findBookByIsbn = Object.values(books).find(
    (book) => book.isbn === isbn
  );
  if (!findBookByIsbn) {
    return res.status(404).json({
      message: "Book not found",
    });
  }
  // Check if the user already posted a review for this ISBN
  const reviewsOfUser = findBookByIsbn.reviews.find(review => review.reviewer === username);
  if (reviewsOfUser) {
      // Delete existing review
      const indexOfUser = findBookByIsbn.reviews.indexOf(reviewsOfUser);
      findBookByIsbn.reviews.splice(indexOfUser, 1);
      res.json({ message: "Deleted user reviews", reviews: findBookByIsbn.reviews });
  } else {
      res.json({ message: "No reviews found for this user", reviews: findBookByIsbn.reviews });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
