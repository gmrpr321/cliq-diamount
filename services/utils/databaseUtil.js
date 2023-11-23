const Users = require("../../models/UsersModel");
const ResultModel = require("../../models/ResultModel");

const CommonUtil = require("./commonUtil");
const { query } = require("express");

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
      const doc = await Users.findOne({ zuid }, "currency").lean();
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
    const _getHistory = async (type) => {
      let result = {};
      try {
      } catch (e) {
        // try {
        //   if (type === "today") {
        //     const today = new Date();
        //     const startOfDay = today.setHours(0, 0, 0, 0);
        //     const query = {
        //       dateOfGeneration: {
        //         $gte: startOfDay,
        //         $lt: new Date(),
        //       },
        //     };
        //     result = await ResultModel.find(query);
        //     console.log(result, "lkk");
        //   } else if (type === "pastWeek") {
        //     const today = new Date();
        //     const startOfWeek = new Date();
        //     startOfWeek.setDate(today.getDate() - today.getDay());
        //     startOfWeek.setTime(0, 0, 0, 0);
        //     const query = {
        //       dateOfGeneration: {
        //         $gte: startOfWeek,
        //         $lt: new Date(),
        //       },
        //     };
        //     result = await ResultModel.find(query);
        //   } else if (type === "pastMonth") {
        //     const today = new Date();
        //     const startOfMonth = new Date(
        //       today.getFullYear(),
        //       today.getMonth(),
        //       1
        //     );
        //     startOfMonth.setTime(0, 0, 0, 0);
        //     query = {
        //       dateOfGeneration: {
        //         $gte: startOfMonth,
        //         $lt: new Date(),
        //       },
        //     };
        //     result = await ResultModel.find(query);
        //   }
        // }
        console.log(e);
      }
      return result;
    };

    // const _getAmountSpentThisWeekAndThisMonth = async (zuid) => {
    //   let today = new Date();
    //   let pipeline = [
    //     { $match: { zuid } },
    //     {
    //       $group: {
    //         _id: "$zuid",
    //         thisweek: {
    //           $sum: {
    //             $cond: [
    //               {
    //                 $and: [
    //                   { $gte: ["$date", CommonUtil.getLastMonday()] },
    //                   { $lte: ["$date", today] },
    //                 ],
    //               },
    //               "$amount",
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
    //                   },
    //                   { $lte: ["$date", today] },
    //                 ],
    //               },
    //               "$amount",
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
    //         _id: "$zuid",
    //         expenses: {
    //           $push: {
    //             date: "$date",
    //             category: "$category",
    //             note: "$note",
    //             amount: "$amount",
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
    //         _id: { $month: "$date" },
    //         totalExpense: { $sum: "$amount" },
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
      getLongUrlForShortUrl: _getLongUrlForShortUrl,
      getHistory: _getHistory,
    };
  })(),
};

module.exports = DatabaseUtil;
