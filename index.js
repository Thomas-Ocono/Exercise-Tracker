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
  username: {
    type: String,
    required: true,
  },
});
const user = mongoose.model("user", userSchema);

//req and res
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const newUser = new user({
    username: req.body.username,
  });
  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    console.error(err);
    console.log("Fuckup saving new user");
  }
});

app.get("/api/users", async (req, res) => {
  let userArray = [];
  const userList = await user.find();
  for (let i = 0; i < userList.length; i++) {
    userArray.push({ username: userList[i].username, _id: userList[i]._id });
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
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});
const exercise = mongoose.model("exercise", exerciseSchema);

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const input = req.body;
  console.log(input);
  if (input.date == "" || input.date == null) {
    input.date = new Date();
    console.log(input.date.toDateString());
  }
  try {
    const foundUser = await user.findById(id);
    if (!foundUser) {
      res.send("No user with that ID found");
    } else {
      const saveExercise = new exercise({
        userId: foundUser._id,
        username: foundUser.username,
        description: input.description,
        duration: input.duration,
        date: new Date(input.date).toDateString(),
      });
      const savedExercise = await saveExercise.save();
      res.json({
        _id: foundUser._id,
        username: foundUser.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date,
      });
    }
  } catch (err) {
    console.error(err);
    console.log("Fucky wucky saving exercise");
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  const limit = req.query.limit;
  console.log(limit);
  try {
    const foundUser = await user.findById(id);
    if (!foundUser) {
      res.send("No user with that Id");
    }
    console.log("found user: " + foundUser.username);
    let foundExercises = await exercise.find({ userId: id });

    if (limit != null) {
      console.log("There is a limit");
      let limitExercises = [];
      for (let i = 0; i < limit; i++) {
        if (foundExercises[i] != null) {
          limitExercises.push(foundExercises[i]);
        }
      }
      foundExercises = limitExercises;
    }

    const returnInfo = {
      username: foundUser.username,
      count: foundExercises.length,
      log: foundExercises,
    };
    res.send(returnInfo);
  } catch (err) {
    console.error(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
