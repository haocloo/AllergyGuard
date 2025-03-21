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
    symptoms: ['Throat swelling', 'Hypotension', 'Wheezing', 'Dizziness'],
    description: 'IgE-mediated systemic reaction requiring urgent positioning management',
    recommendedActions: [
      'Lay patient flat immediately - prevent standing/walking',
      'Administer epinephrine mid-outer thigh (0.15mg <25kg)',
      'Call ambulance - request stretcher transport',
      'Maintain supine position during transport',
      'If breathing difficulty: seated with legs horizontal',
    ],
    followUps: [
      'ASCIA Action Plan within 24hrs',
      'Positioning infographic for school/care',
      'Dual epinephrine injectors prescribed',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',
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
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',

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
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',

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
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',

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
    symptoms: ['Chest tightness', 'Tachycardia', 'Vomiting', 'Confusion'],
    description: 'Rapid-onset multi-system hypersensitivity reaction',
    recommendedActions: [
      'Position flat with legs elevated 30° if hypotensive',
      'Pregnant patients: left lateral recumbent position',
      'Infants: maintain horizontal hold - never upright',
      'Second epinephrine dose at 5min if unresolved',
      'Continuous pulse oximetry monitoring',
    ],
    followUps: [
      'Stretcher transport protocol education',
      'Recovery position training for caregivers',
      'Medical alert bracelet with positioning instructions',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',
  },

  // New childcare-specific additions
  {
    id: 104,
    name: 'Insect Sting Anaphylaxis (Hymenoptera Allergy)',
    symptoms: ['Localized swelling (>5cm)', 'Full-body hives', 'Stridor', 'Pallor'],
    description: 'Severe reaction to insect venom requiring immediate positioning',
    recommendedActions: [
      'Lay child flat with legs elevated on pillows',
      'Administer 0.15mg epinephrine auto-injector',
      'Remove stinger with horizontal scrape',
      'Apply ice pack wrapped in cloth',
      'Maintain pressure dressing on sting site',
    ],
    followUps: [
      'Monitor for rebound symptoms 6-8 hours post-treatment',
      'Daily playground inspection for insect nests',
      'Update childcare allergy log with reaction details',
      'Implement "Bee Buddy" buddy system protocol',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',
  },
  {
    id: 105,
    name: 'Contact Dermatitis (Plant Allergy)',
    symptoms: ['Linear blisters/rashes', 'Eye swelling if rubbed', 'Restlessness from itching'],
    description: 'Skin inflammation from contact with allergenic plants',
    recommendedActions: [
      'Wash with Zanfel® soap using downward strokes',
      'Apply calamine lotion with cotton applicators',
      'Dress in loose cotton clothing',
      'Cool compress (15min on/15min off cycle)',
      'Trim fingernails to prevent scratching',
    ],
    followUps: [
      'Daily rash mapping using body chart stickers',
      'Monitor art supplies for plant derivatives',
      'Check napkin changes for cross-contamination',
      'Implement "Leaf Lookout" garden safety program',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',
  },
  {
    id: 106,
    name: 'Pollen-Induced Asthma Attack',
    symptoms: ['Silent chest (no wheezing)', 'Nostril flaring', 'Rib retractions', 'Cyanosis'],
    description: 'Respiratory crisis triggered by pollen exposure',
    recommendedActions: [
      'Sitting position with forward-lean support',
      '6 puffs salbutamol via spacer+mask',
      'Cool mist humidifier at 1m distance',
      'Remove pollen-contaminated clothing',
      'Oxygen therapy if saturation <92%',
    ],
    followUps: [
      'Peak flow diary using smiley-face charts',
      'Hydration tracking with color-coded cups',
      'Sleep quality assessment through nap logs',
      'Implement "Air Quality Action Days" schedule',
    ],
    recommendedActionImage: '/graphics/diagnosis/anaphylaxis-positioning.png',
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
