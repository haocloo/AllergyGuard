// ----------------------------------------------
// Firestore Structure (Non-RAG Data)
// ----------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { generateClassroomCode } from '@/app/(routes)/(private)/dashboard/classroom-management/_comp/utils';
import type {
  AllergenAlert,
  Classroom,
  Child,
  Teacher,
} from '@/app/(routes)/(private)/dashboard/classroom-management/_comp/types';

// Get current user id from env variable (or fallback for development)
// In production, use lucia_get_user() to obtain the user id.
const currentUserId = process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981';

// Remove local interface definitions and use imported types

// Mock data
export const classrooms: Classroom[] = [
  {
    id: '1',
    code: 'CLS-2024-001',
    name: 'Sunshine Room',
    centerName: 'Sunshine Childcare Center',
    address: '123 Sunshine Road, #01-234',
    teacher: {
      id: 't1',
      name: 'Sarah Johnson',
      photoUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
      role: 'Head Teacher',
      phone: '012-345-6789',
      email: 'sarah.j@sunshine.edu.my',
    },
    children: [
      {
        id: 'c1',
        name: 'Alice Brown',
        photoUrl:
          'https://images.unsplash.com/photo-1548537412-08ab4940b3c3?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Peanuts', 'Eggs'],
      },
      {
        id: 'c2',
        name: 'Bob Wilson',
        photoUrl:
          'https://images.unsplash.com/photo-1588033173760-4663b66d39c9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Milk'],
      },
      {
        id: 'c3',
        name: 'Charlie Davis',
        photoUrl:
          'https://images.unsplash.com/photo-1587616211892-f743fcca64f9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Shellfish', 'Peanuts'],
      },
      {
        id: 'c4',
        name: 'Diana Evans',
        photoUrl:
          'https://images.unsplash.com/photo-1588033173760-4663b66d39c9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Soy'],
      },
      {
        id: 'c5',
        name: 'Ethan Foster',
        photoUrl:
          'https://images.unsplash.com/photo-1587616211892-f743fcca64f9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Eggs', 'Milk'],
      },
    ],
    allergenAlerts: [
      { name: 'Peanuts', count: 2, children: ['c1', 'c3'] },
      { name: 'Eggs', count: 2, children: ['c1', 'c5'] },
      { name: 'Milk', count: 2, children: ['c2', 'c5'] },
      { name: 'Shellfish', count: 1, children: ['c3'] },
      { name: 'Soy', count: 1, children: ['c4'] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'CLS-2024-002',
    name: 'Rainbow Class',
    centerName: 'Rainbow Kids Academy',
    address: '456 Rainbow Road, #02-345',
    teacher: {
      id: 't2',
      name: 'Michael Brown',
      photoUrl:
        'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?q=80&w=200&h=200&auto=format&fit=crop',
      role: 'Senior Teacher',
      phone: '012-345-6790',
      email: 'michael.b@rainbow.edu',
    },
    children: [
      {
        id: 'c6',
        name: 'Fiona Grant',
        photoUrl:
          'https://images.unsplash.com/photo-1516942126524-75630bce5870?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Wheat'],
      },
      {
        id: 'c7',
        name: 'George Harris',
        photoUrl:
          'https://images.unsplash.com/photo-1517940310602-26535839fe84?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Fish', 'Shellfish'],
      },
      {
        id: 'c8',
        name: 'Hannah Irving',
        photoUrl:
          'https://images.unsplash.com/photo-1516942126524-75630bce5870?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: [],
      },
    ],
    allergenAlerts: [
      { name: 'Wheat', count: 1, children: ['c6'] },
      { name: 'Fish', count: 1, children: ['c7'] },
      { name: 'Shellfish', count: 1, children: ['c7'] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: 'CLS-2024-003',
    name: 'Star Explorers',
    centerName: 'Star Kids Academy',
    address: '789 Star Avenue, #03-456',
    teacher: {
      id: 't3',
      name: 'Emily Davis',
      photoUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop',
      role: 'Lead Teacher',
      phone: '012-345-6791',
    },
    children: [
      {
        id: 'c9',
        name: 'Ian Jackson',
        photoUrl:
          'https://images.unsplash.com/photo-1588033173760-4663b66d39c9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Nuts'],
      },
      {
        id: 'c10',
        name: 'Julia Kim',
        photoUrl:
          'https://images.unsplash.com/photo-1548537412-08ab4940b3c3?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Dairy'],
      },
    ],
    allergenAlerts: [
      { name: 'Nuts', count: 1, children: ['c9'] },
      { name: 'Dairy', count: 1, children: ['c10'] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    code: 'CLS-2024-004',
    name: 'Little Leaders',
    centerName: 'Leaders Learning Center',
    address: '101 Leaders Lane, #04-567',
    teacher: {
      id: 't4',
      name: 'David Wilson',
      photoUrl:
        'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=200&h=200&auto=format&fit=crop',
      role: 'Assistant Teacher',
      phone: '012-345-6792',
    },
    children: [
      {
        id: 'c11',
        name: 'Kevin Lee',
        photoUrl:
          'https://images.unsplash.com/photo-1587616211892-f743fcca64f9?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Gluten'],
      },
      {
        id: 'c12',
        name: 'Lucy Martinez',
        photoUrl:
          'https://images.unsplash.com/photo-1548537412-08ab4940b3c3?q=80&w=200&h=200&auto=format&fit=crop',
        allergies: ['Seafood'],
      },
    ],
    allergenAlerts: [
      { name: 'Gluten', count: 1, children: ['c11'] },
      { name: 'Seafood', count: 1, children: ['c12'] },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ----- Children Collection -----
// Each child document holds profile info, allergies, and a reference to the classroom.
export interface Caretaker {
  id: string;
  type: 'personal' | 'center';
  name: string;
  email: string;
  role: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface RawAllergy {
  allergen: string;
  severity: 'Low' | 'Medium' | 'High';
  notes?: string;
  symptoms?: { name: string }[];
  actionPlan?: {
    immediateAction?: string;
    medications?: { name: string; dosage: string }[];
  };
  isCustomAllergen?: boolean;
}

export interface RawChild {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dob: string;
  gender?: string;
  photoUrl?: string;
  parentId: string;
  classroomId: string;
  createdAt: string;
  createdBy: string;
  allergies: RawAllergy[];
  symptoms?: { name: string; severity: string }[];
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    isMainContact: boolean;
  }[];
  caretakers?: Caretaker[];
}

export const children = [
  {
    id: 'child_001',
    firstName: 'Alice',
    lastName: 'Smith',
    name: 'Alice Smith',
    dob: '2015-06-20',
    gender: 'female',
    photoUrl: '',
    allergies: [
      {
        allergen: 'Peanuts',
        notes: 'Severe allergy - carries EpiPen',
        symptoms: [{ name: 'Difficulty Breathing' }, { name: 'Swelling' }, { name: 'Hives' }],
        actionPlan: {
          immediateAction: 'Use EpiPen immediately if exposed to peanuts. Call emergency services.',
          medications: [
            { name: 'EpiPen Jr', dosage: '0.15mg' },
            { name: 'Benadryl', dosage: '12.5mg/5ml' },
          ],
        },
      },
      {
        allergen: 'Dairy',
        notes: 'Moderate lactose intolerance',
        symptoms: [{ name: 'Stomach Pain' }, { name: 'Nausea' }],
        actionPlan: {
          immediateAction: 'Remove from exposure, provide lactase enzyme supplement if available',
          medications: [{ name: 'Lactaid', dosage: '1 tablet before meals' }],
        },
      },
    ],
    symptoms: [
      { name: 'Difficulty Breathing', severity: 'Severe' },
      { name: 'Swelling', severity: 'Severe' },
      { name: 'Hives', severity: 'Moderate' },
      { name: 'Stomach Pain', severity: 'Moderate' },
      { name: 'Nausea', severity: 'Mild' },
    ],
    emergencyContacts: [
      {
        name: 'John Smith',
        relationship: 'Father',
        phone: '0123456789',
        email: 'john.smith@example.com',
        isMainContact: true,
      },
      {
        name: 'Mary Smith',
        relationship: 'Mother',
        phone: '0123456788',
        email: 'mary.smith@example.com',
        isMainContact: false,
      },
      {
        name: 'Sarah Johnson',
        relationship: 'Aunt',
        phone: '0123456787',
        email: 'sarah.j@example.com',
        isMainContact: false,
      },
    ],
    parentId: currentUserId,
    classroomId: classrooms[0].id,
    createdAt: new Date().toISOString(),
    createdBy: currentUserId,
  },
  {
    id: 'child_002',
    firstName: 'Bob',
    lastName: 'Johnson',
    name: 'Bob Johnson',
    dob: '2016-08-15',
    gender: 'male',
    photoUrl: '',
    allergies: [
      {
        allergen: 'Eggs',
        notes: 'Mild rash sometimes',
        symptoms: [{ name: 'Rash' }, { name: 'Itching' }],
        actionPlan: {
          immediateAction: 'Apply antihistamine cream and monitor',
          medications: [{ name: 'Benadryl Cream', dosage: 'Apply thin layer' }],
        },
      },
    ],
    symptoms: [
      { name: 'Rash', severity: 'Mild' },
      { name: 'Itching', severity: 'Mild' },
    ],
    emergencyContacts: [
      {
        name: 'Sarah Johnson',
        relationship: 'Mother',
        phone: '0123456787',
        email: 'sarah.johnson@example.com',
        isMainContact: true,
      },
    ],
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

// Update the dummy users with more personal caretakers
export const users = [
  {
    id: 'user_001',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'caretaker',
    phone: '91234567',
  },
  {
    id: 'user_002',
    name: 'James Thompson',
    email: 'james.t@example.com',
    role: 'caretaker',
    phone: '92345678',
  },
  {
    id: 'user_003',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'caretaker',
    phone: '93456789',
  },
  {
    id: 'user_004',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'caretaker',
    phone: '94567890',
  },
  {
    id: 'user_005',
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    role: 'caretaker',
    phone: '95678901',
  },
  {
    id: 'user_006',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    role: 'caretaker',
    phone: '96789012',
  },
  {
    id: 'user_007',
    name: 'Lisa Wong',
    email: 'lisa.w@example.com',
    role: 'caretaker',
    phone: '97890123',
  },
];

// Update the caretakers data to include the role field
export const caretakers = [
  {
    id: 'caretaker_1',
    type: 'personal',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'Nanny',
    phone: '91234567',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'caretaker_2',
    type: 'center',
    name: 'Little Stars Daycare',
    email: 'contact@littlestars.com',
    role: 'Daycare Center',
    phone: '97890123',
    createdAt: '2024-01-20T10:30:00Z',
  },
] as const;

// ----------------------------------------------
// Usage Notes:
// - When creating a new document, generate a new UUID via uuidv4().
// - The current user id is obtained from process.env.NEXT_PUBLIC_user_id.
// - Each collection document is stored as an object in an array.
// - Each document includes a history field to track updates, tying the changes to the user and related document IDs.
// - Data is tailored for Malaysia, specifically Penang.
// - In production, replace the fallback currentUserId with the result of lucia_get_user().

// Export the imported types for use elsewhere
export type { AllergenAlert, Classroom, Child, Teacher };
