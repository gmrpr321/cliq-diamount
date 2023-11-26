const CommonUtil = require("../utils/commonUtil");
const DatabaseUtil = require("../utils/databaseUtil");
const OpenAI = require("openai");
const { getPrompts, getWaitText } = require("../utils/prompts");
const { mdToSVG } = require("../converter/converter");
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
          text: "Diagram Generation in-progress, Please click the button after a few seconds.\nPlease prompt again if you don't get the Diagram within 2 minutes",
        };
      const title =
        matchingEntry.prompt.length > 100 ? "Summary" : matchingEntry.prompt;
      const returnUrl =
        matchingEntry.imageUrl.length > 4000
          ? matchingEntry.shortUrl
          : matchingEntry.imageUrl;
      return {
        text: `Image URL : ${returnUrl}`,
        card: { theme: "modern-inline" },
        slides: [
          {
            type: "images",
            title: `${title}`,
            data: [returnUrl],
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
      const formValues = reqParams.form.values;
      const zuid = reqParams.access.user_id;
      console.log(formValues, "themeForm");
      if (formName == "changeDiagramTheme") {
        await DatabaseUtil.users.updateThemePreference(zuid, {
          zuid: zuid,
          theme: formValues.themeRadio.value,
        });
      }
      response = {
        text: "Your Diagram Theme has been Updated Successfully",
      };
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
