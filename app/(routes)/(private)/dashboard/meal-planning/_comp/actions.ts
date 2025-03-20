'use server';

import { revalidatePath } from 'next/cache';

// services
import { lucia_get_user, utils_log_server_error, utils_log_server_info } from '@/services/server';
import { FormState } from '@/components/helpers/form-items';
import { toFormState, fromErrorToFormState } from '@/components/helpers/form-items';

// Firestore would be used in production
// import { adminFirestore } from '@/lib/firebaseAdmin';
// import { FieldValue } from 'firebase-admin/firestore';

// For now using dummy data
import { children, mealPlans as dummyMealPlans } from '@/services/dummy-data';
import { Allergen, FoodRecipe, Ingredient, MealPlan } from './store';

/**
 * Get all meal plans for the current user
 */
export async function getMealPlans(): Promise<MealPlan[]> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return [];
    }

    // In production, we would fetch from Firestore
    // const snapshot = await adminFirestore
    //   .collection('mealPlans')
    //   .where('createdBy', '==', user.id)
    //   .get();
    //
    // return snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }) as MealPlan);

    // For now, convert dummy data to match our store format
    const storedMealPlans = dummyMealPlans
      .filter((plan) => plan.scenario === 'foodPlan' && plan.createdBy === user.id)
      .map((plan) => {
        // Extract ingredients from the plan
        const ingredients: Ingredient[] = [];

        // Type casting to handle any issues with dailyPlans structure
        const dailyPlans = plan.dailyPlans as Record<string, string[]>;

        for (const day in dailyPlans) {
          dailyPlans[day].forEach((meal) => {
            ingredients.push({
              name: meal,
              containsAllergens: [],
            });
          });
        }

        return {
          id: plan.id,
          name: `Meal Plan for ${new Date(plan.createdAt).toLocaleDateString()}`,
          description: plan.prompt || 'Weekly meal plan',
          ingredients,
          allergensFound: [],
          suggestions: [],
          createdAt: plan.createdAt,
          imageUrl: undefined,
        };
      });

    return storedMealPlans;
  } catch (error) {
    utils_log_server_error('Error fetching meal plans:', error);
    return [];
  }
}

/**
 * Get all allergies for the current user's children
 */
export async function getChildAllergies(): Promise<Allergen[]> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return [];
    }

    // In production, we would fetch from Firestore
    // const snapshot = await adminFirestore
    //   .collection('children')
    //   .where('parentId', '==', user.id)
    //   .get();
    //
    // const userChildren = snapshot.docs.map(doc => ({
    //   id: doc.id,
    //   ...doc.data()
    // }));

    // For now, using dummy data
    const userChildren = children.filter((child) => child.parentId === user.id);

    // Extract allergies from all children
    const childAllergies = userChildren.flatMap((child) =>
      child.allergies.map((allergy) => ({
        name: allergy.allergen,
        severity: allergy.severity as 'High' | 'Medium' | 'Low',
      }))
    );

    // Remove duplicates (if multiple children have the same allergy)
    const uniqueAllergies = childAllergies.filter(
      (allergy, index, self) => index === self.findIndex((a) => a.name === allergy.name)
    );

    return uniqueAllergies;
  } catch (error) {
    utils_log_server_error('Error fetching child allergies:', error);
    return [];
  }
}

/**
 * Create a new meal plan
 */
export async function createMealPlan(
  mealPlan: Omit<MealPlan, 'id' | 'createdAt'>
): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return fromErrorToFormState('You must be logged in to create a meal plan');
    }

    // In production, we would add to Firestore
    // const newMealPlan = {
    //   ...mealPlan,
    //   createdBy: user.id,
    //   createdAt: FieldValue.serverTimestamp(),
    // };
    //
    // const docRef = await adminFirestore.collection('mealPlans').add(newMealPlan);
    // revalidatePath('/meal-planning/plans');
    // return toFormState({
    //   message: 'Meal plan created successfully',
    //   id: docRef.id,
    // });

    // For demonstration purposes
    utils_log_server_info('Meal plan would be created:', {
      ...mealPlan,
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/meal-planning/plans');
    return toFormState({ message: 'Meal plan created successfully' });
  } catch (error) {
    utils_log_server_error('Error creating meal plan:', error);
    return fromErrorToFormState('Failed to create meal plan');
  }
}

/**
 * Update an existing meal plan
 */
export async function updateMealPlan(id: string, mealPlan: Partial<MealPlan>): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return fromErrorToFormState('You must be logged in to update a meal plan');
    }

    // In production, we would update in Firestore
    // await adminFirestore.collection('mealPlans').doc(id).update({
    //   ...mealPlan,
    //   updatedAt: FieldValue.serverTimestamp(),
    // });

    // For demonstration purposes
    utils_log_server_info('Meal plan would be updated:', {
      id,
      ...mealPlan,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/meal-planning/plans');
    return toFormState({ message: 'Meal plan updated successfully' });
  } catch (error) {
    utils_log_server_error('Error updating meal plan:', error);
    return fromErrorToFormState('Failed to update meal plan');
  }
}

/**
 * Delete a meal plan
 */
export async function deleteMealPlan(id: string): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return fromErrorToFormState('You must be logged in to delete a meal plan');
    }

    // In production, we would delete from Firestore
    // await adminFirestore.collection('mealPlans').doc(id).delete();

    // For demonstration purposes
    utils_log_server_info('Meal plan would be deleted:', { id });

    revalidatePath('/meal-planning/plans');
    return toFormState({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    utils_log_server_error('Error deleting meal plan:', error);
    return fromErrorToFormState('Failed to delete meal plan');
  }
}

/**
 * Get food recipes for the food list
 */
export async function getFoodRecipes(): Promise<FoodRecipe[]> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return [];
    }

    // In production, we would fetch from an API or database
    // For now, create dummy food recipes based on the mealPlans data
    
    const foodRecipes: FoodRecipe[] = [
      {
        id: '1',
        name: 'Almond Cake',
        description: 'A delicious gluten-free almond cake that everyone will love',
        ingredients: [
          { name: 'Almond flour, 2 cups', containsAllergens: ['nuts'] },
          { name: 'Eggs, 4 large', containsAllergens: ['eggs'] },
          { name: 'Sugar, 1 cup', containsAllergens: [] },
          { name: 'Baking powder, 1 tsp', containsAllergens: [] },
          { name: 'Vanilla extract, 1 tsp', containsAllergens: [] },
        ],
        instructions: [
          'Preheat oven to 350°F (175°C)',
          'Mix almond flour with baking powder',
          'Beat eggs with sugar until fluffy',
          'Fold in dry ingredients and vanilla',
          'Bake for 30-35 minutes until golden'
        ],
        allergensFound: ['nuts', 'eggs'],
        suggestions: ['Replace eggs with flax eggs for egg allergies'],
        imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=1000&auto=format&fit=crop',
      },
      {
        id: '2',
        name: 'Curry Ayam Mat Rempit',
        description: 'Spicy Malaysian chicken curry with authentic flavors',
        ingredients: [
          { name: 'Chicken pieces, 1kg', containsAllergens: [] },
          { name: 'Curry powder, 3 tbsp', containsAllergens: [] },
          { name: 'Coconut milk, 1 cup', containsAllergens: ['tree nuts'] },
          { name: 'Potatoes, 2 medium', containsAllergens: [] },
          { name: 'Onion, 1 large', containsAllergens: [] },
        ],
        instructions: [
          'Marinate chicken with curry powder',
          'Sauté onions until golden',
          'Add chicken and cook until browned',
          'Add potatoes and coconut milk',
          'Simmer until chicken is tender and potatoes are cooked'
        ],
        allergensFound: ['tree nuts'],
        suggestions: ['Use dairy-free yogurt instead of coconut milk for tree nut allergies'],
        imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=1000&auto=format&fit=crop',
      },
      {
        id: '3',
        name: 'Healthy Salad Bowl',
        description: 'A nutrient-packed salad bowl with fresh vegetables and protein',
        ingredients: [
          { name: 'Mixed greens, 2 cups', containsAllergens: [] },
          { name: 'Grilled chicken, 1 cup', containsAllergens: [] },
          { name: 'Avocado, 1/2', containsAllergens: [] },
          { name: 'Cherry tomatoes, 1/2 cup', containsAllergens: [] },
          { name: 'Walnuts, 2 tbsp', containsAllergens: ['tree nuts'] },
          { name: 'Olive oil, 1 tbsp', containsAllergens: [] },
          { name: 'Lemon juice, 1 tbsp', containsAllergens: [] },
        ],
        instructions: [
          'Wash and dry mixed greens',
          'Slice avocado and halve cherry tomatoes',
          'Arrange greens, chicken, avocado, and tomatoes in a bowl',
          'Sprinkle with walnuts',
          'Drizzle with olive oil and lemon juice'
        ],
        allergensFound: ['tree nuts'],
        suggestions: ['Omit walnuts or replace with seeds for nut allergies'],
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
      },
    ];

    return foodRecipes;
  } catch (error) {
    utils_log_server_error('Error getting food recipes', error);
    return [];
  }
}

/**
 * Get a specific food recipe by ID
 */
export async function getFoodRecipeById(recipeId: string): Promise<FoodRecipe | null> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      return null;
    }

    // In production, we would fetch from Firestore
    // const doc = await adminFirestore.collection('foodRecipes').doc(recipeId).get();
    // if (!doc.exists) return null;
    // return { id: doc.id, ...doc.data() } as FoodRecipe;

    // For now, use our dummy data
    const recipes = await getFoodRecipes();
    return recipes.find(recipe => recipe.id === recipeId) || null;

  } catch (error) {
    utils_log_server_error('Error getting food recipe by ID', error);
    return null;
  }
}
