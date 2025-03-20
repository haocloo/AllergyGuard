'use client'; // need this to solve the barrel optimization error
// This file is for Data only

// ui
import { User as UserIcon, Utensils, Camera, Book, ChefHat, User, AlertCircle, List } from 'lucide-react';

// services
import type { T_navItem } from '@/services/types';

export const navList: T_navItem[] = [
  {
    label: 'Dashboard',
    children: [
      {
        title: 'Profile Management',
        icon: User,
        items: [
          {
            title: 'Profile',
            url: '/dashboard/profile-management',
            role: ['admin', 'caretaker', 'parent'],
            icon: User,
          },
        ],
      },
      {
        title: 'Meal Planning',
        icon: Utensils,
        items: [
          {
            title: 'Food List',
            url: '/dashboard/meal-planning',
            role: ['admin', 'caretaker', 'parent'],
            icon: List,
          },
          {
            title: 'Ingredient Scanner',
            url: '/dashboard/meal-planning/scanner',
            role: ['admin', 'caretaker', 'parent'],
            icon: Camera,
          },
          {
            title: 'Meal Plans',
            url: '/dashboard/meal-planning/plans',
            role: ['admin', 'caretaker', 'parent'],
            icon: Book,
          },
          {
            title: 'Recipe Suggestions',
            url: '/dashboard/meal-planning/recipes',
            role: ['admin', 'caretaker', 'parent'],
            icon: ChefHat,
          },
        ],
      },
      {
        title: 'Emergency Support',
        icon: AlertCircle,
        items: [
          {
            title: 'Panic Mode',
            url: '/dashboard/panic-mode',
            role: ['admin', 'caretaker', 'parent'],
            icon: AlertCircle,
          },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------
//              FACILITY
// -------------------------------------------------------------

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
export const DEFAULT_TIME_SLOTS = [{ start: '09:00', end: '17:00' }];

export const condoOptions = [
  { value: 'condo-1', label: 'Palm Heights Residences' },
  { value: 'condo-2', label: 'Skyline Towers' },
  { value: 'condo-3', label: 'Riverside Gardens' },
  { value: 'condo-4', label: 'Marina Bay Condos' },
];

// -------------------------------------------------------------
//              JOBS
// -------------------------------------------------------------

export const COUNTRIES = [
  {
    value: 'MY',
    label: 'Malaysia',
  },
  {
    value: 'SG',
    label: 'Singapore',
  },
  {
    value: 'ID',
    label: 'Indonesia',
  },
  {
    value: 'TH',
    label: 'Thailand',
  },
  {
    value: 'VN',
    label: 'Vietnam',
  },
  {
    value: 'PH',
    label: 'Philippines',
  },
] as const;

export const MALAYSIA_CITIES = {
  Johor: [
    'Johor Bahru',
    'Pasir Gudang',
    'Iskandar Puteri',
    'Batu Pahat',
    'Muar',
    'Kluang',
    'Segamat',
  ],
  Kedah: ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi'],
  Kelantan: ['Kota Bharu', 'Pasir Mas', 'Tanah Merah'],
  Melaka: ['Melaka City', 'Alor Gajah', 'Jasin'],
  'Negeri Sembilan': ['Seremban', 'Port Dickson', 'Nilai'],
  Pahang: ['Kuantan', 'Temerloh', 'Bentong'],
  Perak: ['Ipoh', 'Taiping', 'Teluk Intan', 'Sitiawan'],
  Perlis: ['Kangar', 'Arau'],
  'Pulau Pinang': ['George Town', 'Butterworth', 'Bukit Mertajam', 'Seberang Perai'],
  Sabah: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu'],
  Sarawak: ['Kuching', 'Miri', 'Sibu', 'Bintulu'],
  Selangor: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang', 'Ampang Jaya', 'Kajang'],
  Terengganu: ['Kuala Terengganu', 'Kemaman', 'Dungun'],
  'Kuala Lumpur': ['Kuala Lumpur'],
  Labuan: ['Victoria'],
  Putrajaya: ['Putrajaya'],
} as const;
