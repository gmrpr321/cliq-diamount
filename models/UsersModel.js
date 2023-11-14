const mongoose = require("mongoose");	//NO I18N

const UsersModel = mongoose.Schema({
	zuid: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	currency: String
});

module.exports = mongoose.model("Users", UsersModel);	//NO I18N
