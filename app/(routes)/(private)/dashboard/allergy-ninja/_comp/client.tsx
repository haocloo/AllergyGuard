'use client';

import { useEffect, useState } from 'react';
import { GameComponent } from './game-component';
import { ProfileSelector } from './profile-selector';
import { Leaderboard } from './leaderboard';
import { Badges } from './badges';
import { useGameStore } from './store';
import { ChildProfile, Allergy } from './types';

interface Props {
  initialChildProfiles: ChildProfile[];
  initialAllergies: Allergy[];
}

export function GameClient({ initialChildProfiles, initialAllergies }: Props) {
  const { setChildProfiles, setAllergies } = useGameStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState(false);

  // Initialize profiles and allergies
  useEffect(() => {
    setChildProfiles(initialChildProfiles);
    setAllergies(initialAllergies);
  }, [initialChildProfiles, initialAllergies, setChildProfiles, setAllergies]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Allergy Ninja Game</h1>
          <p className="text-sm text-muted-foreground">
            Slice safe foods, avoid your allergens, and become an Allergy Ninja Master!
          </p>
        </div>
      </div>

      {/* Game Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Selection and Game Controls */}
        <div className="lg:col-span-1 space-y-4">
          <ProfileSelector
            onSelectProfile={(childId) => {
              setSelectedChildId(childId);
              setGameActive(false);
            }}
          />
          {selectedChildId && !gameActive && (
            <div className="flex justify-center">
              <button
                onClick={() => setGameActive(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Game
              </button>
            </div>
          )}
          {selectedChildId && <Badges childId={selectedChildId} />}
        </div>

        {/* Center Column - Game or Instructions */}
        <div className="lg:col-span-2 place-items-center">
          {selectedChildId && gameActive ? (
            <div className="w-[640px] h-[480px] scale-[83%] relative overflow-hidden ">
              <iframe
                src="/fruit-ninja/index.html"
                className="overflow-hidden absolute w-[1280px] h-[1200px] -top-[325px] -left-[325px]"
                title="Fruit Ninja Game"
                loading="lazy"
                scrolling="no"
                sandbox="allow-scripts allow-same-origin"
                // <GameComponent
                //   childId={selectedChildId}
                //   onGameEnd={() => setGameActive(false)}
                // />
              />
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 h-96 flex flex-col justify-center items-center text-center">
              <h2 className="text-lg font-semibold mb-4">How to Play</h2>
              <ul className="list-disc list-inside text-left space-y-2">
                <li>Select a child profile to personalize the game</li>
                <li>Foods will scroll across the screen</li>
                <li>Swipe (or tap) to slice foods that are safe to eat</li>
                <li>Avoid slicing foods containing allergens</li>
                <li>Earn points for correctly slicing safe foods</li>
                <li>Lose points for slicing allergen foods</li>
                <li>Earn badges and climb the leaderboard!</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      <Leaderboard />
    </div>
  );
}
