'use client';

import { useEffect, useState } from 'react';
import { useGameStore, initialBadges } from './store';
import { getChildBadges } from './actions';
import type { GameBadge } from './types';

interface BadgesProps {
  childId: string;
}

export function Badges({ childId }: BadgesProps) {
  const { badges, gameResults } = useGameStore();
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch badges from the server or use initial badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        // If badges are not yet loaded in store, initialize them
        if (badges.length === 0) {
          useGameStore.getState().setBadges(initialBadges);
        }
        
        // Get child-specific earned badges
        const childBadges = await getChildBadges(childId);
        setEarnedBadges(childBadges);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
        // Calculate locally as fallback
        const localEarnedBadges = calculateEarnedBadges();
        setEarnedBadges(localEarnedBadges);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [childId, badges.length, gameResults]);

  // Calculate earned badges based on game results (client-side fallback)
  const calculateEarnedBadges = () => {
    const childResults = gameResults.filter(result => result.childId === childId);
    const earnedBadgeIds: string[] = [];
    
    // Check each badge's requirements
    initialBadges.forEach(badge => {
      // Find highest score and total safe items sliced
      const highestScore = Math.max(...childResults.map(r => r.score), 0);
      const totalSafeItemsSliced = childResults.reduce((total, r) => total + r.safeItemsSliced, 0);
      
      // Check if requirements are met
      if (
        (badge.unlockRequirement.score && highestScore >= badge.unlockRequirement.score) ||
        (badge.unlockRequirement.safeItemsSliced && totalSafeItemsSliced >= badge.unlockRequirement.safeItemsSliced)
      ) {
        earnedBadgeIds.push(badge.id);
      }
    });
    
    return earnedBadgeIds;
  };

  // All available badges (from store or initial)
  const allBadges = badges.length > 0 ? badges : initialBadges;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Badges</h3>

      {loading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            
            return (
              <div 
                key={badge.id} 
                className={`
                  p-4 rounded-lg border-2 text-center
                  ${isEarned 
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-700/20 dark:border-gray-700 opacity-60'}
                `}
              >
                <div className="relative">
                  {badge.image ? (
                    <img 
                      src={badge.image}
                      alt={badge.name}
                      className="w-16 h-16 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                  )}
                  
                  {isEarned && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
                
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 