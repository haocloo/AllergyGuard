
// ----------------------------------------------
// Firestore Structure (Non-RAG Data)
// ----------------------------------------------

import { v4 as uuidv4 } from 'uuid';

// Get current user id from env variable (or fallback for development)
// In production, use lucia_get_user() to obtain the user id.
const currentUserId = process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981';

// ----- Classrooms Collection -----
// Each classroom document stores a unique access code, list of children.
const classrooms = [
  {
    id: uuidv4(),
    accessCode: 'ABC123',
    name: 'Sunshine Class',
    children: ['child_001', 'child_002'],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    accessCode: 'DEF456',
    name: 'Rainbow Class',
    children: ['child_003'],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    accessCode: 'GHI789',
    name: 'Star Class',
    children: ['child_004'],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  }
];

// ----- Children Collection -----
// Each child document holds profile info, allergies, and a reference to the classroom.
const children = [
  {
    id: 'child_001', // Can be generated with uuidv4() if needed.
    name: 'Alice',
    dob: '2015-06-20',
    allergies: [
      { allergen: 'Peanuts', severity: 'High', notes: 'Carries epinephrine auto-injector' },
      { allergen: 'Dairy', severity: 'Medium', notes: 'Mild reactions' }
    ],
    parentId: currentUserId,
    classroomId: classrooms[0].id,
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: 'child_002',
    name: 'Bob',
    dob: '2016-08-15',
    allergies: [{ allergen: 'Eggs', severity: 'Low', notes: 'Mild rash sometimes' }],
    parentId: currentUserId,
    classroomId: classrooms[0].id,
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: 'child_003',
    name: 'Charlie',
    dob: '2014-03-10',
    allergies: [{ allergen: 'Shellfish', severity: 'High', notes: 'Severe reaction' }],
    parentId: currentUserId,
    classroomId: classrooms[1].id,
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  }
];

// ----- Meal Plans Collection -----
// This collection stores three types of records: 
// 1. "foodItem": Photo of food item ingredients and allergen check.
// 2. "foodPlan": Weekly meal plan prompt and daily menus.
// 3. "event": Event planning with a prompt and ingredient list.
// Each record has a history array to track changes.
const mealPlans = [
  // Scenario 1: Food Item - Photo scan of food item ingredients.
  {
    id: uuidv4(),
    scenario: 'foodItem',
    imageUrl: 'https://example.com/fooditem1.jpg',
    ingredients: ['Gluten-Free Pasta', 'Tomato Sauce', 'Basil'],
    allergensFound: ['Gluten'],
    suggestions: ['Use gluten-free pasta'],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  // Scenario 2: Food Plan - Weekly meal plan for allergy-safe meals.
  {
    id: uuidv4(),
    scenario: 'foodPlan',
    prompt: 'Plan a weekly menu for allergy-safe meals',
    dailyPlans: {
      Monday: ['Meal A', 'Meal B'],
      Tuesday: ['Meal C', 'Meal D'],
      Wednesday: ['Meal E', 'Meal F']
    },
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  // Scenario 3: Event - Event planning for a birthday party with safe ingredients.
  {
    id: uuidv4(),
    scenario: 'event',
    eventPrompt: 'Host a birthday party for 15 children with safe snacks',
    ingredients: ['Carrot sticks', 'Fruit salad', 'Gluten-free cake mix'],
    suggestions: ['Prepare gluten-free cake and fruit-based snacks'],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  }
];

// ----- Emergency Contacts Collection -----
// Stores nearby hospital contacts for emergencies, tailored for Penang, Malaysia.
const emergencyContacts = [
  {
    id: uuidv4(),
    hospitals: [
      { name: 'Penang General Hospital', phone: '+604-1234567', address: 'Jalan Bukit Jambul, Penang' },
      { name: 'Island Hospital', phone: '+604-7654321', address: 'Jalan Sultan Azlan Shah, Penang' }
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    hospitals: [
      { name: 'Queensbay Hospital', phone: '+604-2345678', address: 'Jalan Batu Maung, Penang' },
      { name: 'Gleneagles Hospital', phone: '+604-8765432', address: 'Jalan Utama, Penang' }
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    hospitals: [
      { name: 'Island Medical Centre', phone: '+604-3456789', address: 'Jalan Tengah, Penang' },
      { name: 'Penang Medical Centre', phone: '+604-9876543', address: 'Jalan Kebun, Penang' }
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  }
];

// ----------------------------------------------
// Supabase (Authentication & RAG Data)
// ----------------------------------------------

// The Supabase users table is used only for authentication (no modifications needed here).
/*
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().$type<(typeof roleEnum)[number]>(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).$onUpdate(() => new Date()),
});
*/

// The medical_data table for the RAG model remains as shown below.
const medical_data = [
  {
    id: 1,
    disease_name: 'Peanut Allergy',
    symptoms: ['hives', 'swelling', 'difficulty breathing'],
    actions: [
      'Sit the person down',
      'Administer epinephrine auto-injector',
      'Call emergency services'
    ],
    created_at: '2025-03-16T09:00:00Z'
  },
  {
    id: 2,
    disease_name: 'Dairy Allergy',
    symptoms: ['stomach cramps', 'vomiting', 'diarrhea'],
    actions: ['Keep the person calm', 'Offer water', 'Monitor symptoms closely'],
    created_at: '2025-03-16T09:05:00Z'
  },
  {
    id: 3,
    disease_name: 'Egg Allergy',
    symptoms: ['skin rash', 'swelling of lips', 'mild breathing issues'],
    actions: [
      'Sit the person down',
      'Apply a cold compress',
      'Prepare to administer allergy medication'
    ],
    created_at: '2025-03-16T09:10:00Z'
  }
];

// ----------------------------------------------
// Usage Notes:
// - When creating a new document, generate a new UUID via uuidv4().
// - The current user id is obtained from process.env.NEXT_PUBLIC_user_id.
// - Each collection document is stored as an object in an array.
// - Each document includes a history field to track updates, tying the changes to the user and related document IDs.
// - Data is tailored for Malaysia, specifically Penang.
// - In production, replace the fallback currentUserId with the result of lucia_get_user().
  
export {
  classrooms,
  children,
  mealPlans,
  emergencyContacts,
  medical_data,
};