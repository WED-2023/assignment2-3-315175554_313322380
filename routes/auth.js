const express = require("express");
const router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

// Register route
router.post("/Register", async (req, res, next) => {
  try {
    const { username, firstname, lastname, country, password, email, profilePic } = req.body;

    // Validate required fields
    if (!username || !firstname || !lastname || !country || !password || !email) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Check if the username already exists
    const users = await DButils.execQuery("SELECT username FROM users WHERE username = ?", [username]);
    if (users.length > 0) {
      return res.status(409).send({ message: "Username already taken" });
    }

    // Hash the password asynchronously
    const saltRounds = parseInt(process.env.bcrypt_saltRounds) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    await DButils.execQuery(
      "INSERT INTO users (username, firstname, lastname, country, password, email, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, firstname, lastname, country, hashedPassword, email, profilePic]
    );

    res.status(201).send({ message: "User created successfully", success: true });
  } catch (error) {
    next(error);
  }
});

// Login route
router.post("/Login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: "Missing username or password" });
    }

    // Check if the username exists
    const user = await DButils.execQuery("SELECT * FROM users WHERE username = ?", [username]);
    if (user.length === 0) {
      return res.status(401).send({ message: "Username or Password incorrect" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).send({ message: "Password incorrect" });
    }

    // Set session user ID
    req.session.user_id = user[0].user_id;

    res.status(200).send({ message: "Login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

// Logout route
router.post("/Logout", function (req, res) {
  req.session.reset(); // Reset the session info
  res.send({ success: true, message: "Logout succeeded" });
});

module.exports = router;
