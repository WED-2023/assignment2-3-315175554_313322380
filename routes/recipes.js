// var express = require("express");
// var router = express.Router();
// const recipes_utils = require("./utils/recipes_utils");

// router.get("/", (req, res) => res.send("im here"));

// /**
//  * This path is for searching a recipe
//  */
// router.get("/search", async (req, res, next) => {
//   try {
//     const recipeName = req.query.recipeName;
//     const cuisine = req.query.cuisine;
//     const diet = req.query.diet;
//     const intolerance = req.query.intolerance;
//     const number = req.query.number || 5;
//     const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
//     res.send(results);
//   } catch (error) {
//     next(error);
//   }
// }),

// /**
//  * This path returns a full details of a recipe by its id
//  */
// router.get("/:recipeId", async (req, res, next) => {
//   try {
//     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// }),
// /**
//  * This path returns a full details of random recipes
//  */
// router.get("/recipe/random", async (req, res, next) => {
//   try {
//     const number = req.query.number || 4;
//     const randomRecipes = await recipes_utils.getRandomRecipeInformation(number);
//     res.send(randomRecipes);
//   } catch (error) {
//     next(error);
//   }
// });



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
        const { recipeName, cuisine, diet, intolerance, number = 5 } = req.query;
        const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
        res.send(results);
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
