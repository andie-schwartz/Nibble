const express = require('express');
const router = express.Router();
const spoonacularAPI = require('../services/spoonacularAPI');

// Search ingredients
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query) {
      return res.json([]);
    }

    const results = await spoonacularAPI.searchIngredients(query);
    
    const formatted = results.map(item => ({
      id: item.id.toString(),
      name: item.name,
      image: item.image
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search ingredients' });
  }
});

// Get ingredient details
router.get('/:id', async (req, res) => {
  try {
    const amount = req.query.amount || 100;
    const unit = req.query.unit || 'grams';
    
    const nutrition = await spoonacularAPI.getIngredientNutrition(
      req.params.id,
      amount,
      unit
    );
    
    res.json(nutrition);
  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ error: 'Failed to get ingredient' });
  }
});

module.exports = router;