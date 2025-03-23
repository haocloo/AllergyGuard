'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema_select_profile } from './validation';
import { useGameStore } from './store';
import type { T_schema_select_profile, ChildProfile, Allergy } from './types';

interface ProfileSelectorProps {
  onSelectProfile: (childId: string) => void;
}

export function ProfileSelector({ onSelectProfile }: ProfileSelectorProps) {
  const { childProfiles, allergies, setChildProfiles, setAllergies } = useGameStore();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  
  // Create default profiles if none exist
  useEffect(() => {
    if (childProfiles.length === 0) {
      // Create default allergies if they don't exist
      if (allergies.length === 0) {
        const defaultAllergies: Allergy[] = [
          {
            id: 'dairy',
            name: 'Milk & Dairy',
            severity: 'severe',
            category: 'dairy'
          },
          {
            id: 'nuts',
            name: 'Nuts & Peanuts',
            severity: 'severe',
            category: 'nuts'
          },
          {
            id: 'seafood',
            name: 'Seafood',
            severity: 'severe',
            category: 'seafood'
          }
        ];
        setAllergies(defaultAllergies);
      }

      // Create 3 default child profiles with different allergies
      const defaultProfiles: ChildProfile[] = [
        {
          id: 'profile-milk',
          name: 'Amira',
          age: 8,
          allergies: ['dairy'],
          avatar: '/images/avatars/child-1.png',
          createdAt: new Date().toISOString()
        },
        {
          id: 'profile-nuts',
          name: 'Zack',
          age: 6,
          allergies: ['nuts'],
          avatar: '/images/avatars/child-2.png',
          createdAt: new Date().toISOString()
        },
        {
          id: 'profile-seafood',
          name: 'Lina',
          age: 7,
          allergies: ['seafood'],
          avatar: '/images/avatars/child-3.png',
          createdAt: new Date().toISOString()
        }
      ];
      setChildProfiles(defaultProfiles);
      // Auto-select the milk allergy profile
      setSelectedProfileId('profile-milk');
    } else if (selectedProfileId === '' && childProfiles.length > 0) {
      // If profiles exist but none selected, select the first one
      setSelectedProfileId(childProfiles[0].id);
    }
  }, [childProfiles, allergies, setChildProfiles, setAllergies, selectedProfileId]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<T_schema_select_profile>({
    resolver: zodResolver(schema_select_profile),
    defaultValues: {
      childId: selectedProfileId || '',
      difficulty: 'medium',
    },
  });

  // Update form value when selectedProfileId changes
  useEffect(() => {
    if (selectedProfileId) {
      setValue('childId', selectedProfileId);
    }
  }, [selectedProfileId, setValue]);

  // Initialize selectedProfileId when childProfiles are loaded
  useEffect(() => {
    if (childProfiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(childProfiles[0].id);
    }
  }, [childProfiles, selectedProfileId]);

  const onSubmit = (data: T_schema_select_profile) => {
    onSelectProfile(data.childId);
    setDifficulty(data.difficulty || 'medium');
  };

  // Helper function to get allergy names for display
  const getAllergyNames = (allergyIds: string[]) => {
    return allergyIds.map(id => {
      // First try to find an exact match in our allergies array
      const allergy = allergies.find(a => a.id.toLowerCase() === id.toLowerCase());
      
      // If not found by ID, try to match by name (since our data structure may have names as IDs)
      if (!allergy) {
        const allergyByName = allergies.find(a => 
          a.name.toLowerCase().includes(id.toLowerCase()) || 
          id.toLowerCase().includes(a.name.toLowerCase())
        );
        return allergyByName?.name || id;
      }
      
      return allergy.name;
    }).join(', ');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Select Profile</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Child Profile</label>
          <select
            {...register('childId')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          >
            <option value="">Select a profile</option>
            {childProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} ({profile.age} yrs) - {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'No allergies'}
              </option>
            ))}
          </select>
          {errors.childId && (
            <p className="text-red-500 text-xs mt-1">{errors.childId.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <label
                key={level}
                className={`
                  flex items-center justify-center p-2 border rounded-md cursor-pointer
                  ${difficulty === level
                    ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-600'
                    : 'bg-white border-gray-300 dark:bg-slate-700 dark:border-slate-600'}
                `}
              >
                <input
                  type="radio"
                  {...register('difficulty')}
                  value={level}
                  className="sr-only"
                  onChange={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Selected Profile Info */}
        {childProfiles.length > 0 && selectedProfileId && (
          <div className="mt-6 space-y-4">
            {childProfiles.map((profile) => {
              return profile.id === selectedProfileId ? (
                <div key={profile.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <div className="flex items-center mb-2">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.name} 
                        className="w-10 h-10 rounded-full mr-3" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                        {profile.name.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">{profile.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Age: {profile.age}</p>
                    </div>
                  </div>
                  
                  {profile.allergies.length > 0 ? (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Allergies:</h5>
                      <div className="flex flex-wrap gap-1">
                        {profile.allergies.map((allergyName) => (
                          <span 
                            key={allergyName} 
                            className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded-full"
                          >
                            {allergyName}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 italic text-amber-600 dark:text-amber-400">
                        {profile.allergies.some(a => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('milk')) ? 
                          "Avoid all dairy products including milk, cheese, yogurt, and ice cream!" : 
                          profile.allergies.some(a => a.toLowerCase().includes('nut') || a.toLowerCase().includes('peanut')) ? 
                          "Avoid all nuts, peanuts, and foods containing nut extracts!" : 
                          profile.allergies.some(a => a.toLowerCase().includes('seafood') || a.toLowerCase().includes('shellfish') || a.toLowerCase().includes('shrimp')) ?
                          "Avoid all seafood including fish, shrimp, and other shellfish!" :
                          `Avoid foods containing: ${profile.allergies.join(', ')}`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No allergies recorded</p>
                  )}
                </div>
              ) : null;
            })}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Select Profile & Start Game
        </button>
      </form>
    </div>
  );
} 