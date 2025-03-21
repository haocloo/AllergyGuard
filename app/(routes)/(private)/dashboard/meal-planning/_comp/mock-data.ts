import { Allergen, FoodRecipe, Ingredient, MealPlan } from './store';

// Get current user id from env variable (or fallback for development)
const currentUserId = process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981';

// Family members data for use across meal planning components
export const familyMembers = [
  { id: '1', name: 'John', allergies: ['Peanut', 'Milk'] },
  { id: '2', name: 'Mary', allergies: ['Egg'] },
  { id: '3', name: 'Emma', allergies: ['Wheat', 'Soy'] },
  { id: '4', name: 'Lucas', allergies: [] },
];

// Child allergies for meal planning
export const childAllergies: Allergen[] = [
  { name: 'Peanut', severity: 'High' },
  { name: 'Milk', severity: 'Medium' },
  { name: 'Egg', severity: 'Low' },
  { name: 'Wheat', severity: 'Medium' },
  { name: 'Soy', severity: 'Low' },
];

// Mock meal plans
export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Weekly Family Plan',
    description: 'A balanced meal plan for the whole family',
    ingredients: [
      { name: 'Quinoa', containsAllergens: [] },
      { name: 'Chicken', containsAllergens: [] },
      { name: 'Broccoli', containsAllergens: [] },
      { name: 'Sweet Potatoes', containsAllergens: [] },
    ],
    allergensFound: [],
    suggestions: ['Use separate utensils for cooking to avoid cross-contamination'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'School Lunch Plan',
    description: 'Allergy-safe packed lunches for school',
    ingredients: [
      { name: 'Rice', containsAllergens: [] },
      { name: 'Tuna', containsAllergens: [] },
      { name: 'Carrots', containsAllergens: [] },
      { name: 'Apples', containsAllergens: [] },
    ],
    allergensFound: [],
    suggestions: ['Pack in separate containers to maintain freshness'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  }
];

// Mock recipes
export const mockRecipes: FoodRecipe[] = [
  {
    id: '1',
    name: 'Allergen-Free Quinoa Salad',
    description: 'A refreshing and completely allergen-free salad with quinoa, vegetables, and a light dressing.',
    ingredients: [
      { name: 'Quinoa', containsAllergens: [] },
      { name: 'Cucumber', containsAllergens: [] },
      { name: 'Cherry Tomatoes', containsAllergens: [] },
      { name: 'Red Onion', containsAllergens: [] },
      { name: 'Olive Oil', containsAllergens: [] },
      { name: 'Lemon Juice', containsAllergens: [] },
      { name: 'Fresh Herbs', containsAllergens: [] },
    ],
    instructions: [
      'Cook quinoa according to package instructions and let it cool.',
      'Dice cucumber, halve cherry tomatoes, and finely chop red onion.',
      'Mix all ingredients in a large bowl.',
      'Dress with olive oil and lemon juice, salt and pepper to taste.',
      'Garnish with fresh herbs and serve chilled or at room temperature.',
    ],
    allergensFound: [], // Truly allergen-free recipe
    suggestions: [
      'This recipe is safe for individuals with food allergies.',
      'For added protein, consider adding grilled chicken (check for allergens if pre-seasoned).',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Shellfish Paella',
    description: 'A flavorful Spanish rice dish with shellfish and saffron.',
    ingredients: [
      { name: 'Arborio Rice', containsAllergens: [] },
      { name: 'Shrimp', containsAllergens: ['Shellfish'] },
      { name: 'Mussels', containsAllergens: ['Shellfish'] },
      { name: 'Clams', containsAllergens: ['Shellfish'] },
      { name: 'Bell Peppers', containsAllergens: [] },
      { name: 'Saffron', containsAllergens: [] },
      { name: 'Olive Oil', containsAllergens: [] },
    ],
    instructions: [
      'Heat olive oil in a paella pan or large skillet.',
      'Add rice and saffron, toast lightly.',
      'Add broth and simmer until rice is almost cooked.',
      'Add shellfish and cook until they open or turn pink.',
      'Garnish with lemon wedges and serve hot.',
    ],
    allergensFound: ['Shellfish'], // Contains shellfish, but none of our sample family members are allergic
    suggestions: [
      'This recipe contains shellfish, which is a common allergen.',
      'Ensure proper handling of shellfish to avoid cross-contamination.',
      'For a shellfish-free version, substitute with chicken and chorizo.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Classic Peanut Butter Cookies',
    description: 'Traditional cookies with a rich peanut butter flavor and soft, chewy texture.',
    ingredients: [
      { name: 'Peanut Butter', containsAllergens: ['Peanut'] },
      { name: 'All-Purpose Flour', containsAllergens: ['Wheat'] },
      { name: 'Eggs', containsAllergens: ['Egg'] },
      { name: 'Butter', containsAllergens: ['Milk'] },
      { name: 'Sugar', containsAllergens: [] },
      { name: 'Brown Sugar', containsAllergens: [] },
      { name: 'Vanilla Extract', containsAllergens: [] },
    ],
    instructions: [
      'Cream together butter and sugars until light and fluffy.',
      'Add eggs, peanut butter, and vanilla, beat until well combined.',
      'Mix in dry ingredients until just combined.',
      'Roll dough into balls and place on a baking sheet.',
      'Press down slightly with a fork to create a criss-cross pattern.',
      'Bake at 350°F for 10-12 minutes until edges are golden.',
      'Cool on the baking sheet for 5 minutes before transferring to a wire rack.',
    ],
    allergensFound: ['Peanut', 'Wheat', 'Egg', 'Milk'], // Contains major allergens that affect several family members
    suggestions: [
      'This recipe contains multiple common allergens including peanuts, wheat, eggs, and milk.',
      'Always clearly label these cookies when serving to guests.',
      'Consider alternative cookie recipes for individuals with these allergies.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Gluten-Free Pancakes',
    description: 'Fluffy pancakes made with gluten-free flour blend, perfect for those with wheat allergies.',
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
    allergensFound: ['Egg', 'Milk'], // Contains some allergens but not wheat
    suggestions: [
      'Use plant-based milk for dairy-free option.',
      'Substitute eggs with applesauce or banana for egg-free version.',
      'This recipe is safe for those with wheat/gluten allergies but contains eggs and milk.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80',
  },
];

// Helper functions
export function getMockRecipes(): FoodRecipe[] {
  return mockRecipes;
}

export function getMockRecipeById(id: string): FoodRecipe | null {
  return mockRecipes.find(recipe => recipe.id === id) || null;
}

export function getMockMealPlans(userId: string): MealPlan[] {
  // In a real app, we would filter by user ID
  return mockMealPlans;
} 