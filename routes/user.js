var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

// Middleware to check if user_id is provided and user exists in the database
router.use(async function (req, res, next) {
  // Log the incoming request
  console.log("Incoming request:", req.method, req.originalUrl);

  // Check if user_id is provided in the request parameters or session
  const user_id = req.params.user_id || (req.session && req.session.user ? req.session.user.user_id : null);

  if (!user_id) {
    console.log("User ID is missing");
    return res.sendStatus(401); // No user ID in request, unauthorized
  }

  try {
    // Query to check if user exists in the database
    const users = await DButils.execQuery("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
    
    if (users.length > 0) {
      req.user = users[0]; // Store user data in req object for subsequent use
      next(); // Proceed to the next middleware/route
    } else {
      console.log("User not found in database");
      res.sendStatus(401); // Unauthorized access
    }
  } catch (err) {
    console.error("Database query error:", err);
    next(err); // Handle errors by passing to next middleware
  }
});

// Route to add a recipe to favorites
router.post("/favorites", async (req, res, next) => {
  const { user_id, recipe_id } = req.body;

  if (!user_id || !recipe_id) {
    return res.status(400).send({ success: false, message: "User ID and Recipe ID are required" });
  }

  try {
    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(201).send({ success: true, message: "Recipe added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    next(error);
  }
});

router.delete("/favorites", async (req, res, next) => {
  const { user_id, recipe_id } = req.body;

  if (!user_id || !recipe_id) {
    return res.status(400).send({ success: false, message: "User ID and Recipe ID are required" });
  }

  try {
    await user_utils.removeFavorite(user_id, recipe_id);
    res.send({ success: true, message: "Recipe removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    next(error);
  }
});


// In user.js
router.get("/favorites", async (req, res, next) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).send({ success: false, message: "User ID is required" });
  }

  try {
    const favoriteRecipes = await user_utils.getFavoriteRecipes(user_id);
    res.send(favoriteRecipes);
  } catch (error) {
    console.error("Error fetching favorite recipes:", error);
    next(error);
  }
});


module.exports = router;
