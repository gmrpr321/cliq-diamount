const mongoose = require("mongoose");

const UsersModel = mongoose.Schema({
  zuid: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  theme: String,
});

module.exports = mongoose.model("Users", UsersModel);
