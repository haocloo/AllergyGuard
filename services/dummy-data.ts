// ----------------------------------------------
// Firestore Structure (Non-RAG Data)
// ----------------------------------------------

import { v4 as uuidv4 } from 'uuid';

// Get current user id from env variable (or fallback for development)
// In production, use lucia_get_user() to obtain the user id.
const currentUserId = process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981';

// Add or update these interfaces
interface Teacher {
  id: string;
  name: string;
  photoUrl?: string;
  phone: string;
  email: string;
}

interface Classroom {
  id: string;
  code: string;
  name: string;
  centerName: string;
  address: string;
  teacher: Teacher;
}

// Update the classroom data
const classrooms: Classroom[] = [
  {
    id: 'cls-001',
    code: 'CC001-K1A',
    name: 'Kindergarten 1A',
    centerName: 'Sunshine Childcare Center',
    address: '123 Sunshine Road, #01-234, Singapore 123456',
    teacher: {
      id: 'tchr-001',
      name: 'Ms. Sarah Lee',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      phone: '91234567',
      email: 'sarah.lee@sunshine.edu.sg',
    },
  },
  {
    id: 'cls-002',
    code: 'CC002-N2B',
    name: 'Nursery 2B',
    centerName: 'Little Stars Preschool',
    address: '456 Star Avenue, #02-345, Singapore 234567',
    teacher: {
      id: 'tchr-002',
      name: 'Ms. Emily Wong',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      phone: '92345678',
      email: 'emily.wong@littlestars.edu.sg',
    },
  },
  {
    id: 'cls-003',
    code: 'CC003-K2C',
    name: 'Kindergarten 2C',
    centerName: 'Rainbow Kids Academy',
    address: '789 Rainbow Road, #03-456, Singapore 345678',
    teacher: {
      id: 'tchr-003',
      name: 'Mr. John Tan',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      phone: '93456789',
      email: 'john.tan@rainbowkids.edu.sg',
    },
  },
];

// ----- Children Collection -----
// Each child document holds profile info, allergies, and a reference to the classroom.
interface Caretaker {
  id: string;
  userId: string;
  type: 'personal' | 'center';
  name: string;
  email: string;
  phone: string;
  notes: string;
  noteToCaretaker?: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

const children = [
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
const emergencyContacts = [
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

// The medical_data table for the RAG model remains as shown below.
const medical_data = [
  {
    id: 1,
    disease_name: 'Peanut Allergy',
    symptoms: ['hives', 'swelling', 'difficulty breathing'],
    actions: [
      'Sit the person down',
      'Administer epinephrine auto-injector',
      'Call emergency services',
    ],
    created_at: '2025-03-16T09:00:00Z',
  },
  {
    id: 2,
    disease_name: 'Dairy Allergy',
    symptoms: ['stomach cramps', 'vomiting', 'diarrhea'],
    actions: ['Keep the person calm', 'Offer water', 'Monitor symptoms closely'],
    created_at: '2025-03-16T09:05:00Z',
  },
  {
    id: 3,
    disease_name: 'Egg Allergy',
    symptoms: ['skin rash', 'swelling of lips', 'mild breathing issues'],
    actions: [
      'Sit the person down',
      'Apply a cold compress',
      'Prepare to administer allergy medication',
    ],
    created_at: '2025-03-16T09:10:00Z',
  },
];

// PANIC MODE - SYMPTOM HISTORY
export const dummySymptomHistory = [
  {
    id: 'hist-1',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-12345',
      timestamp: '2023-06-15T14:30:00Z',
      symptoms:
        'My child has a persistent cough and runny nose, and low-grade fever for the last 2 days.',
      possibleCauses: [
        {
          condition: 'Common Cold',
          description:
            'Viral infection of the upper respiratory tract causing cough, nasal congestion, and low-grade fever.',
          urgencyLevel: 'low',
        },
        {
          condition: 'Influenza',
          description:
            'Viral infection that can cause more severe symptoms including higher fever, body aches, and fatigue.',
          urgencyLevel: 'medium',
        },
        {
          condition: 'COVID-19',
          description:
            'Coronavirus that can cause respiratory symptoms similar to colds and flu but with potential for more serious complications.',
          urgencyLevel: 'medium',
        },
      ],
      recommendedActions: [
        {
          action: 'Provide comfort measures',
          urgency: 'soon',
          instructions:
            'Ensure rest, adequate fluids, and age-appropriate fever reducers if needed. Use saline nasal drops and a cool-mist humidifier to ease congestion.',
        },
        {
          action: 'Monitor symptoms',
          urgency: 'soon',
          instructions:
            'Watch for worsening symptoms such as difficulty breathing, high fever (>102°F/39°C), or lethargy.',
        },
        {
          action: 'Consider medical evaluation',
          urgency: 'when convenient',
          instructions:
            'If symptoms persist beyond 3-5 days, worsen significantly, or if the child has underlying conditions, contact your healthcare provider.',
        },
      ],
      allergyRelated: false,
      additionalNotes:
        'Keep child home from school to prevent spread of infection. Most upper respiratory infections resolve on their own within 7-10 days.',
      sourceReferences: [
        'CDC guidelines for pediatric respiratory infections',
        'American Academy of Pediatrics recommendations',
      ],
      createdAt: '2023-06-15T14:30:00Z',
    },
  },
  {
    id: 'hist-2',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-67890',
      timestamp: '2023-07-02T09:15:00Z',
      symptoms:
        'My child ate peanut butter and now has hives and swollen lips. No breathing problems.',
      possibleCauses: [
        {
          condition: 'Mild to Moderate Allergic Reaction',
          description:
            'An immune system response to peanuts resulting in skin symptoms (hives) and mild swelling.',
          urgencyLevel: 'medium',
        },
      ],
      recommendedActions: [
        {
          action: 'Administer antihistamine',
          urgency: 'immediate',
          instructions:
            'Give an age-appropriate dose of diphenhydramine (Benadryl) or similar antihistamine immediately.',
        },
        {
          action: 'Monitor for severe symptoms',
          urgency: 'immediate',
          instructions:
            'Watch closely for signs of breathing difficulty, severe swelling, vomiting, dizziness, or loss of consciousness for the next 1-2 hours.',
        },
        {
          action: 'Seek medical attention',
          urgency: 'soon',
          instructions:
            'Even for a mild reaction, consult with a healthcare provider, especially if this is the first allergic reaction.',
        },
      ],
      allergyRelated: true,
      additionalNotes:
        'This appears to be a peanut allergy reaction. Future exposure to peanuts should be avoided. Consider allergy testing and discussion with a pediatric allergist.',
      sourceReferences: [
        'Food Allergy Research & Education (FARE) guidelines',
        'American Academy of Allergy, Asthma & Immunology protocols',
      ],
      createdAt: '2023-07-02T09:15:00Z',
    },
  },
  {
    id: 'hist-3',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-24680',
      timestamp: '2023-09-10T18:45:00Z',
      symptoms:
        'Child fell at playground, has swelling and bruising on wrist, crying when trying to move it.',
      possibleCauses: [
        {
          condition: 'Wrist Sprain',
          description: 'Stretching or tearing of ligaments in the wrist joint.',
          urgencyLevel: 'medium',
        },
        {
          condition: 'Wrist Fracture',
          description:
            'Broken bone in the wrist area, common in falls when children catch themselves with outstretched hands.',
          urgencyLevel: 'high',
        },
      ],
      recommendedActions: [
        {
          action: 'Apply RICE protocol',
          urgency: 'immediate',
          instructions:
            'Rest the wrist, apply Ice (20 minutes on, 20 minutes off), Compress gently with an elastic bandage, and Elevate the wrist above heart level.',
        },
        {
          action: 'Pain management',
          urgency: 'soon',
          instructions:
            "Provide age-appropriate pain reliever such as children's acetaminophen or ibuprofen according to package directions.",
        },
        {
          action: 'Seek medical evaluation',
          urgency: 'soon',
          instructions:
            'Visit urgent care or emergency department for assessment and possible X-ray, especially if the child refuses to use the wrist or if there is significant swelling or deformity.',
        },
      ],
      allergyRelated: false,
      additionalNotes:
        'Difficulty determining between sprain and fracture without imaging. When in doubt, have the injury evaluated by a healthcare professional.',
      sourceReferences: [
        'American Academy of Pediatrics injury guidelines',
        'Pediatric Orthopedic Society recommendations',
      ],
      createdAt: '2023-09-10T18:45:00Z',
    },
  },
];

// Add dummy users for search feature
const users = [
  {
    id: 'user_001',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'caretaker',
    phone: '0123456789',
  },
  {
    id: 'user_002',
    name: 'James Thompson',
    email: 'james.t@example.com',
    role: 'caretaker',
    phone: '0123456790',
  },
  {
    id: 'user_003',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'caretaker',
    phone: '0123456791',
  },
  {
    id: 'user_004',
    name: 'Sunshine Daycare Center',
    email: 'contact@sunshine-daycare.com',
    role: 'center',
    phone: '0123456792',
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

// Single export statement for all data
export { classrooms, children, mealPlans, emergencyContacts, medical_data, users };
