// New NflLeaders.jsx (placeholder/skeleton for NFL leaders; customize with your API fetch logic)
// Place this in ./components/NflLeaders.jsx
import { useState, useEffect } from 'react';

const NflLeaders = () => {
  const [leaders, setLeaders] = useState({ passing: [], rushing: [], receiving: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Replace with actual API calls, e.g., fetch('https://api.sportsdata.io/v3/nfl/stats/json/PassingLeaders/2025REG')
    Promise.all([
      fetchNFLPassingLeaders(),
      fetchNFLRushingLeaders(),
      fetchNFLReceivingLeaders()
    ]).then(([passing, rushing, receiving]) => {
      setLeaders({ passing, rushing, receiving });
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching NFL leaders:', error);
      setLoading(false);
    });
  }, []);

  const fetchNFLPassingLeads = async () => {
    // Placeholder; return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        { player: 'Patrick Mahomes', team: 'KC', yards: 1500, tds: 12 },
        // Add more
      ]), 1000);
    });
  };

  const fetchNFLRushingLeaders = async () => {
    // Placeholder; return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        { player: 'Christian McCaffrey', team: 'SF', yards: 800, tds: 6 },
        // Add more
      ]), 1000);
    });
  };

  const fetchNFLReceivingLeaders = async () => {
    // Placeholder; return mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        { player: 'Tyreek Hill', team: 'MIA', yards: 900, tds: 7 },
        // Add more
      ]), 1000);
    });
  };

  if (loading) return <div className="text-center py-8">Loading NFL leaders...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Passing Leaders</h3>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-left">Yards</th>
              <th className="px-4 py-2 text-left">TDs</th>
            </tr>
          </thead>
          <tbody>
            {leaders.passing.map((player, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{player.player}</td>
                <td className="px-4 py-2">{player.team}</td>
                <td className="px-4 py-2">{player.yards}</td>
                <td className="px-4 py-2">{player.tds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Similar tables for Rushing and Receiving */}
      <div>
        <h3 className="text-xl font-bold mb-2">Rushing Leaders</h3>
        {/* Repeat table structure with leaders.rushing */}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Receiving Leaders</h3>
        {/* Repeat table structure with leaders.receiving */}
      </div>
    </div>
  );
};

export default NflLeaders;
