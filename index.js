const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const DatabaseUtil = require("./services/utils/databaseUtil");
const config = require("./config/appKeys");
const appController = require("./controllers/appController");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("[:date[web]] :method :url :status :total-time ms"));

app.use("/api/v1/diamount", appController);

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
    res.status(404).send("URL not found");
  }
});

app.use("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome! Enter a prompt to generate a diagram",
  });
});
app.use((req, res) => {
  return res.status(404).json({
    message: "Not Found: Incorrect URL.",
    url: req.url,
  });
});

app.listen(PORT, async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAILED");
  }
  console.log(`APP LISTENING ON PORT ${PORT} - ${new Date()}`);
});
