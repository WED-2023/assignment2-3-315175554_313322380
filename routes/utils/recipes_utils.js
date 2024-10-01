const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

// Get recipe information by ID
async function getRecipeInformation(recipe_id) {
    try {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    } catch (error) {
        console.error(`Error fetching recipe information for ID: ${recipe_id}`, error);
        throw new Error('Failed to fetch recipe information');
    }
}

// Get recipe details by ID
async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id,
        title,
        readyInMinutes,
        image,
        popularity: aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
    }
}

// Search for recipes by name and filters
async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    try {
        const response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query: recipeName,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerance,
                number: number,
                apiKey: process.env.spooncular_apiKey
            }
        });

        return getRecipesPreview(response.data.results.map((element) => element.id), username);
    } catch (error) {
        console.error('Error searching for recipes', error);
        throw new Error('Failed to search for recipes');
    }
}

// Get recipe preview details for a list of recipe IDs
async function getRecipesPreview(recipeIds, username) {
    try {
        const recipePromises = recipeIds.map(id => getRecipeInformation(id));
        const recipesInfo = await Promise.all(recipePromises);

        return recipesInfo.map(recipeInfo => {
            let { id, title, readyInMinutes, image, aggregateLikes } = recipeInfo.data;

            return {
                id,
                title,
                readyInMinutes,
                image,
                popularity: aggregateLikes,
                username // Optionally include user-specific data
            };
        });
    } catch (error) {
        console.error('Error fetching recipe previews', error);
        throw new Error('Failed to fetch recipe previews');
    }
}

module.exports = {
    getRecipeDetails,
    searchRecipe,
    getRecipesPreview
};
