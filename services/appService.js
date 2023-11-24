const Bots = require("./handlers/botHandler");
const Functions = require("./handlers/functionHandler");
const DatabaseUtil = require("./utils/databaseUtil");
const appService = async (reqData) => {
  const component = reqData.type;
  //create user if not present in DB
  if (reqData.handler == "message_handler") {
    const userID = reqData.params.user.id;
    let isUserExits = await DatabaseUtil.users.doesUserExists(userID);
    if (!isUserExits) {
      await DatabaseUtil.users.addUser({ zuid: userID, theme: "Light" });
    }
  }

  let responseOutput = {};
  if (component === "function") {
    responseOutput = await Functions.handler(reqData);
  } else if (component === "bot") {
    responseOutput = await Bots.handler(reqData);
  }
  return responseOutput;
};

module.exports = appService;
