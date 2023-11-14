const mongoose = require("mongoose"); //NO I18N

const ResultModel = mongoose.Schema({
  zuid: {
    type: String,
    required: true,
  },
  timenum: {
    type: Number,
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
});

module.exports = mongoose.model("ResultModel", ResultModel); //NO I18N
