const Users = require("../../models/UsersModel");
const ResultModel = require("../../models/ResultModel");

const DatabaseUtil = {
  users: (function () {
    const _doesUserExists = async (zuid) => {
      return await Users.exists({ zuid });
    };

    const _addUser = async (data) => {
      const doc = new Users(data);
      await doc.save();
    };

    const _updateThemePreference = async (zuid, update) => {
      const doc = Users.findOneAndUpdate({ zuid }, update);
      await doc.exec();
    };

    const _getTheme = async (zuid) => {
      const doc = await Users.findOne({ zuid });
      console.log("fromDB", doc);
      return doc.theme;
    };

    return {
      doesUserExists: _doesUserExists,
      addUser: _addUser,
      updateThemePreference: _updateThemePreference,
      getTheme: _getTheme,
    };
  })(),

  resultModel: (function () {
    const _addDiagramEntry = async (entryData) => {
      const doc = new ResultModel(entryData);
      await doc.save();
    };
    const _retriveMatchingDiagramEntry = async (zuid, timenum) => {
      const filter = { zuid, timenum };
      const diagramEntry = await ResultModel.findOne(filter);
      return diagramEntry;
    };
    const _retriveLatestDiagramEntry = async (zuid) => {
      let result = await ResultModel.find({ zuid })
        .sort({ timenum: -1 })
        .exec();
      if (result.length > 25) {
        result.length = 25;
      }
      console.log("result", result);
      return result;
    };
    const _updateLatestDiagramEntry = async (zuid, time, imageUrl) => {
      try {
        const filter = { zuid, time };
        const update = { imageUrl };
        const updatedDiagram = await ResultModel.findOneAndUpdate(
          filter,
          update,
          { new: true }
        );

        if (updatedDiagram) {
          console.log("Diagram entry updated successfully:", updatedDiagram);
        } else {
          console.log(
            "No matching diagram entry found for the provided zuid and time."
          );
        }
      } catch (error) {
        console.error("Error updating diagram entry:", error.message);
      }
    };
    const _getLongUrlForShortUrl = async (timenum, shortCode) => {
      try {
        const filter = { timenum, shortCode };
        console.log("performing shortern", filter);
        const matchingDiagram = await ResultModel.findOne(filter);
        if (matchingDiagram) return matchingDiagram.imageUrl;
      } catch (e) {
        console.log("Error in fetching longUrlData", e);
      }
    };
    return {
      addDiagramEntry: _addDiagramEntry,
      retriveLatestDiagramEntry: _retriveLatestDiagramEntry,
      updateLatestDiagramEntry: _updateLatestDiagramEntry,
      retriveMatchingDiagramEntry: _retriveMatchingDiagramEntry,
      getLongUrlForShortUrl: _getLongUrlForShortUrl,
    };
  })(),
};

module.exports = DatabaseUtil;
