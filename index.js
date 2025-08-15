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

const findUserByName = async (inputName) => {
  try {
    let foundUser = await user.find({ name: inputName });
    let foundUserInfo = { name: foundUser.name, _id: foundUser._id };
    return foundUserInfo;
  } catch (err) {
    console.error(err);
    console.log("somethin fucked up");
  }
};
//req and res
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const inputText = req.body.username;
  console.log(inputText);
  makeNewUser(inputText);
  let newUserInfo = await findUserByName(inputText);
  let responseInfo = { username: newUserInfo.name, _id: newUserInfo._id };
  res.send(responseInfo);
});

app.get("/api/users", async (req, res) => {
  let userArray = [];
  const userList = await user.find();
  for (let i = 0; i < userList.length; i++) {
    userArray.push({ username: userList[i].name, _id: userList[i]._id });
  }
  res.send(userArray);
});

//exercises schema and model
const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});
const exercise = mongoose.model("exercise", exerciseSchema);

const createNewExercise = async (
  inputId,
  inputDescription,
  inputDuration,
  inputDate
) => {
  const newExercise = new exercise({
    userId: inputId,
    description: inputDescription,
    duration: inputDuration,
    date: inputDate,
  });
  try {
    newExercise.save();
    console.log("New exercise added");
  } catch (err) {
    console.error(err);
    console.log("New exercise fucked up, fix this");
  }
};

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const input = req.body;
  if (input.date == "") {
    input.date = new Date().toDateString();
  }
  try {
    const foundUser = await user.findById(id);
    if (!foundUser) {
      res.send("No user with that ID found");
    } else {
      createNewExercise(id, input.description, input.duration, input.date);
      const returnInfo = {
        username: foundUser.name,
        description: input.description,
        duration: input.duration,
        date: input.date,
        _id: id,
      };
      res.send(returnInfo);
    }
  } catch (err) {
    console.error(err);
    console.log("Fucky wucky saving exercise");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
