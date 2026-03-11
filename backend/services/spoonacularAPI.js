const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

class SpoonacularAPI {
  
  // Search for ingredients
  async searchIngredients(query) {
    try {
      const response = await axios.get(`${BASE_URL}/food/ingredients/search`, {
        params: {
          apiKey: API_KEY,
          query: query,
          number: 20
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching ingredients:', error.message);
      throw error;
    }
  }

  // Get nutrition for a specific ingredient
  async getIngredientNutrition(id, amount = 100, unit = 'grams') {
    try {
      const response = await axios.get(
        `${BASE_URL}/food/ingredients/${id}/information`,
        {
          params: {
            apiKey: API_KEY,
            amount: amount,
            unit: unit
          }
        }
      );
      
      const nutrition = response.data.nutrition.nutrients;
      
      return {
        id: response.data.id,
        name: response.data.name,
        amount: amount,
        unit: unit,
        calories: this.findNutrient(nutrition, 'Calories'),
        protein: this.findNutrient(nutrition, 'Protein'),
        carbs: this.findNutrient(nutrition, 'Carbohydrates'),
        fat: this.findNutrient(nutrition, 'Fat')
      };
    } catch (error) {
      console.error('Error getting nutrition:', error.message);
      throw error;
    }
  }

  // Search for recipes
  async searchRecipes(ingredients, number = 10) {
    try {
      const ingredientString = Array.isArray(ingredients) 
        ? ingredients.join(',') 
        : ingredients;
        
      const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
        params: {
          apiKey: API_KEY,
          ingredients: ingredientString,
          number: number,
          ranking: 2,
          ignorePantry: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching recipes:', error.message);
      throw error;
    }
  }

  // Get recipe details
  async getRecipeDetails(recipeId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/recipes/${recipeId}/information`,
        {
          params: {
            apiKey: API_KEY,
            includeNutrition: true
          }
        }
      );
      
      const recipe = response.data;
      const nutrients = recipe.nutrition?.nutrients || [];
      
      return {
        id: recipe.id,
        name: recipe.title,
        description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 200) : '',
        servings: recipe.servings,
        readyInMinutes: recipe.readyInMinutes,
        image: recipe.image,
        ingredients: recipe.extendedIngredients.map(ing => ({
          ingredientId: ing.id.toString(),
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        })),
        nutrition: {
          calories: this.findNutrient(nutrients, 'Calories'),
          protein: this.findNutrient(nutrients, 'Protein'),
          carbs: this.findNutrient(nutrients, 'Carbohydrates'),
          fat: this.findNutrient(nutrients, 'Fat')
        }
      };
    } catch (error) {
      console.error('Error getting recipe:', error.message);
      throw error;
    }
  }

  // Helper function
  findNutrient(nutrients, name) {
    const nutrient = nutrients.find(n => n.name === name);
    return nutrient ? Math.round(nutrient.amount * 10) / 10 : 0;
  }
}

module.exports = new SpoonacularAPI();