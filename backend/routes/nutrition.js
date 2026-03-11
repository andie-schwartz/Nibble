const express = require('express');
const router = express.Router();
const spoonacularAPI = require('../services/spoonacularAPI');

// Calculate nutrition for ingredients
router.post('/calculate', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'ingredients array required' });
    }

    const nutritionPromises = ingredients.map(async (ing) => {
      try {
        return await spoonacularAPI.getIngredientNutrition(
          ing.ingredientId,
          ing.amount,
          'grams'
        );
      } catch (error) {
        console.error(`Error for ${ing.ingredientId}:`, error.message);
        return null;
      }
    });

    const nutritionData = await Promise.all(nutritionPromises);
    const validData = nutritionData.filter(item => item !== null);

    const totals = validData.reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const proteinCals = totals.protein * 4;
    const carbsCals = totals.carbs * 4;
    const fatCals = totals.fat * 9;
    const totalCals = proteinCals + carbsCals + fatCals;

    const macroPercentages = {
      protein: totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0,
      carbs: totalCals > 0 ? Math.round((carbsCals / totalCals) * 100) : 0,
      fat: totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0
    };

    res.json({
      nutrition: {
        breakdown: validData,
        totals: totals
      },
      macroPercentages
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: 'Failed to calculate nutrition' });
  }
});

module.exports = router;