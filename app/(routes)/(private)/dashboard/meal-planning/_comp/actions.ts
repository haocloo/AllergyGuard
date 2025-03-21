'use server';

import { revalidatePath } from 'next/cache';

// services
import { lucia_get_user, utils_log_server_error, utils_log_server_info } from '@/services/server';
import { FormState } from '@/components/helpers/form-items';
import { toFormState, fromErrorToFormState } from '@/components/helpers/form-items';

// Import mock data from our local file instead of the global one
import { mockMealPlans, childAllergies, getMockRecipes, getMockRecipeById } from './mock-data';
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

    // Use our mock data from the local file
    return mockMealPlans.filter(plan => plan.id !== '0'); // Just a simple filter to demonstrate
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

    // Use our mock data from the local file
    return childAllergies;
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

    // For demonstration purposes - using string-only form to avoid linter errors
    const newPlan = {
      ...mealPlan,
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };
    console.log('Meal plan would be created:', newPlan);

    revalidatePath('/meal-planning/plans');
    return { success: true, message: 'Meal plan created successfully' };
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

    // For demonstration purposes - using string-only form to avoid linter errors
    const updatedPlan = {
      id,
      ...mealPlan,
      updatedAt: new Date().toISOString(),
    };
    console.log('Meal plan would be updated:', updatedPlan);

    revalidatePath('/meal-planning/plans');
    return { success: true, message: 'Meal plan updated successfully' };
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

    // For demonstration purposes - using string-only form to avoid linter errors
    console.log('Meal plan would be deleted:', { id });

    revalidatePath('/meal-planning/plans');
    return { success: true, message: 'Meal plan deleted successfully' };
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
    // Use our mock data from the local file
    return getMockRecipes();
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
    // Use our mock data from the local file
    return getMockRecipeById(id);
  } catch (error) {
    console.error(`Error fetching food recipe with ID ${id}:`, error);
    return null;
  }
}
