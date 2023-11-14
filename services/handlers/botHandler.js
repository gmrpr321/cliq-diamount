const CommonUtil = require("../utils/commonUtil"); //NO I18N
const DatabaseUtil = require("../utils/databaseUtil"); //NO I18N
const OpenAI = require("openai");
const { getPrompts } = require("../utils/prompts");
const { converter } = require("mermaid-to-svg");
const Bots = (function () {
  let reqData;
  const _handler = async (data) => {
    _initialize(data);
    let response;
    const handler = reqData.handler.type;
    console.log(handler);
    switch (handler) {
      case "welcome_handler": //NO I18N
        response = await _welcomeHandler();
        break;
      case "action_handler": //NO I18N
        response = await _actionHandler();
        break;
      case "message_handler":
        response = await _handleNewDiagramRequest();
        break;
    }
    return response;
  };

  const _initialize = (data) => {
    reqData = data;
  };
  const _handleNewDiagramRequest = async () => {
    _saveDiagram();
    const currentTime = reqData.params.message_details.time;
    const userId = reqData.params.user.id;
    const prompt = reqData.params.message;
    console.log("message-JSON", reqData);
    //avoid generating diagrams before the last request has been generated
    let response = {
      text: "It will take some 15-30 seconds to generate the diagram. Please wait\n\nClick the button to retrieve the diagram. Once the generation is complete, you will get the diagram.",
      card: { title: prompt, theme: "modern-inline" },
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
        code = generatedCode.content.trim();
        if (!(((code[0] === code[1]) === code[2]) === "`")) {
          console.log("yes");
          code = "```" + generatedCode.content.trim() + "```";
        }
        try {
          console.log(code);
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
          return;
        }
      }
      const imageUrl = await generateMermaid(prompt, {
        size: "small",
      });
      if (imageUrl) {
        await DatabaseUtil.resultModel.addDiagramEntry({
          zuid: userId,
          timenum: currentTime,
          imageUrl: imageUrl,
          prompt: prompt,
        });
      }
      //update the latest entry with generated imageUrl

      // response = {
      //   text: "Your Diagram is being generated, Please check after 10-20 seconds ",
      //   card: { theme: "modern-inline" },
      //   buttons: [
      //     {
      //       label: " View Diagram",
      //       action: {
      //         type: "invoke.function",
      //         data: { name: "getCurrentDiagramBtn" },
      //       },
      //     },
      //   ],
      // };
      // return response;
    } catch (error) {
      throw error;
    }
  };
  const _welcomeHandler = async () => {
    return {
      text: "Hey! Thanks for subscribing :happy: \nUse the below actions to generate a diagram with just a prompt string.", //NO I18N
    };
  };

  const _actionHandler = async () => {
    const zuid = reqData.params.access.user_id;
    if (!(await DatabaseUtil.users.doesUserExists(zuid))) {
      await DatabaseUtil.users.addUser(zuid);
    }

    const actionName = reqData.handler.name;
    switch (actionName) {
      case "Generate": //NO I18N
        return await _generateDiagram();
      case "View Expense": //NO I18N
        return await _viewExpenses(currency);
      case "Settings": //NO I18N
        return await _settings(currency);
      case "demo":
        return {};
    }
  };

  const _generateDiagram = async () => {
    try {
      // let today = CommonUtil.formatDateWOTime(new Date());
      let response = {
        type: "form",
        title: "Generate a Diagram",
        name: "generatediagramform",
        hint: "Give a prompt to generate a diagram, you can modify certain properties of  diagram before generation",
        button_label: "Generate",
        inputs: [
          {
            name: "prompt",
            label: "Prompt",
            placeholder: "Give a brief description of what you want",
            min_length: "0",
            max_length: "25",
            mandatory: true,
            type: "text",
          },
          {
            name: "diagramtype",
            label: "Diagram Type",
            placeholder: "Enforce a Diagram Type   (Default - let AI decide)",
            multiple: false,
            mandatory: false,
            type: "select",
            options: [
              {
                value: "half_marathon",
                label: "Half marathon",
              },
              {
                value: "stage_races",
                label: "Stage races",
              },
            ],
          },
          {
            name: "diagramsize",
            label: "Diagram Size",
            mandatory: false,
            type: "radio",
            options: [
              {
                value: "small",
                label: "Small",
              },
              {
                value: "medium",
                label: "Medium",
              },
              {
                value: "large",
                label: "Large",
              },
            ],
          },
          {
            name: "diagramtheme",
            label: "Diagram Theme",
            mandatory: false,
            type: "radio",
            options: [
              {
                value: "dark",
                label: "Dark",
              },
              {
                value: "light",
                label: "Light",
              },
            ],
          },
          {
            name: "includeIcons",
            label: "Include Icons",
            value: false,
            type: "toggle",
          },
        ],
        action: {
          type: "invoke.function",
          name: "generateDiagram",
        },
      };
      return response;
    } catch (error) {
      throw error;
    }
  };

  const _viewExpenses = async (currency) => {
    try {
      if (currency === undefined) {
        return CommonUtil.getSettingsResponse();
      }

      let buttons = [];
      const buttonLabels = ["This Week", "This Month", "This Year"]; //NO I18N
      buttonLabels.forEach((label) => {
        buttons.push({
          label: label,
          action: {
            type: "invoke.function",
            data: { name: "expensemanagerbtn" },
          }, //NO I18N
        });
      });

      //   let response = {
      //     text: "Get the list of expenses.", //NO I18N
      //     card: {
      //       title: "Expense History", //NO I18N
      //       theme: "modern-inline", //NO I18N
      //     },
      //     buttons: buttons,
      //   };
      let response = {
        text: "sadfsadf",
        card: {
          theme: "modern-inline",
        },
        slides: [
          {
            type: "images",
            title: "Title for your Images",
            data: [
              "https://mermaid.ink/img/eyJjb2RlIjoiXG4gIHRpbWVsaW5lXG4gICAgdGl0bGUgSGlzdG9yeSBvZiBTb2NpYWwgTWVkaWEgUGxhdGZvcm1cbiAgICAyMDAyIDogTGlua2VkSW5cbiAgICAyMDA0IDogRmFjZWJvb2tcbiAgICAgICAgIDogR29vZ2xlXG4gICAgMjAwNSA6IFlvdXR1YmVcbiAgICAyMDA2IDogVHdpdHRlclxuICAiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9fQ",
            ],
          },
        ],
      };

      return response;
    } catch (error) {
      throw error;
    }
  };

  const _settings = async (currency) => {
    try {
      return CommonUtil.getSettingsResponse(currency);
    } catch (error) {
      throw error;
    }
  };

  return {
    handler: _handler,
  };
})();

module.exports = Bots;
