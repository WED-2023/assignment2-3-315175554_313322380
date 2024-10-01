const DButils = require("./DButils");

/**
 * Marks a recipe as a favorite for the given user.
 * @param {string} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe.
 */
async function markAsFavorite(user_id, recipe_id) {
    try {
        // Use a parameterized query to prevent SQL injection
        await DButils.execQuery(
            `INSERT INTO FavoriteRecipes (user_id, recipe_id) VALUES (@user_id, @recipe_id)`,
            [{ name: 'user_id', value: user_id }, { name: 'recipe_id', value: recipe_id }]
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
            `SELECT recipe_id FROM FavoriteRecipes WHERE user_id = @user_id`,
            [{ name: 'user_id', value: user_id }]
        );

        // Return the list of recipe IDs
        return recipes.map(row => row.recipe_id);
    } catch (error) {
        console.error("Error retrieving favorite recipes:", error);
        throw new Error("Failed to retrieve favorite recipes");
    }
}

module.exports = {
    markAsFavorite,
    getFavoriteRecipes
};
