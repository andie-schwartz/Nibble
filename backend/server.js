const express = require('express');
const cors = require('cors');
const ingredientRoutes = require('./routes/ingredients');
const recipeRoutes = require('./routes/recipes');
const nutritionRoutes = require('./routes/nutrition');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nibble API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️  Nibble server running on http://localhost:${PORT}`);
  console.log(`📊 Using Spoonacular API for real data`);
});