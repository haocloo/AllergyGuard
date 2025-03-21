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
        severity:
          'severity' in allergy ? (allergy.severity as 'High' | 'Medium' | 'Low') : 'Medium',
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
    utils_log_server_info('create_meal_plan', 'Meal plan would be created', {
      mealPlanData: {
        ...mealPlan,
        id: crypto.randomUUID(),
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      },
    });

    revalidatePath('/meal-planning/plans');
    return toFormState('SUCCESS', 'Meal plan created successfully');
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
    utils_log_server_info('update_meal_plan', 'Meal plan would be updated', {
      id,
      mealPlanData: {
        ...mealPlan,
        updatedAt: new Date().toISOString(),
      },
    });

    revalidatePath('/meal-planning/plans');
    return toFormState('SUCCESS', 'Meal plan updated successfully');
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
    utils_log_server_info('delete_meal_plan', 'Meal plan would be deleted', {
      id,
    });

    revalidatePath('/meal-planning/plans');
    return toFormState('SUCCESS', 'Meal plan deleted successfully');
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
    // In a real app, you would fetch these from a database
    // For demo purposes, we're returning mock data

    // Simulating a database query
    const mockRecipes: FoodRecipe[] = [
      {
        id: '1',
        name: 'Quinoa Salad',
        description: 'A refreshing salad with quinoa, vegetables, and a light dressing.',
        ingredients: [
          { name: 'Quinoa', containsAllergens: [] },
          { name: 'Cucumber', containsAllergens: [] },
          { name: 'Cherry Tomatoes', containsAllergens: [] },
          { name: 'Red Onion', containsAllergens: [] },
          { name: 'Olive Oil', containsAllergens: [] },
          { name: 'Lemon Juice', containsAllergens: [] },
        ],
        instructions: [
          'Cook quinoa according to package instructions and let it cool.',
          'Dice cucumber, halve cherry tomatoes, and finely chop red onion.',
          'Mix all ingredients in a large bowl.',
          'Dress with olive oil and lemon juice, salt and pepper to taste.',
          'Serve chilled or at room temperature.',
        ],
        allergensFound: [],
        suggestions: [
          'Add feta cheese for extra flavor (contains milk allergen).',
          'Try adding nuts for crunch (tree nut allergen).',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Gluten-Free Pancakes',
        description: 'Fluffy pancakes made with gluten-free flour blend.',
        ingredients: [
          { name: 'Gluten-Free Flour Blend', containsAllergens: [] },
          { name: 'Eggs', containsAllergens: ['Egg'] },
          { name: 'Milk', containsAllergens: ['Milk'] },
          { name: 'Baking Powder', containsAllergens: [] },
          { name: 'Vanilla Extract', containsAllergens: [] },
          { name: 'Maple Syrup', containsAllergens: [] },
        ],
        instructions: [
          'Mix all dry ingredients in a bowl.',
          'In a separate bowl, whisk eggs and milk together.',
          'Combine wet and dry ingredients, add vanilla extract.',
          'Heat a pan and cook pancakes until bubbles form and edges are set.',
          'Flip and cook until golden.',
          'Serve with maple syrup.',
        ],
        allergensFound: ['Egg', 'Milk'],
        suggestions: [
          'Use plant-based milk for dairy-free option.',
          'Substitute eggs with applesauce or banana for egg-free version.',
        ],
        imageUrl:
          'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80',
      },
    ];

    return mockRecipes;
  } catch (error) {
    console.error('Error fetching food recipes:', error);
    return [];
  }
}

/**
 * Get a single food recipe by ID
 */
export async function getFoodRecipeById(id: string): Promise<FoodRecipe | null> {
  try {
    // First, get all server-side recipes
    const allRecipes = await getFoodRecipes();

    // Check if the recipe exists in the server data
    const recipe = allRecipes.find((recipe) => recipe.id === id);

    if (recipe) {
      return recipe;
    }

    // If not found, it might be a client-side saved recipe that's only in localStorage
    // The client will need to check the food list store for this ID

    // In a real app, we would make a database query here
    // For now, we'll just return null and let the client handle it
    return null;
  } catch (error) {
    console.error(`Error fetching food recipe with ID ${id}:`, error);
    return null;
  }
}
