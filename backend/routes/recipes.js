const express = require('express');
const router = express.Router();
const spoonacularAPI = require('../services/spoonacularAPI');

// Get recipe recommendations
router.post('/recommend', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.json([]);
    }

    const ingredientNames = ingredients.map(ing => ing.name || ing.ingredientId);
    
    const recipes = await spoonacularAPI.searchRecipes(ingredientNames, 5);
    
    const recommendations = recipes.map(recipe => ({
      recipe: {
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount
      },
      matchCount: recipe.usedIngredientCount,
      totalInRecipe: recipe.usedIngredientCount + recipe.missedIngredientCount,
      matchPercentage: Math.round(
        (recipe.usedIngredientCount / (recipe.usedIngredientCount + recipe.missedIngredientCount)) * 100
      ),
      explanation: `Uses ${recipe.usedIngredientCount} of your ingredients. Missing ${recipe.missedIngredientCount} ingredients.`
    }));

    res.json(recommendations);
  } catch (error) {
    console.error('Recommend error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await spoonacularAPI.getRecipeDetails(req.params.id);
    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to get recipe' });
  }
});

// Get recipe nutrition
router.get('/:id/nutrition', async (req, res) => {
  try {
    const recipe = await spoonacularAPI.getRecipeDetails(req.params.id);
    
    res.json({
      recipe: {
        id: recipe.id,
        name: recipe.name,
        servings: recipe.servings
      },
      nutrition: {
        totals: recipe.nutrition
      }
    });
  } catch (error) {
    console.error('Get nutrition error:', error);
    res.status(500).json({ error: 'Failed to get recipe nutrition' });
  }
});

module.exports = router;