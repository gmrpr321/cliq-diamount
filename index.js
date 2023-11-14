const express = require("express"); //NO I18N
const morgan = require("morgan"); //NO I18N
const mongoose = require("mongoose"); //NO I18N

const config = require("./config/appKeys"); //NO I18N

const appController = require("./controllers/appController"); //NO I18N

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("[:date[web]] :method :url :status :total-time ms"));

app.use("/api/v1/diamount", appController); //NO I18N

app.use("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome! Enter a prompt to generate a diagram", //NO I18N
  });
});

app.use((req, res) => {
  return res.status(404).json({
    message: "Not Found: Incorrect URL.", //NO I18N
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
    console.error("MongoDB connection FAILED"); //NO I18N
  }
  console.log(`APP LISTENING ON PORT ${PORT} - ${new Date()}`);
});
