module.exports =
	process.env.NODE_ENV === "production" ? require("./prodKeys") : require("./devKeys");	//NO I18N