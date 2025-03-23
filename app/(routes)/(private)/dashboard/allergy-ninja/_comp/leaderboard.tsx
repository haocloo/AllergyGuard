'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { getLeaderboard } from './actions';
import type { LeaderboardEntry } from './types';

export function Leaderboard() {
  const { childProfiles, gameResults } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data from the server
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Generate fallback from local data
        const localLeaderboard = generateLocalLeaderboard();
        setLeaderboard(localLeaderboard);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameResults]);

  // Generate leaderboard from local state as fallback
  const generateLocalLeaderboard = () => {
    // Map the game results to leaderboard entries
    const entries: LeaderboardEntry[] = gameResults.map((result) => {
      const profile = childProfiles.find((p) => p.id === result.childId);

      return {
        childId: result.childId,
        childName: profile?.name || 'Unknown Player',
        avatar: profile?.avatar || '',
        score: result.score,
        timestamp: result.timestamp,
      };
    });

    // Sort by score (highest first)
    return entries.sort((a, b) => b.score - a.score).slice(0, 10);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>

      {loading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No games have been played yet!</p>
          <p className="text-sm mt-2">Play a game to be the first on the leaderboard.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="pb-2 text-left">Rank</th>
                <th className="pb-2 text-left">Player</th>
                <th className="pb-2 text-right">Score</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                console.log('---------------------------');
                console.log(entry.avatar);
                return (
                  <tr
                    key={`${entry.childId}-${entry.timestamp}`}
                    className="border-b dark:border-slate-700"
                  >
                    <td className="py-3 font-medium">{index + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.childName}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white font-bold">
                            {entry.childName.substring(0, 1)}
                          </div>
                        )}
                        <span>{entry.childName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold">{entry.score}</td>
                    <td className="py-3 text-right text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
