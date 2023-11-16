const CommonUtil = require("../utils/commonUtil"); //NO I18N
const DatabaseUtil = require("../utils/databaseUtil"); //NO I18N
const OpenAI = require("openai");
const { getPrompts, getWaitText } = require("../utils/prompts");
const { converter } = require("mermaid-to-svg");
const Functions = (function () {
  let reqData;
  let reqParams;

  const _handler = async (data) => {
    _initialize(data);
    let response;
    const handler = reqData.handler.type;
    console.log("Handler Type", handler);
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
      if (!matchingEntry)
        return {
          text: "Diagram Generation in-progress, Please click the button after a few seconds.\nPlease try again if you don't get the Diagram within 2 minutes",
        };
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
      const formName = reqParams.form.name;
      console.log(formName);
      const formValues = reqParams.form.values;
      const zuid = reqParams.access.user_id;
      // { select: { label: 'Past Week', value: 'pastWeek' } }

      if (formName == "history") {
        const results = await DatabaseUtil.resultModel.getHistory(
          formValues.select.value
        );
        // console.log(results, "results", formValues.select.value);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    handler: _handler,
  };
})();

module.exports = Functions;
