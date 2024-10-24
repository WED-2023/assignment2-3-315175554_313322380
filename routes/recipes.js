


// module.exports = router;
const express = require("express");
const router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("API is working"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
    try {
        const { titleMatch, cuisine, diet, intolerance, number = 5 } = req.query;
        const results = await recipes_utils.searchRecipe(titleMatch, cuisine, diet, intolerance, number);
        
        // Fetch full recipe details for each recipe ID
        const recipeDetailsPromises = results.map(id => recipes_utils.getRecipeDetails(id));
        const recipeDetails = await Promise.all(recipeDetailsPromises);
        
        console.log("Search API response:", recipeDetails);
        res.send(recipeDetails);
    } catch (error) {
        next(error);
    }
});

/**
 * This path returns full details of a recipe by its ID
 */
router.get("/:recipeId", async (req, res, next) => {
    try {
        const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        res.status(200).json(recipe); // Sending the recipe back as JSON
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        next(error); // Pass error to error-handling middleware
    }
});

/**
 * This path returns random recipes
 */
router.get("/recipe/random", async (req, res, next) => {
    try {
        const number = req.query.number || 4;
        const randomRecipes = await recipes_utils.getRandomRecipeInformation(number);
        res.send(randomRecipes);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
