// ----------------------------------------------
// Firestore Structure (Non-RAG Data)
// ----------------------------------------------

import { v4 as uuidv4 } from 'uuid';

// Get current user id from env variable (or fallback for development)
// In production, use lucia_get_user() to obtain the user id.
const currentUserId = process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981';

// ----- Classrooms Collection -----
// Each classroom document stores a unique access code, list of children.
export const classrooms = [
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
  },
];

// ----- Children Collection -----
// Each child document holds profile info, allergies, and a reference to the classroom.
export const children = [
  {
    id: 'child_001', // Can be generated with uuidv4() if needed.
    name: 'Alice',
    dob: '2015-06-20',
    allergies: [
      { allergen: 'Peanuts', severity: 'High', notes: 'Carries epinephrine auto-injector' },
      { allergen: 'Dairy', severity: 'Medium', notes: 'Mild reactions' },
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
  },
];

// ----- Meal Plans Collection -----
// This collection stores three types of records:
// 1. "foodItem": Photo of food item ingredients and allergen check.
// 2. "foodPlan": Weekly meal plan prompt and daily menus.
// 3. "event": Event planning with a prompt and ingredient list.
// Each record has a history array to track changes.
export const mealPlans = [
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
      Wednesday: ['Meal E', 'Meal F'],
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
  },
];

// ----- Emergency Contacts Collection -----
// Stores nearby hospital contacts for emergencies, tailored for Penang, Malaysia.
export const emergencyContacts = [
  {
    id: uuidv4(),
    hospitals: [
      {
        name: 'Penang General Hospital',
        phone: '+604-1234567',
        address: 'Jalan Bukit Jambul, Penang',
      },
      {
        name: 'Island Hospital',
        phone: '+604-7654321',
        address: 'Jalan Sultan Azlan Shah, Penang',
      },
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    hospitals: [
      { name: 'Queensbay Hospital', phone: '+604-2345678', address: 'Jalan Batu Maung, Penang' },
      { name: 'Gleneagles Hospital', phone: '+604-8765432', address: 'Jalan Utama, Penang' },
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    hospitals: [
      { name: 'Island Medical Centre', phone: '+604-3456789', address: 'Jalan Tengah, Penang' },
      { name: 'Penang Medical Centre', phone: '+604-9876543', address: 'Jalan Kebun, Penang' },
    ],
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
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

export type TDiagnosis = {
  id: number;
  name: string;
  symptoms: string[];
  description: string;
  recommendedActions: string[];
  followUps: string[];
  recommendedActionImage?: string;
  createdAt?: string;
};

export const pediatricAllergies: TDiagnosis[] = [
  {
    id: 1,
    name: 'Peanut Allergy (Severe Anaphylactic)',
    symptoms: ['Hives', 'Facial swelling', 'Difficulty breathing', 'Wheezing'],
    description: 'Severe immune response to peanut proteins causing anaphylaxis',
    recommendedActions: [
      'Administer epinephrine immediately',
      'Position child in recovery position',
      'Call emergency services',
      'Monitor vital signs continuously',
    ],
    followUps: [
      'Allergy testing: Schedule with pediatric allergist within 1 week',
      'Prescription renewal: Obtain backup epinephrine auto-injectors',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-protocol.png',
    createdAt: '2025-03-16T09:00:00Z',
},
  {
    id: 2,
    name: 'Dairy Protein Intolerance',
    symptoms: ['Colic', 'Blood in stool', 'Chronic diarrhea', 'Failure to thrive'],
    description: "Immune reaction to cow's milk proteins causing gastrointestinal distress",
    recommendedActions: [
      'Immediately stop dairy consumption',
      'Administer hypoallergenic formula',
      'Monitor for dehydration signs',
      'Consult pediatric gastroenterologist',
    ],
    followUps: [
      'Elimination diet: Maintain strict dairy-free diet for 4 weeks',
      'Nutrition consult: Schedule within 3 business days',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-protocol.png',
    createdAt: '2025-03-16T09:05:00Z',
  },
  {
    id: 3,
    name: 'Egg Allergy',
    symptoms: ['Oral itching', 'Vomiting', 'Skin redness', 'Runny nose'],
    description: 'IgE-mediated hypersensitivity to egg albumen proteins',
    recommendedActions: [
      'Administer antihistamines',
      'Use bronchodilator if wheezing',
      'Prepare epinephrine if respiratory symptoms develop',
    ],
    followUps: ['Vaccine screening: Check influenza/yellow fever vaccine components'],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-protocol.png',
    createdAt: '2025-03-16T09:10:00Z',
  },
  {
    id: 4,
    name: 'Insect Sting Hypersensitivity',
    symptoms: ['Local swelling >10cm', 'Dizziness', 'Tachycardia', 'Urticaria'],
    description: 'Systemic allergic reaction to hymenoptera venom',
    recommendedActions: [
      'Remove stinger if present',
      'Apply topical corticosteroids',
      'Administer intramuscular epinephrine',
    ],
    followUps: ['Venom immunotherapy: Refer to allergy clinic for evaluation'],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-protocol.png',
    createdAt: '2025-03-16T09:15:00Z',
  },
  {
    id: 5,
    name: 'Atopic Dermatitis (Eczema)',
    symptoms: ['Dry skin', 'Itching', 'Red patches', 'Skin cracking'],
    description: 'Chronic inflammatory skin condition with defective skin barrier function',
    recommendedActions: [
      'Apply wet dressings with tubular bandages',
      'Use prescribed topical steroids',
      'Moisturize every 2-3 hours',
      'Seek urgent care if infected (yellow crusting)',
    ],
    followUps: [
      'Weekly bleach baths (150ml plain bleach in 10L water)',
      'Use fragrance-free moisturizers (500g/week for children)',
      'Avoid common triggers: wool, overheating',
      'Follow 3-month review with dermatologist',
    ],
    // recommendedActionImage not provided
  },
  {
    id: 6,
    name: 'Allergic Rhinitis (Hay Fever)',
    symptoms: ['Sneezing', 'Runny nose', 'Nasal congestion', 'Itchy eyes'],
    description: 'IgE-mediated inflammation of nasal airways from environmental allergens',
    recommendedActions: [
      'Administer intranasal corticosteroids',
      'Use antihistamine eye drops',
      'Perform nasal saline rinses',
      'Seek care if asthma symptoms develop',
    ],
    followUps: [
      'Proper nasal spray technique: 45° angle away from septum',
      'Allergen immunotherapy evaluation',
      'Environmental control measures',
      'Annual pulmonary function tests',
    ],
  },
  {
    id: 7,
    name: 'Food-Induced Anaphylaxis',
    symptoms: ['Throat tightness', 'Wheezing', 'Tachycardia', 'Dizziness'],
    description: 'Severe systemic reaction to food allergens requiring immediate intervention',
    recommendedActions: [
      'Lay patient flat (or seated if breathing difficulty)',
      'Administer adrenaline autoinjector (0.15mg <20kg, 0.3mg ≥20kg)',
      'Call emergency services immediately',
      'Prepare second dose if no improvement in 5 minutes',
    ],
    followUps: [
      'Allergist referral within 1 week',
      'Prescribe 2x adrenaline autoinjectors',
      'Food challenge testing (6 weeks post-reaction)',
      'Implement food allergy action plan',
    ],
  },
  {
    id: 8,
    name: 'Insect Venom Allergy',
    symptoms: ['Local swelling >10cm', 'Generalized urticaria', 'Nausea', 'Chest tightness'],
    description: 'Hypersensitivity reaction to hymenoptera venom (bees, wasps, ants)',
    recommendedActions: [
      'Remove stinger by scraping (never squeeze)',
      'Apply venom extractor if available',
      'Administer intramuscular adrenaline',
      'Monitor for delayed phase reaction (6-8 hours)',
    ],
    followUps: [
      'Venom immunotherapy initiation',
      'Carry medical alert bracelet',
      'Avoid perfumes/scents outdoors',
      'Annual IgE level monitoring',
    ],
  },
  {
    id: 9,
    name: 'Drug Hypersensitivity',
    symptoms: ['Morbilliform rash', 'Facial swelling', 'Fever', 'Joint pain'],
    description: 'Adverse immune response to medication components',
    recommendedActions: [
      'Immediate cessation of suspect drug',
      'Administer systemic corticosteroids',
      'Monitor for DRESS syndrome signs',
      'Document reaction in medical records',
    ],
    followUps: [
      'Skin patch testing (6-8 weeks post-reaction)',
      'Alternative medication list creation',
      'Report to TGA Adverse Event Monitoring',
      'Desensitization protocol evaluation',
    ],
  },
  // Common Diseases Data (from medical_data)
  {
    id: 101,
    name: 'Peanut Allergy',
    symptoms: ['hives', 'swelling', 'difficulty breathing'],
    description: 'Common allergic reaction to peanuts.',
    recommendedActions: [
      'Sit the person down',
      'Administer epinephrine auto-injector',
      'Call emergency services',
    ],
    followUps: [],
    createdAt: '2025-03-16T09:00:00Z',
  },
  {
    id: 102,
    name: 'Dairy Allergy',
    symptoms: ['stomach cramps', 'vomiting', 'diarrhea'],
    description: 'Common allergic reaction to dairy.',
    recommendedActions: ['Keep the person calm', 'Offer water', 'Monitor symptoms closely'],
    followUps: [],
    createdAt: '2025-03-16T09:05:00Z',
  },
  {
    id: 103,
    name: 'Egg Allergy',
    symptoms: ['skin rash', 'swelling of lips', 'mild breathing issues'],
    description: 'Common allergic reaction to eggs.',
    recommendedActions: [
      'Sit the person down',
      'Apply a cold compress',
      'Prepare to administer allergy medication',
    ],
    followUps: [],
    createdAt: '2025-03-16T09:10:00Z',
  },
];

// ----------------------------------------------
// Usage Notes:
// - When creating a new document, generate a new UUID via uuidv4().
// - The current user id is obtained from process.env.NEXT_PUBLIC_user_id.
// - Each collection document is stored as an object in an array.
// - Each document includes a history field to track updates, tying the changes to the user and related document IDs.
// - Data is tailored for Malaysia, specifically Penang.
// - In production, replace the fallback currentUserId with the result of lucia_get_user().
