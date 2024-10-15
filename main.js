require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var morgan = require("morgan");  // Import the 'morgan' module
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
var cors = require('cors');

var app = express();

// Use a valid Morgan format, such as 'dev' for development
app.use(morgan('dev')); // Logs requests
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded

// Session Configuration
app.use(
  session({
    cookieName: "session",
    secret: process.env.COOKIE_SECRET || "defaultSecret", // Use env variable for secret
    duration: 24 * 60 * 60 * 1000, // 24 hours
    activeDuration: 1000 * 60 * 5, // Session renewal
    cookie: {
      httpOnly: true,  // Secure the cookie
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    },
  })
);

// Static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../assignment-3-3-basic/dist')));
} else {
  app.use(express.static(path.join(__dirname, "dist")));
}
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// CORS Configuration
const corsConfig = {
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); // Enable pre-flight requests

var port = process.env.PORT || "3000"; // Use 3000 for local, 80 for remote

const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");

//#region cookie middleware
app.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    try {
      const users = await DButils.execQuery("SELECT user_id FROM users WHERE user_id = ?", [req.session.user_id]);
      if (users.length > 0) {
        req.user_id = req.session.user_id;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
//#endregion

// ----> Check if server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routes
app.use("/users", user);
app.use("/recipes", recipes);
app.use("/auth", auth);

// Error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send({ message: err.message || "Internal Server Error", success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("Server closed"));
  }
  process.exit();
});
