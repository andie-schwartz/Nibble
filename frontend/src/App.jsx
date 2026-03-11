import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [searching, setSearching] = useState(false);

  // Search for ingredients
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setIngredients([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`/api/ingredients/search?q=${query}`);
      setIngredients(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  // Add ingredient to list
  const addIngredient = (ingredient) => {
    setSelectedIngredients([
      ...selectedIngredients,
      { ingredientId: ingredient.id, name: ingredient.name, amount: 100 }
    ]);
    setSearchQuery('');
    setIngredients([]);
  };

  // Remove ingredient
  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  // Update amount
  const updateAmount = (index, newAmount) => {
    const updated = [...selectedIngredients];
    updated[index].amount = parseFloat(newAmount);
    setSelectedIngredients(updated);
  };

  // Calculate nutrition
  const calculateNutrition = async () => {
    if (selectedIngredients.length === 0) return;

    try {
      const response = await axios.post('/api/nutrition/calculate', {
        ingredients: selectedIngredients
      });
      setNutrition(response.data);
    } catch (error) {
      console.error('Calculate error:', error);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🍽️ Nibble</h1>
        <p>Ingredient-based Nutrition Explorer</p>
      </header>

      <div className="container">
        <div className="left-panel">
          <h2>Build Your Recipe</h2>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searching && <p>Searching...</p>}
            {ingredients.length > 0 && (
              <div className="search-results">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="search-result"
                    onClick={() => addIngredient(ing)}
                  >
                    {ing.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3>Selected Ingredients ({selectedIngredients.length})</h3>
          
          {selectedIngredients.length === 0 ? (
            <p className="empty">No ingredients yet. Search and add some!</p>
          ) : (
            <div className="ingredient-list">
              {selectedIngredients.map((ing, index) => (
                <div key={index} className="ingredient-item">
                  <span>{ing.name}</span>
                  <input
                    type="number"
                    value={ing.amount}
                    onChange={(e) => updateAmount(index, e.target.value)}
                    min="1"
                  />
                  <span>g</span>
                  <button onClick={() => removeIngredient(index)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {selectedIngredients.length > 0 && (
            <button className="calculate-btn" onClick={calculateNutrition}>
              Calculate Nutrition
            </button>
          )}
        </div>

        <div className="right-panel">
          <h2>Nutrition Information</h2>
          
          {!nutrition ? (
            <p className="empty">Add ingredients and click "Calculate Nutrition" to see results</p>
          ) : (
            <div className="nutrition-display">
              <div className="totals">
                <div className="total-card">
                  <div className="value">{Math.round(nutrition.nutrition.totals.calories)}</div>
                  <div className="label">Calories</div>
                </div>
                <div className="total-card">
                  <div className="value">{nutrition.nutrition.totals.protein}g</div>
                  <div className="label">Protein</div>
                </div>
                <div className="total-card">
                  <div className="value">{nutrition.nutrition.totals.carbs}g</div>
                  <div className="label">Carbs</div>
                </div>
                <div className="total-card">
                  <div className="value">{nutrition.nutrition.totals.fat}g</div>
                  <div className="label">Fat</div>
                </div>
              </div>

              <h3>Macro Distribution</h3>
              <div className="macro-bars">
                <div className="macro-bar">
                  <span>Protein</span>
                  <div className="bar">
                    <div 
                      className="fill protein" 
                      style={{width: `${nutrition.macroPercentages.protein}%`}}
                    ></div>
                  </div>
                  <span>{nutrition.macroPercentages.protein}%</span>
                </div>
                <div className="macro-bar">
                  <span>Carbs</span>
                  <div className="bar">
                    <div 
                      className="fill carbs" 
                      style={{width: `${nutrition.macroPercentages.carbs}%`}}
                    ></div>
                  </div>
                  <span>{nutrition.macroPercentages.carbs}%</span>
                </div>
                <div className="macro-bar">
                  <span>Fat</span>
                  <div className="bar">
                    <div 
                      className="fill fat" 
                      style={{width: `${nutrition.macroPercentages.fat}%`}}
                    ></div>
                  </div>
                  <span>{nutrition.macroPercentages.fat}%</span>
                </div>
              </div>

              <h3>Breakdown by Ingredient</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Amount</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fat</th>
                  </tr>
                </thead>
                <tbody>
                  {nutrition.nutrition.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.amount}g</td>
                      <td>{Math.round(item.calories)}</td>
                      <td>{item.protein}g</td>
                      <td>{item.carbs}g</td>
                      <td>{item.fat}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;