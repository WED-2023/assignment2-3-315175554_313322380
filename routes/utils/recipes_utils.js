const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}
/**
 * 
 * 
 * with this function we get number of random recipes inforamtion
 */
/**
 * Get random recipes from Spoonacular API
 * @param {*} number 
 * @param {*} includeTags  
 * @param {*} excludeTags 
 */
async function getRandomRecipeInformation(number) {
  try {
      const response = await axios.get(`${api_domain}/random`, {
          params: {
              number: number,
              apiKey: process.env.spooncular_apiKey
            }
      });
      
      if (response && response.data && response.data.recipes) {
          const recipesDetails = response.data.recipes.map(recipe => {
              const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe;
              return {
                  id,
                  title,
                  readyInMinutes,
                  image,
                  popularity: aggregateLikes,
                  vegan,
                  vegetarian,
                  glutenFree
              };
          });
          return recipesDetails;
      } else {
          throw new Error('No recipes found');
      }
  } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
  }
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
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
}



exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipeInformation = getRandomRecipeInformation;