var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Middleware to authenticate all incoming requests
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    try {
      const users = await DButils.execQuery("SELECT user_id FROM users WHERE user_id = ?", [req.session.user_id]);
      if (users.length > 0) {
        req.user_id = req.session.user_id;
        next();
      } else {
        res.sendStatus(401); // Unauthorized
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

/**
 * Route to add a recipe to the user's favorite list
 */
router.post('/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;

    // Check if recipeId is provided
    if (!recipe_id) {
      return res.status(400).send({ message: "Recipe ID is required", success: false });
    }

    // Check if the recipe is already a favorite
    const existingFavorite = await DButils.execQuery(
      "SELECT * FROM FavoriteRecipes WHERE user_id = ? AND recipe_id = ?",
      [user_id, recipe_id]
    );
    if (existingFavorite.length > 0) {
      return res.status(409).send({ message: "Recipe is already in favorites", success: false });
    }

    // Mark the recipe as favorite
    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send({ message: "Recipe successfully saved as favorite", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Route to get all favorite recipes of the logged-in user
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    // Fetch favorite recipe IDs for the user
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);

    // Handle case when no favorite recipes exist
    if (!recipes_id.length) {
      return res.status(200).send({ message: "No favorite recipes found", success: true, recipes: [] });
    }

    // Extract recipe IDs into an array
    const recipes_id_array = recipes_id.map((element) => element.recipe_id);

    // Fetch the recipe details
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send({ message: "Favorite recipes retrieved successfully", success: true, recipes: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
