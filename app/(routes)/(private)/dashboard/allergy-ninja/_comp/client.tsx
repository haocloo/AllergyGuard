'use client';

import { useEffect, useState } from 'react';
import { Badges } from './badges';
import { useGameStore } from './store';
import { ChildProfile, Allergy } from './types';
import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  initialChildProfiles: ChildProfile[];
  initialAllergies: Allergy[];
}

export function GameClient({ initialChildProfiles, initialAllergies }: Props) {
  const { setChildProfiles, setAllergies, childProfiles } = useGameStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [activeTab, setActiveTab] = useState('howtoplay');

  // Initialize profiles and allergies
  useEffect(() => {
    setChildProfiles(initialChildProfiles);
    setAllergies(initialAllergies);
  }, [initialChildProfiles, initialAllergies, setChildProfiles, setAllergies]);

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-4  mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-start items-center">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-primary">Allergy Ninja Game</h1>
          <p className="text-sm text-muted-foreground">
            Slice safe foods, avoid your allergens, and become an Allergy Ninja Master!
          </p>
        </div>
      </div>

      {/* Game Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Selection and Game Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-md p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-orange-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              Choose Your Ninja
            </h3>

            {/* Ninja Selection Cards */}
            <div className="space-y-3">
              {childProfiles.map((profile) => {
                // Updated: Map allergies correctly using allergies from profile directly
                // instead of trying to match by ID which doesn't work with our new structure
                const profileAllergies = profile.allergies || [];

                return (
                  <div
                    key={profile.id}
                    className={`rounded-lg overflow-hidden transition-all duration-200 cursor-pointer border-2
                      ${
                        selectedChildId === profile.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-400'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 bg-white dark:bg-slate-800'
                      }`}
                    onClick={() => setSelectedChildId(profile.id)}
                  >
                    <div className="px-3 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="size-12 rounded-full mr-3 shadow-sm">
                          <img
                            src={profile.avatar}
                            alt={`${profile.name}'s avatar`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="h-full w-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-xs font-bold shadow-inner">${profile.name.charAt(
                                  0
                                )}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {profile.name}
                          </h4>

                          {/* Allergies badges below name */}
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {profileAllergies.length > 0 ? (
                              profileAllergies.map((allergyName, index) => (
                                <Badge
                                  key={`${profile.id}-${index}`}
                                  variant="darkRed"
                                  className="flex flex-row items-center gap-1 py-1 px-2"
                                >
                                  <TriangleAlert
                                    strokeWidth={2}
                                    className="size-3  "
                                  ></TriangleAlert>
                                  <span className="text-xs font-medium h-fit leading-none">
                                    {allergyName}
                                  </span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800 shadow-sm flex items-center">
                                <svg
                                  className="w-2 h-2 mr-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                                None
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`rounded-full w-3 h-3 ${
                          selectedChildId === profile.id
                            ? 'bg-orange-500'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Game Status */}
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                {!selectedChildId
                  ? 'Select your ninja to train your allergy awareness!'
                  : gameActive
                  ? 'Slice the safe foods & avoid your allergies!'
                  : 'Click Start Playing to begin your training!'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Column - Game or Ninja Character */}
        <div className="lg:col-span-2 flex justify-center items-center">
          <div className="w-[640px] h-[480px] scale-100 relative overflow-hidden rounded-lg shadow-lg border-4 border-orange-100 dark:border-orange-900/30">
            {/* No profile selected overlay */}
            {!selectedChildId && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center mb-4 text-xl font-bold shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">Choose Your Ninja!</h2>
                <p className="text-gray-200 mb-2">Select a profile to start playing</p>
              </div>
            )}

            {/* Game inactive overlay */}
            {selectedChildId && !gameActive && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center">
                {/* Avatar Image */}
                <div className="h-16 w-16 rounded-full border-3 border-orange-300 dark:border-orange-700 overflow-hidden mb-3 shadow-lg">
                  {(() => {
                    const selectedProfile = childProfiles.find((p) => p.id === selectedChildId);
                    return selectedProfile ? (
                      <img
                        src={selectedProfile.avatar}
                        alt={`${selectedProfile.name}'s avatar`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="h-full w-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-xl font-bold">${selectedProfile.name.charAt(
                              0
                            )}</div>`;
                          }
                        }}
                      />
                    ) : null;
                  })()}
                </div>

                <h2 className="text-xl font-bold mb-2 text-white">
                  {childProfiles.find((p) => p.id === selectedChildId)?.name} is Ready!
                </h2>
                <p className="text-gray-200 mb-4">Your ninja is trained to avoid:</p>

                <div className="flex flex-wrap gap-2 justify-center mb-4 max-w-sm">
                  {(childProfiles.find((p) => p.id === selectedChildId)?.allergies || []).length >
                  0 ? (
                    (childProfiles.find((p) => p.id === selectedChildId)?.allergies || []).map(
                      (allergyName, index) => (
                        <Badge
                          key={index}
                          variant="darkRed"
                          className="flex flex-row items-center gap-1 py-1 px-2"
                        >
                          <TriangleAlert strokeWidth={2} className="size-3 "></TriangleAlert>
                          <span className="text-xs font-medium h-fit leading-none">
                            {allergyName}
                          </span>
                        </Badge>
                        // <span
                        //   key={`${selectedChildId}-${index}`}
                        //   className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 rounded-full text-xs font-medium flex items-center"
                        // >
                        //   <svg
                        //     className="w-3 h-3 mr-1"
                        //     fill="currentColor"
                        //     viewBox="0 0 20 20"
                        //     xmlns="http://www.w3.org/2000/svg"
                        //   >
                        //     <path
                        //       fillRule="evenodd"
                        //       d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        //       clipRule="evenodd"
                        //     ></path>
                        //   </svg>
                        //   {allergyName}
                        // </span>
                      )
                    )
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 rounded-full text-xs font-medium flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      No Allergies
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setGameActive(true)}
                  className="px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all duration-200 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:-translate-y-1 hover:shadow-lg flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Playing
                </button>
              </div>
            )}

            <iframe
              src="/fruit-ninja/index.html"
              className="overflow-hidden absolute w-[1280px] h-[1200px] -top-[325px] -left-[325px]"
              title="Fruit Ninja Game"
              loading="lazy"
              scrolling="yes"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
          <ul className="flex w-full text-sm font-medium text-center">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('howtoplay')}
                className={`inline-block w-full p-4 ${
                  activeTab === 'howtoplay'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-gray-300'
                }`}
              >
                How to Play
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`inline-block w-full p-4 ${
                  activeTab === 'leaderboard'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-gray-300'
                }`}
              >
                Leaderboard
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('badges')}
                className={`inline-block w-full p-4 ${
                  activeTab === 'badges'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-gray-300'
                }`}
              >
                Badges
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'howtoplay' && (
            <div className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-sm p-6 border border-amber-100 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-6 text-orange-800 dark:text-orange-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How to Play Allergy Ninja
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Welcome to Allergy Ninja! This fun and educational game helps children learn about
                food allergies while having fun. The goal is simple: slice safe foods and avoid
                those containing your allergens.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Choose Your Ninja
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Select a ninja profile to personalize your game experience with their
                        specific allergies. Each ninja has different allergies to avoid.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Start the Game
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Click the "Start Playing" button to begin your training as an Allergy Ninja.
                        The game will launch with your profile's allergies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Slice Safe Foods
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Swipe or tap to slice foods that are safe for your ninja to eat. Each
                        successful slice adds to your score.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Avoid Allergen Foods
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Be careful not to slice foods containing your ninja's allergens. These are
                        your weaknesses and will reduce your score if sliced.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Earn Points
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Gain points for correctly slicing safe foods. Lose points for slicing
                        allergens. Try to get a high score to climb the leaderboard!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5 text-orange-600 dark:text-orange-300 font-bold">
                      6
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Collect Badges
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Earn achievement badges as you improve your skills. Badges are awarded for
                        reaching score milestones and slicing safe foods.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="leading-relaxed">
                    Pro Tip: The more you play, the better you'll get at recognizing foods to avoid!
                    Regular practice helps build allergy awareness.
                  </span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-sm p-6 border border-blue-100 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Allergy Ninja Champions
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Our top players have mastered the art of avoiding allergens while collecting points.
                Can you make it to the top of the leaderboard?
              </p>

              {/* Top 3 Players Podium */}
              <div className="flex justify-center items-end mb-8 mt-4 space-x-4 md:space-x-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-12 w-12 bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center mb-2 text-white font-bold text-xl shadow-md">
                    2
                  </div>
                  <div className="h-32 w-24 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-lg flex items-center justify-center flex-col shadow-md">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 mb-1 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
                      T
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Tahlia</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">1,750</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-14 w-14 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center mb-2 text-white font-bold text-2xl shadow-md">
                    1
                  </div>
                  <div className="h-40 w-28 bg-gradient-to-b from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-900/60 rounded-t-lg flex items-center justify-center flex-col shadow-md relative">
                    <div className="absolute -top-5">
                      <svg
                        className="h-10 w-10 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1l2.928 5.924 6.542.952-4.735 4.619 1.12 6.52L10 15.924l-5.855 3.091 1.12-6.52L.53 7.876l6.542-.952L10 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-900 mb-1 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
                      A
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Amira</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">2,340</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full h-10 w-10 bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center mb-2 text-white font-bold text-lg shadow-md">
                    3
                  </div>
                  <div className="h-28 w-24 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-900/50 rounded-t-lg flex items-center justify-center flex-col shadow-md">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 mb-1 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
                      Z
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Zayn</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">1,520</p>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto mt-6">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Complete Rankings
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 px-3 text-left text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Rank
                      </th>
                      <th className="py-2 px-3 text-left text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Ninja
                      </th>
                      <th className="py-2 px-3 text-right text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Score
                      </th>
                      <th className="py-2 px-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Badges
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-3 font-semibold text-yellow-600 dark:text-yellow-400">
                        1
                      </td>
                      <td className="py-3 px-3 font-medium">Amira</td>
                      <td className="py-3 px-3 text-right font-semibold">2,340</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-5.png"
                          alt="Level 5"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-yellow-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                        <img
                          src="/images/badge/badge-4.png"
                          alt="Level 4"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-indigo-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                        <img
                          src="/images/badge/badge-3.png"
                          alt="Level 3"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-blue-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-3 font-semibold text-gray-500">2</td>
                      <td className="py-3 px-3 font-medium">Tahlia</td>
                      <td className="py-3 px-3 text-right font-semibold">1,750</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-4.png"
                          alt="Level 4"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-indigo-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                        <img
                          src="/images/badge/badge-3.png"
                          alt="Level 3"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-blue-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                    <tr className="bg-amber-50 dark:bg-amber-900/20 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">
                        3
                      </td>
                      <td className="py-3 px-3 font-medium">Zayn</td>
                      <td className="py-3 px-3 text-right font-semibold">1,520</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-3.png"
                          alt="Level 3"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-blue-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                        <img
                          src="/images/badge/badge-2.png"
                          alt="Level 2"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-green-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-3 text-gray-500">4</td>
                      <td className="py-3 px-3 font-medium">Noah</td>
                      <td className="py-3 px-3 text-right font-semibold">1,240</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-2.png"
                          alt="Level 2"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-green-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-3 text-gray-500">5</td>
                      <td className="py-3 px-3 font-medium">Maria</td>
                      <td className="py-3 px-3 text-right font-semibold">980</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-2.png"
                          alt="Level 2"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-green-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-800">
                      <td className="py-3 px-3 text-gray-500">6</td>
                      <td className="py-3 px-3 font-medium">Liam</td>
                      <td className="py-3 px-3 text-right font-semibold">720</td>
                      <td className="py-3 px-3 flex justify-center space-x-1">
                        <img
                          src="/images/badge/badge-1.png"
                          alt="Level 1"
                          className="h-6 w-auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'h-6 w-6 rounded-full bg-orange-500 inline-block';
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Keep playing to improve your score and climb the leaderboard! New champions are
                  crowned weekly.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-sm p-6 border border-purple-100 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-purple-800 dark:text-purple-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Ninja Achievements
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Badges are awarded as you progress through the game. Each badge represents a
                milestone in your Allergy Ninja journey.
              </p>

              {selectedChildId ? (
                <div className="border border-purple-200 dark:border-purple-900/30 rounded-lg overflow-hidden">
                  <Badges childId={selectedChildId} />
                </div>
              ) : (
                <div className="text-center p-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
                    No Ninja Selected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Please select a ninja profile to view earned badges and achievements.
                  </p>
                </div>
              )}

              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Available Badges
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Collect all five badges to become a true Allergy Ninja Master! Each badge has
                  specific requirements to unlock.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="mx-auto mb-2">
                      <img
                        src="/images/badge/badge-1.png"
                        alt="Level 1 Badge"
                        className="h-20 w-auto mx-auto"
                        onError={(e) => {
                          // Replace with inline fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className =
                            'h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-sm font-medium text-gray-500 dark:text-gray-400';
                          fallback.innerText = 'Badge 1';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Level 1</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Novice Ninja</p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="mx-auto mb-2">
                      <img
                        src="/images/badge/badge-2.png"
                        alt="Level 2 Badge"
                        className="h-20 w-auto mx-auto"
                        onError={(e) => {
                          // Replace with inline fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className =
                            'h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-sm font-medium text-gray-500 dark:text-gray-400';
                          fallback.innerText = 'Badge 2';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Level 2</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Apprentice Ninja</p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="mx-auto mb-2">
                      <img
                        src="/images/badge/badge-3.png"
                        alt="Level 3 Badge"
                        className="h-20 w-auto mx-auto"
                        onError={(e) => {
                          // Replace with inline fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className =
                            'h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-sm font-medium text-gray-500 dark:text-gray-400';
                          fallback.innerText = 'Badge 3';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Level 3</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Skilled Ninja</p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="mx-auto mb-2">
                      <img
                        src="/images/badge/badge-4.png"
                        alt="Level 4 Badge"
                        className="h-20 w-auto mx-auto"
                        onError={(e) => {
                          // Replace with inline fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className =
                            'h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-sm font-medium text-gray-500 dark:text-gray-400';
                          fallback.innerText = 'Badge 4';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Level 4</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expert Ninja</p>
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="mx-auto mb-2">
                      <img
                        src="/images/badge/badge-5.png"
                        alt="Level 5 Badge"
                        className="h-20 w-auto mx-auto"
                        onError={(e) => {
                          // Replace with inline fallback
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className =
                            'h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-sm font-medium text-gray-500 dark:text-gray-400';
                          fallback.innerText = 'Badge 5';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Level 5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Master Ninja</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
