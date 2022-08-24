const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
  },
  author: { type: String, require: true, trim: true },
  category: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Book", bookSchema);
