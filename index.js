const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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

//user schema and model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const user = mongoose.model("user", userSchema);

// create new user on db
const makeNewUser = async (inputName) => {
  const newUser = new user({
    name: inputName,
  });
  try {
    newUser.save();
    console.log("New user created");
  } catch (err) {
    console.error(err);
    console.log("shits fucked");
  }
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const inputText = req.body.username;
  console.log(inputText);
  makeNewUser(inputText);
  res.send("Made new user");
});

app.get("/api/users", async (req, res) => {
  let userArray = [];
  const userList = await user.find();
  for (let i = 0; i < userList.length; i++) {
    userArray.push({ username: userList[i].name, _id: userList[i]._id });
  }

  res.send(userArray);
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
