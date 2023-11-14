const CommonUtil = require("../utils/commonUtil"); //NO I18N
const DatabaseUtil = require("../utils/databaseUtil"); //NO I18N
const OpenAI = require("openai");
const { getPrompts } = require("../utils/prompts");
const { converter } = require("mermaid-to-svg");
const Functions = (function () {
  let reqData;
  let reqParams;

  const _handler = async (data) => {
    _initialize(data);
    let response;
    const handler = reqData.handler.type;
    if (handler === "button_handler") {
      response = await _buttonHandler();
    } else if (handler === "form_handler") {
      //NO I18N
      response = await _formHandler();
    }
    return response;
  };

  const _initialize = (data) => {
    reqData = data;
    reqParams = data.params;
  };

  const _buttonHandler = async () => {
    let response = {};

    if (reqData.name === "getCurrentDiagramBtn") {
      console.log("MessageData", reqData);
      const paramTime = reqParams.arguments.key;
      const zuid = reqParams.access.user_id;
      const matchingEntry =
        await DatabaseUtil.resultModel.retriveMatchingDiagramEntry(
          zuid,
          paramTime
        );
      console.log("entry", matchingEntry);
      if (!matchingEntry) return {};
      // return {
      //   text: "Diagram Generation in-progress, Please check after a few seconds",
      // };
      return {
        text: matchingEntry.prompt,
        card: { theme: "modern-inline" },
        slides: [
          {
            type: "images",
            title: "",
            data: [matchingEntry.shortUrl],
          },
        ],
      };
    }

    return response;
  };

  const _formHandler = async () => {
    try {
      let response = {};
      console.log(reqData);
      const formName = reqParams.form.name;
      const formValues = reqParams.form.values;
      const zuid = reqParams.access.user_id;
      if (formName === "generatediagramform") {
        const openai = new OpenAI({
          apiKey: "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", // defaults to process.env["OPENAI_API_KEY"]
        });

        async function getAPIResponse(promptStr) {
          const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: promptStr }],
            model: "gpt-3.5-turbo",
          });
          return chatCompletion.choices[0].message;
        }

        async function generateMermaid(title, params) {
          generatedCode = await getAPIResponse(
            getPrompts("simpleDiagramPrompt", { promptTitle: title, params })
          );
          code = generatedCode.content;
          console.log(code);
          if (!(((code[0] === code[1]) === code[2]) === "`")) {
            console.log("yes");
            code = "```" + generatedCode.content.trim() + "```";
          } else console.log(code);
          try {
            urls = converter.mdToSVG(code);
            const regex = /\!\[\]\((https:\/\/[^\s)]+)\)/;

            const match = urls.match(regex);

            if (match) {
              const imageUrl = match[1];
              console.log("Image URL:", imageUrl);
              return imageUrl;
            } else {
              console.log("No image URL found.");
            }
          } catch (e) {
            console.log("error Generating Image Data", e);
          }
          response = {
            text: "Data",
            card: {
              theme: "modern-inline",
            },
            slides: [
              {
                type: "images",
                title: "Title for your Images",
                data: [imageUrl],
              },
            ],
          };
        }
        const imageUrl = generateMermaid(formValues.prompt, {
          size: formValues.diagramsize,
        });
      }
      response = {
        text: "Data",
        card: {
          theme: "modern-inline",
        },
        slides: [
          {
            type: "images",
            title: "Title for your Images",
            data: ["temp"],
          },
        ],
      };
      return response;
    } catch (error) {
      throw error;
    }
  };

  const _getExpense = async (frequency) => {
    try {
      let fromDate = CommonUtil.getLastMonday();
      let toDate = new Date();
      if (frequency === "Monthly") {
        fromDate = CommonUtil.getFirstDayOfCurrentMonth();
      }

      const allExpenses = await DatabaseUtil.expenses.getExpense(
        reqParams.access.user_id,
        fromDate,
        toDate
      );

      let response;
      if (allExpenses.length === 0) {
        response = CommonUtil.getBannerResponse("No expense found.", true); //NO I18N
      } else {
        response = CommonUtil.getExpenseResponse(allExpenses, frequency, {
          toDate,
          fromDate,
          month: CommonUtil.getMonthName(fromDate.getMonth() + 1),
          currency: await DatabaseUtil.users.getCurrency(
            reqParams.access.user_id
          ),
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const _getThisYearExpense = async () => {
    try {
      const fromDate = CommonUtil.getFirstDayOfYear();
      const toDate = new Date();
      const overallExpenses =
        await DatabaseUtil.expenses.getOverallExepenseForYear(
          reqParams.access.user_id,
          fromDate,
          toDate
        );

      let rows = [];
      let totalExpense = 0;
      let response;

      if (overallExpenses.length === 0) {
        response = CommonUtil.getBannerResponse("No expense found.", true); //NO I18N
      } else {
        overallExpenses.forEach((eachMonth) => {
          totalExpense += eachMonth.totalExpense;
          rows.push({
            Month: CommonUtil.getMonthName(eachMonth._id),
            Amount: eachMonth.totalExpense,
          });
        });

        response = {
          text: "Total Expense: " + totalExpense, //NO I18N
          card: {
            title: "Expense for the year " + toDate.getFullYear(), //NO I18N
            theme: "modern-inline", //NO I18N
          },
          slides: [
            {
              type: "table", //NO I18N
              data: {
                headers: ["Month", "Amount"], //NO I18N
                rows: rows,
              },
            },
          ],
        };
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    handler: _handler,
  };
})();

module.exports = Functions;
