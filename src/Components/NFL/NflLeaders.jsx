// Basic NflLeaders.jsx - Displays top 10 leaders in all categories for 2025 regular season NFL overall
// Place this in ./components/NFL/NflLeaders.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const NflLeaders = () => {
  const [allLeaders, setAllLeaders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { sortStat: 'passingYards', displayName: 'Passing Yards', statId: '3', group: 'passing' },
    { sortStat: 'passingTouchdowns', displayName: 'Passing Touchdowns', statId: '4', group: 'passing' },
    { sortStat: 'rushingYards', displayName: 'Rushing Yards', statId: '24', group: 'rushing' },
    { sortStat: 'rushingTouchdowns', displayName: 'Rushing Touchdowns', statId: '25', group: 'rushing' },
    { sortStat: 'receivingYards', displayName: 'Receiving Yards', statId: '42', group: 'receiving' },
    { sortStat: 'receivingTouchdowns', displayName: 'Receiving Touchdowns', statId: '43', group: 'receiving' },
    { sortStat: 'receptions', displayName: 'Receptions', statId: '53', group: 'receiving' },
  ];

  const teamMap = {
    '1': 'ATL', '2': 'BUF', '3': 'CHI', '4': 'CIN', '5': 'CLE', '6': 'DAL', '7': 'DEN', '8': 'DET',
    '9': 'GB', '10': 'TEN', '11': 'IND', '12': 'KC', '13': 'LV', '14': 'LAR', '15': 'MIA', '16': 'MIN',
    '17': 'NE', '18': 'NO', '19': 'NYG', '20': 'NYJ', '21': 'PHI', '22': 'ARI', '23': 'PIT', '24': 'LAC',
    '25': 'SF', '26': 'SEA', '27': 'TB', '28': 'WAS', '29': 'CAR', '30': 'JAX', '33': 'BAL', '34': 'HOU'
  };

  const fetchLeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = '2025';
      const statEntryId = '00' + year;
      const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/players?view=kona_player_info`;
      const headers = {
        'X-Fantasy-Filter': JSON.stringify({"players":{"limit":2000, "filterActive":{"value":true}}})
      };
      const response = await axios.get(url, {headers});
      let players = (response.data || []).map(p => {
        const seasonStats = p.stats?.find(s => s.id === statEntryId) || {};
        return {
          ...p,
          stats: seasonStats.stats || {}
        };
      });

      // Filter out team aggregate entries like 'TQB'
      players = players.filter(p => p.fullName && !p.fullName.endsWith(' TQB'));

      const newAllLeaders = {};
      categories.forEach(cat => {
        const sorted = [...players].filter(player => parseFloat(player.stats[cat.statId] || 0) > 0)
          .sort((a, b) => (parseFloat(b.stats[cat.statId] || 0) - parseFloat(a.stats[cat.statId] || 0)));
        const topLeaders = sorted.slice(0, 10);
        newAllLeaders[cat.sortStat] = topLeaders.map(player => ({
          name: player.fullName,
          team: teamMap[player.proTeamId] || '-',
          value: player.stats[cat.statId] || '0',
          playerId: player.id
        }));
      });
      setAllLeaders(newAllLeaders);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leaders: ' + err.message);
      setLoading(false);
      console.error('Failed to fetch leaders', err);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const renderTable = (cat, leaders) => {
    return (
      <div key={cat.sortStat} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-blue-100 py-2 px-4">
              <div className="text-lg font-bold text-blue-900">NFL Stats</div>
              <h2 className="text-xl font-semibold">{cat.displayName}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead>
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">Rank</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6"></th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">Player</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">Team</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">{cat.displayName}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-4 whitespace-nowrap md:px-6">{idx + 1}</td>
                      <td className="px-2 py-4 md:px-6">
                        <img 
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${leader.team.toLowerCase()}.png`} 
                          alt={`${leader.team} logo`} 
                          className="w-6 h-6 object-contain md:w-8 md:h-8" 
                        />
                      </td>
                      <td className="px-2 py-4 md:px-6">
                        {leader.name || 'Unknown'}
                      </td>
                      <td className="px-2 py-4 md:px-6">{leader.team || '-'}</td>
                      <td className="px-2 py-4 md:px-6">{leader.value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500 px-4 py-2">
              Data via ESPN API
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div>
      {loading ? (
        <p className="text-center text-gray-600">Loading leaders...</p>
      ) : Object.keys(allLeaders).length === 0 ? (
        <p className="text-center text-gray-600">No leaders data available.</p>
      ) : (
        <div className="max-w-2xl mx-auto">
          {categories.map((cat) => {
            const leaders = allLeaders[cat.sortStat] || [];
            if (leaders.length === 0) return null;
            return renderTable(cat, leaders);
          })}
        </div>
      )}
    </div>
  );
};

export default NflLeaders;
