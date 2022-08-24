const redis = require("redis");
const { promisify } = require("util");
const { isValidObjectId } = require("mongoose");
const bookModel = require("../model/bookModel");

// function for string verification
const isValid = function (value) {
  if (!value) return false;
  if (typeof value === "undefined" || value === null) return false;
  if (value.length === 0) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  else if (typeof value === "string") return true;
};

//Connect to redis
const redisClient = redis.createClient(
  15839,
  "redis-15839.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("rF7jSTe0P11DGm2oYI8SD4A4xyzSsJZn", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

// //Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
const INCRBY = promisify(redisClient.INCRBY).bind(redisClient);

//------------------------------------------create Book API------------------------------------------

const createBook = async function (req, res) {
  try {
    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please provide the valid input" });

    let { name, author, category } = req.body;
    // book name validation
    if (!name)
      return res
        .status(400)
        .send({ status: false, message: "Book name is required" });

    if (!isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "Valid Book name is required" });

    // author name validation
    if (!author)
      return res
        .status(400)
        .send({ status: false, message: "Author name is required" });

    if (!isValid(author))
      return res
        .status(400)
        .send({ status: false, message: "Valid Author name is required" });

    // Category name validation
    if (!category)
      return res
        .status(400)
        .send({ status: false, message: "Book name is required" });

    if (!isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Valid category is required" });

    let savedData = await bookModel.create(req.body);
    return res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//------------------------------------------get Book API------------------------------------------
const getBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Book ID" });

    // checking in cache memory
    let cachedBookId = await GET_ASYNC(bookId);
    // cache hit case
    if (cachedBookId) {
      if (cachedBookId <= 5) {
        cachedBookId++;
        await SET_ASYNC(`${bookId}`, JSON.stringify(cachedBookId++));
        const getBook = await bookModel.findById(bookId);
        res.status(200).send({ status: true, data: getBook });
      } else {
        return res.status(400).send({
          status: false,
          message: "You have reached the maximum limit",
        });
      }
    } else {
      // cache miss case
      const getBook = await bookModel.findById(bookId);
      if (!getBook)
        return res.status(404).send({
          status: false,
          message: "Book for the mentioned BookID is not found ",
        });

      const count = 1;

      await SET_ASYNC(`${bookId}`, JSON.stringify(count));
      return res
        .status(200)
        .send({ status: true, message: "Success", data: getBook });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createBook,
  getBook,
};
