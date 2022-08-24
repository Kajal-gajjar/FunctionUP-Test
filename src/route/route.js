const express = require("express");
const { createBook, getBook } = require("../controller/bookController");
const router = express.Router();

router.post("/books", createBook);
router.get("/books/:bookId", getBook);

// validating the route
router.all("/*", function (req, res) {
  res.status(400).send({ status: false, message: "invalid http request" });
});

module.exports = router;
