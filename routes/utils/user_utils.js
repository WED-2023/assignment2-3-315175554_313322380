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

async function markAsFavorite(user_id, recipe_id) {
    console.log(`Inserting favorite for user ${user_id}, recipe ${recipe_id}`);
    await DButils.execQuery(
      `INSERT INTO favorites (user_id, recipe_id) VALUES ('${user_id}', '${recipe_id}')`
    );
  }
  async function removeFavorite(user_id, recipe_id) {
    await DButils.execQuery(
      `DELETE FROM favorites WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`
    );
  }
  
  

  async function getFavoriteRecipes(user_id) {
    const recipes = await DButils.execQuery(
      `SELECT r.recipe_id, r.title, r.image, r.readyInMinutes, r.aggregateLikes
       FROM favorites AS f
       JOIN recipes AS r ON f.recipe_id = r.recipe_id
       WHERE f.user_id = '${user_id}'
       ORDER BY f.favorited_at DESC`
    );
    return recipes;
  }
  
module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    removeFavorite
};
