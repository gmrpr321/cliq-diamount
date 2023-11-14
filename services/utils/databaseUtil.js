const Users = require("../../models/UsersModel"); //NO I18N
const ResultModel = require("../../models/ResultModel"); //NO I18N

const CommonUtil = require("./commonUtil"); //NO I18N

const DatabaseUtil = {
  users: (function () {
    const _doesUserExists = async (zuid) => {
      return await Users.exists({ zuid });
    };

    const _addUser = async (zuid) => {
      const doc = new Users({ zuid });
      await doc.save();
    };

    const _updateSettings = async (zuid, update) => {
      const doc = Users.findOneAndUpdate({ zuid }, update);
      await doc.exec();
    };

    const _getCurrency = async (zuid) => {
      const doc = await Users.findOne({ zuid }, "currency").lean(); //NO I18N
      return doc.currency;
    };

    return {
      doesUserExists: _doesUserExists,
      addUser: _addUser,
      updateSettings: _updateSettings,
      getCurrency: _getCurrency,
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
      const result = await ResultModel.findOne({ zuid })
        .sort({ timenum: -1 })
        .exec();
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

    // const _getAmountSpentThisWeekAndThisMonth = async (zuid) => {
    //   let today = new Date();
    //   let pipeline = [
    //     { $match: { zuid } },
    //     {
    //       $group: {
    //         _id: "$zuid", //NO I18N
    //         thisweek: {
    //           $sum: {
    //             $cond: [
    //               {
    //                 $and: [
    //                   { $gte: ["$date", CommonUtil.getLastMonday()] }, //NO I18N
    //                   { $lte: ["$date", today] }, //NO I18N
    //                 ],
    //               },
    //               "$amount", //NO I18N
    //               0,
    //             ],
    //           },
    //         },
    //         thismonth: {
    //           $sum: {
    //             $cond: [
    //               {
    //                 $and: [
    //                   {
    //                     $gte: ["$date", CommonUtil.getFirstDayOfCurrentMonth()],
    //                   }, //NO I18N
    //                   { $lte: ["$date", today] }, //NO I18N
    //                 ],
    //               },
    //               "$amount", //NO I18N
    //               0,
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   ];
    //   const expense = await Expenses.aggregate(pipeline);
    //   return expense[0];
    // };

    // const _getExpense = async (zuid, fromDate, toDate) => {
    //   let pipeline = [
    //     {
    //       $match: {
    //         $and: [
    //           { zuid: { $eq: zuid } },
    //           { date: { $gte: fromDate, $lte: toDate } },
    //         ],
    //       },
    //     },
    //     { $sort: { date: -1 } },
    //     {
    //       $group: {
    //         _id: "$zuid", //NO I18N
    //         expenses: {
    //           $push: {
    //             date: "$date", //NO I18N
    //             category: "$category", //NO I18N
    //             note: "$note", //NO I18N
    //             amount: "$amount", //NO I18N
    //           },
    //         },
    //       },
    //     },
    //   ];
    //   let allExpenses = await Expenses.aggregate(pipeline);
    //   if (allExpenses.length > 0) {
    //     allExpenses = allExpenses[0].expenses;
    //   }
    //   return allExpenses;
    // };

    // const _getOverallExepenseForYear = async (zuid, fromDate, toDate) => {
    //   let pipeline = [
    //     {
    //       $match: {
    //         $and: [
    //           { zuid: { $eq: zuid } },
    //           { date: { $gte: fromDate, $lte: toDate } },
    //         ],
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: { $month: "$date" }, //NO I18N
    //         totalExpense: { $sum: "$amount" }, //NO I18N
    //       },
    //     },
    //     {
    //       $sort: { _id: 1 },
    //     },
    //   ];
    //   const allExpenses = await Expenses.aggregate(pipeline);
    //   return allExpenses;
    // };

    return {
      addDiagramEntry: _addDiagramEntry,
      retriveLatestDiagramEntry: _retriveLatestDiagramEntry,
      updateLatestDiagramEntry: _updateLatestDiagramEntry,
      retriveMatchingDiagramEntry: _retriveMatchingDiagramEntry,
    };
  })(),
};

module.exports = DatabaseUtil;
