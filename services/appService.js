const Bots = require("./handlers/botHandler");
const Functions = require("./handlers/functionHandler");
const DatabaseUtil = require("./utils/databaseUtil");
const appService = async (reqData) => {
  const component = reqData.type;
  //create user if not present in DB
  console.log(reqData);

  if (reqData.handler == "message_handler") {
    const userID = reqData.params.user.id;
    let isUserExits = await DatabaseUtil.users.doesUserExists(userID);
    await DatabaseUtil.resultModel.addDiagramEntry({
      zuid: userID,
      timenum: 0,
      imageUrl: "test",
      prompt: "test",
    });
    if (!isUserExits) {
      await DatabaseUtil.users.addUser(userID);
      await DatabaseUtil.resultModel.addDiagramEntry({
        zuid: userID,
        timenum: 0,
        imageUrl: "",
        prompt: "",
      });
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
