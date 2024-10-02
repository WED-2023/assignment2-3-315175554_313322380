const axios = require('axios'); // Required for making API requests
const DButils = require("./DButils");

// Spoonacular API details
const SPOONCULAR_API_KEY = process.env.SPOONCULAR_API_KEY; // Store API key in .env
const SPOONCULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

/**
 * Checks if a recipe exists in the Spoonacular API.
 * @param {number} recipe_id - The ID of the recipe.
 * @returns {Promise<boolean>} - True if recipe exists, false otherwise.
 */
async function checkRecipeExists(recipe_id) {
    try {
        console.log(`Checking if recipe exists in Spoonacular: ${recipe_id}`);
        
        const response = await axios.get(
            `${SPOONCULAR_BASE_URL}/${recipe_id}/information`,
            {
                params: { apiKey: SPOONCULAR_API_KEY }
            }
        );

        console.log(`Spoonacular API response status: ${response.status}`);
        
        return response.data && response.status === 200;
    } catch (error) {
        // Log the exact error response
        if (error.response && error.response.status === 404) {
            console.log(`Recipe ${recipe_id} not found in Spoonacular`);
            return false;
        }

        console.error("Error checking recipe existence:", error);
        throw new Error("Failed to check recipe existence");
    }
}


/**
 * Marks a recipe as a favorite for the given user.
 * @param {string} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe.
 */
async function markAsFavorite(user_id, recipe_id) {
    try {
        // Check if recipe exists in Spoonacular API
        const recipeExists = await checkRecipeExists(recipe_id);

        if (!recipeExists) {
            throw new Error("Recipe does not exist");
        }

        // Use a parameterized query to prevent SQL injection
        await DButils.execQuery(
            `INSERT INTO Favorites (user_id, recipe_id) VALUES (?, ?)`,
            [user_id, recipe_id]
        );
    } catch (error) {
        console.error("Error marking recipe as favorite:", error);
        throw new Error("Failed to mark recipe as favorite");
    }
}

/**
 * Retrieves the list of favorite recipe IDs for a given user.
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFavoriteRecipes(user_id) {
    try {
        // Use a parameterized query to fetch favorite recipes
        const recipes = await DButils.execQuery(
            `SELECT recipe_id FROM Favorites WHERE user_id = ?`,
            [user_id]
        );
        //debug to check if the list is correct
        console.log( recipes.map(row => row.recipe_id))
        // Return the list of recipe IDs
        //return recipes.map(row => row.recipe_id);
        return recipes
    } catch (error) {
        console.error("Error retrieving favorite recipes:", error);
        throw new Error("Failed to retrieve favorite recipes");
    }
}

module.exports = {
    markAsFavorite,
    getFavoriteRecipes
};
