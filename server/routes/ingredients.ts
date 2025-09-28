import express from 'express';
import { mysqlService } from '../services/mysqlService';

const router = express.Router();

// GET /api/ingredients - Get all ingredients or search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let ingredients;
    if (search && typeof search === 'string') {
      ingredients = await mysqlService.searchIngredients(search);
    } else {
      ingredients = await mysqlService.getAllIngredients();
    }

    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// GET /api/ingredients/:id - Get ingredient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await mysqlService.getIngredient(id);

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

// POST /api/ingredients - Create new ingredient
router.post('/', async (req, res) => {
  try {
    const ingredientData = req.body;

    // Basic validation
    if (!ingredientData.nombre || !ingredientData.categoria) {
      return res.status(400).json({ error: 'Missing required fields: nombre, categoria' });
    }

    const ingredient = await mysqlService.createIngredient(ingredientData);
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);

    // Check for duplicate name error
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An ingredient with this name already exists' });
    }

    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PUT /api/ingredients/:id - Update ingredient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ingredient = await mysqlService.updateIngredient(id, updates);
    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);

    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// DELETE /api/ingredients/:id - Delete ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await mysqlService.deleteIngredient(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

export default router;