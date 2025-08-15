const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));

//connect app to mongoDB
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("connected to DB!");
  } catch (err) {
    console.error(err);
  }
};
connectToDB();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
