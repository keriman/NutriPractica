import express from 'express';
import { mysqlService } from '../services/mysqlService';
import { aiService } from '../services/aiService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/recipes - Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await mysqlService.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /api/recipes/:id - Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await mysqlService.getRecipe(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', async (req, res) => {
  try {
    const recipeData = req.body;

    // Basic validation
    if (!recipeData.nombre || !recipeData.ingredientes || !recipeData.instrucciones) {
      return res.status(400).json({
        error: 'Missing required fields: nombre, ingredientes, instrucciones'
      });
    }

    const recipe = await mysqlService.createRecipe(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// POST /api/recipes/generate - Generate recipe with AI
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      ingredientIds,
      dietaryRestrictions,
      mealType,
      servings,
      maxCalories,
      cuisine,
      difficulty,
      cookingTime
    } = req.body;

    // Validate required fields
    if (!ingredientIds || !Array.isArray(ingredientIds) || ingredientIds.length === 0) {
      return res.status(400).json({
        error: 'At least one ingredient ID is required in ingredientIds array'
      });
    }

    // Get ingredient details from database
    const ingredients = [];
    for (const id of ingredientIds) {
      const ingredient = await mysqlService.getIngredient(id);
      if (ingredient) {
        ingredients.push(ingredient);
      } else {
        console.warn(`Ingredient with ID ${id} not found`);
      }
    }

    if (ingredients.length === 0) {
      return res.status(400).json({
        error: 'No valid ingredients found for the provided IDs'
      });
    }

    // Generate recipes with AI
    console.log(`🤖 Generating 4 recipes with ${ingredients.length} ingredients...`);
    const generatedRecipes = await aiService.generateRecipe({
      ingredients,
      dietaryRestrictions,
      mealType,
      servings: servings || 2,
      maxCalories,
      cuisine,
      difficulty,
      cookingTime
    });

    // Save all generated recipes to database
    const savedRecipes = [];
    for (const recipe of generatedRecipes.recetas) {
      // Add user_id to the recipe
      const recipeWithUser = {
        ...recipe,
        user_id: req.user!.id
      };
      const savedRecipe = await mysqlService.createRecipe(recipeWithUser);
      savedRecipes.push(savedRecipe);
    }

    console.log(`✅ ${savedRecipes.length} recipes generated and saved`);
    res.status(201).json({
      message: `${savedRecipes.length} recipes generated successfully`,
      recipes: savedRecipes
    });

  } catch (error) {
    console.error('❌ Error generating recipe:', error);

    // Handle specific AI service errors
    if ((error as Error).message.includes('AI service not configured')) {
      return res.status(503).json({
        error: 'AI service not available. Please configure GEMINI_API_KEY.'
      });
    }

    if ((error as Error).message.includes('API key')) {
      return res.status(503).json({
        error: 'AI service configuration error. Please check your API key.'
      });
    }

    if ((error as Error).message.includes('quota')) {
      return res.status(429).json({
        error: 'AI service quota exceeded. Please try again later.'
      });
    }

    if ((error as Error).message.includes('invalid JSON')) {
      return res.status(502).json({
        error: 'AI service returned invalid response. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate recipe with AI',
      details: (error as Error).message
    });
  }
});

// GET /api/recipes/ai/test - Test AI connection
router.get('/ai/test', async (req, res) => {
  try {
    const isWorking = await aiService.testConnection();

    if (isWorking) {
      res.json({
        status: 'AI service is working',
        provider: 'Google Gemini'
      });
    } else {
      res.status(503).json({
        status: 'AI service not available',
        error: 'Please check GEMINI_API_KEY configuration'
      });
    }
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.status(500).json({
      status: 'Error testing AI service',
      error: (error as Error).message
    });
  }
});

export default router;