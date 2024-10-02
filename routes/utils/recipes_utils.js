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
async function getRecipesPreview(recipeIds) {
    try {
      console.log('Fetching previews for recipe IDs:', recipeIds);
  
      // Map over valid IDs and fetch recipe information
      const recipePromises = recipeIds.map(async (id) => {
        try {
          // Fetch recipe information for each valid ID
          const recipeInfo = await getRecipeInformation(id);
  
          // Ensure `recipeInfo` has the expected structure
          if (recipeInfo && recipeInfo.data) {
            // Safely destructure fields from `recipeInfo.data`
            const { id: recipeId, title, readyInMinutes, image, aggregateLikes } = recipeInfo.data;
  
            // Return the structured recipe data
            return {
              id: recipeId,
              title,
              readyInMinutes,
              image,
              popularity: aggregateLikes,
            };
          } else {
            // Handle unexpected response structure
            console.error(`Unexpected response structure for recipe ID: ${id}`, recipeInfo);
            return null;
          }
        } catch (error) {
          console.error(`Failed to fetch information for recipe ID: ${id}`, error);
          return null; // Return null for failed requests to be filtered out later
        }
      });
  
      // Await all promises and filter out any failed requests
      const recipesInfo = (await Promise.all(recipePromises)).filter(info => info !== null);
  
      return recipesInfo;
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
