const CommonUtil = require("../utils/commonUtil");
const DatabaseUtil = require("../utils/databaseUtil");
const OpenAI = require("openai");
const { openaiKey, baseUrl } = require("../../config/extensionKeys");
const { getPrompts, getWaitText, getWelcomeText } = require("../utils/prompts");
const { mdToSVG } = require("../converter/converter");
const shortid = require("shortid");
const Bots = (function () {
  let reqData;
  const _handler = async (data) => {
    _initialize(data);
    let response;
    const handler = reqData.handler.type;
    console.log(handler);
    switch (handler) {
      case "welcome_handler":
        response = await _welcomeHandler();
        break;
      case "action_handler":
        response = await _actionHandler();
        break;
      case "message_handler":
        response = await _handleNewDiagramRequest();
        break;
    }
    return response;
  };

  const _initialize = async (data) => {
    console.log("INITDATA", data);
    const init_user_id = data.params.access.user_id;
    const is_present = DatabaseUtil.users.doesUserExists(init_user_id);
    if (!is_present) {
      await DatabaseUtil.users.addUser({ zuid: init_user_id, theme: "light" });
    }
    reqData = data;
  };
  const _handleNewDiagramRequest = async () => {
    _saveDiagram();
    const currentTime = reqData.params.message_details.time;
    const userId = reqData.params.user.id;
    const prompt = reqData.params.message;
    const title = prompt.length > 100 ? "Summary" : prompt;
    console.log("message-JSON", reqData);
    //avoid generating diagrams before the last request has been generated
    let response = {
      text: getWaitText("small"),
      card: { title: title, theme: "modern-inline" },
      buttons: [
        {
          label: "Get Diagram",
          action: {
            type: "invoke.function",
            data: { name: "getCurrentDiagramBtn" },
          },
          key: currentTime,
        },
      ],
    };
    return response;
  };
  const _saveDiagram = async () => {
    const currentTime = reqData.params.message_details.time;
    const userId = reqData.params.user.id;
    const prompt = reqData.params.message;
    try {
      //upload the initial entry in DB for the latest Diagram
      const openai = new OpenAI({
        apiKey: openaiKey, // defaults to process.env["OPENAI_API_KEY"]
      });

      async function getAPIResponse(promptStr) {
        console.log("code generating");
        const chatCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content: promptStr }],
          model: "gpt-3.5-turbo",
          max_tokens: 1000,
        });
        return chatCompletion.choices[0].message;
      }

      async function generateMermaid(title, params) {
        generatedCode = await getAPIResponse(
          getPrompts("simpleDiagramPrompt", { promptTitle: title, params })
        );
        code = generatedCode.content.trim();
        const startSym = code.slice(0, 3);
        const endSym = code.slice(code.length - 3, code.length);
        // if (startSym !== "```") code = "```" + code;
        // if (endSym !== "```") code = code + "```";
        if (startSym !== "```") {
          console.log("starts", startSym, endSym);
          code = "```" + code + "```";
        }
        try {
          console.log(code, "codee");
          urls = mdToSVG(code);
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
          return;
        }
      }
      let imageUrl = await generateMermaid(prompt, {
        size: "small",
      });
      if (imageUrl) {
        //perform theme modifications
        const lightTheme = "?bgColor=FFFFFF";
        const darkTheme = "?bgColor=878787";
        const shortCode = shortid.generate();
        const theme = await DatabaseUtil.users.getTheme(userId);
        if (theme === "Dark") imageUrl = imageUrl + darkTheme;
        else imageUrl = imageUrl + lightTheme;
        const shortUrl = `${baseUrl}/${currentTime}/${shortCode}`;
        console.log(
          "Short URL",
          shortUrl,
          `localhost:8080/${userId}/${shortCode}`
        );
        //

        await DatabaseUtil.resultModel.addDiagramEntry({
          zuid: userId,
          timenum: currentTime,
          imageUrl: imageUrl,
          shortUrlCode: shortCode,
          shortUrl: shortUrl,
          prompt: prompt,
          dateOfGeneration: new Date(),
        });
        console.log("done");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const _welcomeHandler = async () => {
    return {
      text: getWelcomeText(),
    };
  };

  const _actionHandler = async () => {
    const zuid = reqData.params.access.user_id;
    if (!(await DatabaseUtil.users.doesUserExists(zuid))) {
      await DatabaseUtil.users.addUser({ zuid: zuid, theme: "Light" });
    }

    const actionName = reqData.handler.name;
    switch (actionName) {
      case "History":
        return await _getUserHistory();
      case "Theme":
        return await _changeDiagramTheme();
    }
  };

  const _getUserHistory = async () => {
    const zuid = reqData.params.access.user_id;
    try {
      const recentRecords =
        await DatabaseUtil.resultModel.retriveLatestDiagramEntry(zuid);
      if (recentRecords.length === 0) {
        return {
          text: "No Recent Diagrams available, Please prompt some diagrams to view them later",
        };
      }
      let urls = [];
      for (const temp of recentRecords) {
        if (temp.imageUrl.length < 1000) urls.push(temp.iamgeUrl);
      }
      console.log("History Urls", urls);
      const response = {
        text: "List of Recent Diagrams",
        card: { theme: "modern-inline" },
        slides: [
          {
            type: "images",
            title: "",
            data: urls,
          },
        ],
      };
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const _changeDiagramTheme = async () => {
    try {
      const response = {
        type: "form",
        title: "Change Diagram Theme",
        name: "changeDiagramTheme",
        hint: "Select any one of the options to change the theme of your diagram",
        button_label: "Submit",
        inputs: [
          {
            name: "themeRadio",
            label: "Theme",
            mandatory: false,
            type: "radio",
            options: [
              {
                value: "Light",
                label: "Light",
              },
              {
                value: "Dark",
                label: "Dark",
              },
            ],
          },
        ],
        action: {
          type: "invoke.function",
          name: "changeDiagramTheme",
        },
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

module.exports = Bots;
