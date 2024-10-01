var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("I'm here"));

/**
 * This path is for searching recipes based on various filters (name, cuisine, diet, etc.).
 */
router.get("/search", async (req, res, next) => {
  try {
    const { recipeName, cuisine, diet, intolerance, number = 5 } = req.query;

    // Ensure recipeName is provided
    if (!recipeName) {
      return res.status(400).send({ message: "Recipe name is required", success: false });
    }

    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    // Validate that recipeId exists
    if (!recipeId) {
      return res.status(400).send({ message: "Recipe ID is required", success: false });
    }

    const recipe = await recipes_utils.getRecipeDetails(recipeId);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

// Export the router
module.exports = router;
