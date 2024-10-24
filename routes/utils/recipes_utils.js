
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipe information from Spoonacular API by recipe ID
 * @param {number} recipe_id
 */
async function getRecipeInformation(recipe_id) {
    try {
        const response = await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch recipe information.");
    }
}

/**
 * Get random recipes from Spoonacular API
 * @param {number} number 
 */
async function getRandomRecipeInformation(number) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                apiKey: process.env.spooncular_apiKey
            }
        });

        if (response.data && response.data.recipes) {
            return response.data.recipes.map((recipe) => ({
                id: recipe.id,
                title: recipe.title,
                readyInMinutes: recipe.readyInMinutes,
                image: recipe.image,
                aggregateLikes: recipe.aggregateLikes,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                glutenFree: recipe.glutenFree,
            }));
        } else {
            throw new Error("No random recipes found.");
        }
    } catch (error) {
        throw new Error("Error fetching random recipes.");
    }
}

/**
 * Get full details of a recipe by its ID
 * @param {number} recipe_id
 */
async function getRecipeDetails(recipe_id) {
    const recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, analyzedInstructions } = recipe_info;

    return {
        id,
        title,
        readyInMinutes,
        image,
        popularity: aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
        extendedIngredients,
        instructions: analyzedInstructions.length > 0 ? analyzedInstructions[0].steps : [] // Add instructions
    };
}



/**
 * Search for recipes based on various criteria
 * @param {string} titleMatch 
 * @param {string} cuisine 
 * @param {string} diet 
 * @param {string} intolerance 
 * @param {number} number 
 */
async function searchRecipe(titleMatch, cuisine, diet, intolerance, number) {
    try {
        const apiKey = process.env.spooncular_apiKey;
        if (!apiKey) {
            throw new Error("Missing Spoonacular API key.");
        }

        const params = {
            titleMatch: titleMatch, // Focus on title match instead of broad query
            number: number || 5,
            apiKey: apiKey
        };

        if (cuisine) params.cuisine = cuisine;
        if (diet) params.diet = diet;
        if (intolerance) params.intolerances = intolerance;

        const response = await axios.get(`${api_domain}/complexSearch`, { params });
        

        if (response.data.results.length === 0) {
            throw new Error(`No recipes found for "${titleMatch}".`);
        }
        console.log(response)
        return response.data.results.map(element => element.id);
    } catch (error) {
        throw new Error("Error searching for recipes.");
    }
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipeInformation = getRandomRecipeInformation;
exports.searchRecipe = searchRecipe;
