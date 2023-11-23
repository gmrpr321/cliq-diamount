const express = require("express"); //NO I18N
const morgan = require("morgan"); //NO I18N
const mongoose = require("mongoose"); //NO I18N
const DatabaseUtil = require("./services/utils/databaseUtil"); //NO I18N
const config = require("./config/appKeys"); //NO I18N
const appController = require("./controllers/appController"); //NO I18N

const PORT = process.env.PORT || 8080;
mongoose.set("strictQuery", false);
const app = express();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("[:date[web]] :method :url :status :total-time ms"));

app.use("/api/v1/diamount", appController); //NO I18N

app.get("/:timenum/:shortCode", async (req, res) => {
  const { timenum, shortCode } = req.params;
  const url = await DatabaseUtil.resultModel.getLongUrlForShortUrl(
    timenum,
    shortCode
  );

  if (url) {
    console.log("got long url");
    res.redirect(url);
  } else {
    res.status(404).send(`URL not found ${url}`);
  }
});

app.use("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome! Enter a prompt to generate a diagram", //NO I18N
  });
});
app.use((req, res) => {
  return res.status(404).json({
    message: "Not Found: Incorrect URL.",
    url: req.url, //NO I18N
  });
});
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("listening for requests");
  });
});
