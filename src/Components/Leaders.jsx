import { useState, useEffect } from 'react';
import axios from 'axios';

const Leaders = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('MLB');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-04-01`);
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-10-01`);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [gameType, setGameType] = useState('R');

  const hittingCategories = [
    { sortStat: 'homeRuns', displayName: 'Home Runs', valueKey: 'homeRuns', group: 'hitting', order: 'desc' },
    { sortStat: 'avg', displayName: 'Batting Average', valueKey: 'avg', group: 'hitting', order: 'desc' },
    { sortStat: 'rbi', displayName: 'Runs Batted In', valueKey: 'rbi', group: 'hitting', order: 'desc' },
    { sortStat: 'hits', displayName: 'Hits', valueKey: 'hits', group: 'hitting', order: 'desc' },
    { sortStat: 'doubles', displayName: 'Doubles', valueKey: 'doubles', group: 'hitting', order: 'desc' },
    { sortStat: 'triples', displayName: 'Triples', valueKey: 'triples', group: 'hitting', order: 'desc' },
    { sortStat: 'stolenBases', displayName: 'Stolen Bases', valueKey: 'stolenBases', group: 'hitting', order: 'desc' },
    { sortStat: 'obp', displayName: 'On-Base Percentage', valueKey: 'obp', group: 'hitting', order: 'desc' },
    { sortStat: 'slg', displayName: 'Slugging Percentage', valueKey: 'slg', group: 'hitting', order: 'desc' },
    { sortStat: 'ops', displayName: 'OPS', valueKey: 'ops', group: 'hitting', order: 'desc' },
  ];

  const pitchingCategories = [
    { sortStat: 'wins', displayName: 'Wins', valueKey: 'wins', group: 'pitching', order: 'desc' },
    { sortStat: 'era', displayName: 'ERA', valueKey: 'era', group: 'pitching', order: 'asc' },
    { sortStat: 'strikeOuts', displayName: 'Strikeouts', valueKey: 'strikeOuts', group: 'pitching', order: 'desc' },
    // { sortStat: 'saves', displayName: 'Saves', valueKey: 'saves', group: 'pitching', order: 'desc' },
    { sortStat: 'whip', displayName: 'WHIP', valueKey: 'whip', group: 'pitching', order: 'asc' },
    { sortStat: 'inningsPitched', displayName: 'Innings Pitched', valueKey: 'inningsPitched', group: 'pitching', order: 'desc' },
  ];

  const categories = [...hittingCategories, ...pitchingCategories];

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      let leagueParam = '';
      if (selectedLeague === 'AL') {
        leagueParam = '&leagueIds=103';
      } else if (selectedLeague === 'NL') {
        leagueParam = '&leagueIds=104';
      }

      let statsParam = 'season';
      let playerPoolParam = gameType === 'R' && !useDateRange ? 'qualified' : 'all';
      let dateParams = '';
      if (useDateRange) {
        statsParam = 'byDateRange';
        dateParams = `&startDate=${startDate}&endDate=${endDate}`;
      }

      const promises = categories.map(cat =>
        axios.get(`https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?env=prod&sportId=1&gameType=${gameType}&group=${cat.group}&sortStat=${cat.sortStat}&order=${cat.order}&season=${year}&limit=10&offset=0&stats=${statsParam}&playerPool=${playerPoolParam}${dateParams}${leagueParam}`)
      );

      const responses = await Promise.all(promises);
      const data = responses.map((response, index) => {
        const players = response.data.stats || [];
        const cat = categories[index];
        const leaders = players.map(player => ({
          name: player.playerFullName,
          team: player.teamAbbrev,
          value: player[cat.valueKey]
        }));
        return { ...cat, leaders };
      });

      setLeaders(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leaders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
    const interval = setInterval(fetchLeaders, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedLeague, year, useDateRange, startDate, endDate, gameType]);

  useEffect(() => {
    setStartDate(`${year}-04-01`);
    setEndDate(`${year}-10-01`);
    setTempStartDate(`${year}-04-01`);
    setTempEndDate(`${year}-10-01`);
  }, [year]);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [useDateRange, startDate, endDate]);

  const applyDateRange = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  if (loading) return <p className="text-center text-gray-600">Loading leaders...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!leaders || leaders.length === 0) return <p className="text-center text-gray-600">No leaders data available for this season.</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-center">
        <label htmlFor="yearFilter" className="mr-2 text-lg font-medium">Year:</label>
        <select
          id="yearFilter"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center justify-center">
        <label htmlFor="gameTypeFilter" className="mr-2 text-lg font-medium">Game Type:</label>
        <select
          id="gameTypeFilter"
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="R">Regular Season</option>
          <option value="P">Postseason</option>
        </select>
      </div>
      <div className="mb-4 flex items-center justify-center">
        <label htmlFor="leagueFilter" className="mr-2 text-lg font-medium">Filter by League:</label>
        <select
          id="leagueFilter"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="MLB">MLB Overall</option>
          <option value="AL">American League (AL)</option>
          <option value="NL">National League (NL)</option>
        </select>
      </div>
      <div className="mb-4 flex items-center justify-center">
        <label className="mr-2">Use Custom Date Range:</label>
        <input
          type="checkbox"
          checked={useDateRange}
          onChange={(e) => setUseDateRange(e.target.checked)}
        />
      </div>
      {useDateRange && (
        <div className="flex justify-center space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date:</label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={applyDateRange}
            className="p-2 bg-blue-500 text-white rounded mt-6"
          >
            Apply
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaders.map((cat, index) => (
          <div key={cat.sortStat} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-blue-100 py-2 px-4">
              <div className="text-lg font-bold text-blue-900">ckstats</div>
              <h2 className="text-xl font-semibold">{cat.displayName}</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <tbody>
                {cat.leaders.map((leader, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <img 
                        src={`https://a.espncdn.com/i/teamlogos/mlb/500/${leader.team.toLowerCase()}.png`} 
                        alt={`${leader.team} logo`} 
                        className="w-8 h-8 object-contain" 
                      />
                    </td>
                    <td className="px-6 py-4">{leader.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{leader.team || '-'}</td>
                    <td className="px-6 py-4">{leader.value || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-center text-xs text-gray-500 px-4 py-2">
              Data via MLB Stats API © MLBAM
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaders;
