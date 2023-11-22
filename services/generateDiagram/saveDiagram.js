const CommonUtil = require("../utils/commonUtil"); //NO I18N
const DatabaseUtil = require("../utils/databaseUtil"); //NO I18N
const OpenAI = require("openai");
const { openaiKey, baseUrl } = require("../../config/extensionKeys");
const { getPrompts, getWaitText, getWelcomeText } = require("../utils/prompts");
const { converter } = require("mermaid-to-svg");
const shortid = require("shortid");
async function saveDiagram(data) {
  const reqData = data.msgData;
  const currentTime = data.timeStamp;
  const userId = reqData.params.user.id;
  const prompt = data.prompt;
  const type = data.type;
  console.log("FROM FORM", reqData, currentTime, userId, prompt, type);
  try {
    //upload the initial entry in DB for the latest Diagram
    const openai = new OpenAI({
      apiKey: openaiKey,
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
        getPrompts({ promptTitle: title, params }, type)
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
      const shortCode = shortid.generate();
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
}
module.exports = {
  saveDiagram,
};
