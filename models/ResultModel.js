const mongoose = require("mongoose");

const ResultModel = mongoose.Schema({
  zuid: {
    type: String,
    required: true,
  },
  timenum: {
    type: String,
    index: true,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: true,
    default: "",
  },
  prompt: {
    type: String,
    required: true,
  },
  shortUrlCode: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  dateOfGeneration: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("ResultModel", ResultModel);
