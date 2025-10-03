import { useState, useEffect } from 'react';
import axios from 'axios';

const TeamComparison = () => {
  const [team1, setTeam1] = useState({ id: null, name: '', abbrev: '' });
  const [team2, setTeam2] = useState({ id: null, name: '', abbrev: '' });
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2025-10-01');
  const [stats1, setStats1] = useState({ hitting: {}, pitching: {} });
  const [stats2, setStats2] = useState({ hitting: {}, pitching: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hittingCategories = [
    { displayName: 'Home Runs', valueKey: 'homeRuns' },
    { displayName: 'Batting Average', valueKey: 'avg' },
    { displayName: 'Runs Batted In', valueKey: 'rbi' },
    { displayName: 'Hits', valueKey: 'hits' },
    { displayName: 'Doubles', valueKey: 'doubles' },
    { displayName: 'Triples', valueKey: 'triples' },
    { displayName: 'Stolen Bases', valueKey: 'stolenBases' },
    { displayName: 'On-Base Percentage', valueKey: 'obp' },
    { displayName: 'Slugging Percentage', valueKey: 'slg' },
    { displayName: 'OPS', valueKey: 'ops' },
  ];

  const pitchingCategories = [
    { displayName: 'Wins', valueKey: 'wins' },
    { displayName: 'ERA', valueKey: 'era' },
    { displayName: 'Strikeouts', valueKey: 'strikeOuts' },
    { displayName: 'WHIP', valueKey: 'whip' },
    { displayName: 'Innings Pitched', valueKey: 'inningsPitched' },
  ];

  const formatForApi = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
  };

  const formatForDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${m}/${d}/${y}`;
  };

  const fetchAllTeams = async (season) => {
    try {
      const response = await axios.get(
        `https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${season}`
      );
      const mlbTeams = response.data.teams.filter(
        (team) =>
          team.active &&
          team.sport.id === 1 &&
          (team.league.id === 103 || team.league.id === 104)
      );
      setAllTeams(mlbTeams);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  useEffect(() => {
    fetchAllTeams(year);
  }, [year]);

  useEffect(() => {
    if (search1.length >= 2) {
      const filtered = allTeams.filter(
        (team) =>
          team.name.toLowerCase().includes(search1.toLowerCase()) ||
          team.abbreviation.toLowerCase().includes(search1.toLowerCase())
      ).slice(0, 5);
      setSuggestions1(filtered);
    } else {
      setSuggestions1([]);
    }
  }, [search1, allTeams]);

  useEffect(() => {
    if (search2.length >= 2) {
      const filtered = allTeams.filter(
        (team) =>
          team.name.toLowerCase().includes(search2.toLowerCase()) ||
          team.abbreviation.toLowerCase().includes(search2.toLowerCase())
      ).slice(0, 5);
      setSuggestions2(filtered);
    } else {
      setSuggestions2([]);
    }
  }, [search2, allTeams]);

  const selectTeam1 = (team) => {
    setTeam1({
      id: team.id,
      name: team.name,
      abbrev: team.abbreviation,
    });
    setSearch1('');
    setSuggestions1([]);
  };

  const selectTeam2 = (team) => {
    setTeam2({
      id: team.id,
      name: team.name,
      abbrev: team.abbreviation,
    });
    setSearch2('');
    setSuggestions2([]);
  };

  const clearTeam1 = () => {
    setTeam1({ id: null, name: '', abbrev: '' });
    setStats1({ hitting: {}, pitching: {} });
    setSearch1('');
  };

  const clearTeam2 = () => {
    setTeam2({ id: null, name: '', abbrev: '' });
    setStats2({ hitting: {}, pitching: {} });
    setSearch2('');
  };

  const fetchTeamStats = async (teamId, setter) => {
    if (!teamId) return;
    setLoading(true);
    try {
      const apiStartDate = formatForApi(startDate);
      const apiEndDate = formatForApi(endDate);
      const baseUrl = `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=byDateRange&gameType=R&season=${year}&startDate=${apiStartDate}&endDate=${apiEndDate}`;
      const [hittingRes, pitchingRes] = await Promise.all([
        axios.get(`${baseUrl}&group=hitting`),
        axios.get(`${baseUrl}&group=pitching`),
      ]);
      const hittingData = hittingRes.data.stats?.[0]?.splits?.[0]?.stat || {};
      const pitchingData = pitchingRes.data.stats?.[0]?.splits?.[0]?.stat || {};
      setter({ hitting: hittingData, pitching: pitchingData });
      setError(null);
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('Failed to fetch team stats');
      setter({ hitting: {}, pitching: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamStats(team1.id, setStats1);
  }, [team1.id, year, startDate, endDate]);

  useEffect(() => {
    fetchTeamStats(team2.id, setStats2);
  }, [team2.id, year, startDate, endDate]);

  const getValue = (groupData, key) => {
    return groupData[key] ?? '-';
  };

  const displayPeriod = `${formatForDisplay(startDate)} to ${formatForDisplay(endDate)}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-blue-900">Team Comparison</div>
        <div className="flex space-x-4 text-sm">
          <span>Year: {year}</span>
          <span>Period: {displayPeriod}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team 1:</label>
          <input
            type="text"
            value={search1}
            onChange={(e) => setSearch1(e.target.value)}
            placeholder="Search for a team..."
            className="w-full p-2 border rounded mb-1"
          />
          {suggestions1.length > 0 && (
            <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded">
              {suggestions1.map((team) => (
                <li
                  key={team.id}
                  onClick={() => selectTeam1(team)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {team.name} ({team.abbreviation})
                </li>
              ))}
            </ul>
          )}
          {team1.name && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {team1.name} ({team1.abbrev})
              <button
                onClick={clearTeam1}
                className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
              >
                Clear
              </button>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Team 2:</label>
          <input
            type="text"
            value={search2}
            onChange={(e) => setSearch2(e.target.value)}
            placeholder="Search for a team..."
            className="w-full p-2 border rounded mb-1"
          />
          {suggestions2.length > 0 && (
            <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded">
              {suggestions2.map((team) => (
                <li
                  key={team.id}
                  onClick={() => selectTeam2(team)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {team.name} ({team.abbreviation})
                </li>
              ))}
            </ul>
          )}
          {team2.name && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {team2.name} ({team2.abbrev})
              <button
                onClick={clearTeam2}
                className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center space-x-4">
        <label className="whitespace-nowrap">Year: </label>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="p-1 border rounded">
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
        <label className="whitespace-nowrap">Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-1 border rounded"
        />
        <label className="whitespace-nowrap">End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-1 border rounded"
        />
      </div>

      {loading && <p className="text-center text-gray-600">Loading comparison...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {team1.id && team2.id ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center bg-blue-100 p-4 rounded">
              <h3 className="text-xl font-semibold">{team1.name}</h3>
              {team1.abbrev && (
                <img
                  src={`https://a.espncdn.com/i/teamlogos/mlb/500/${team1.abbrev.toLowerCase()}.png`}
                  alt={`${team1.abbrev} logo`}
                  className="w-12 h-12 mx-auto"
                />
              )}
            </div>
            <div className="text-center bg-green-100 p-4 rounded">
              <h3 className="text-xl font-semibold">{team2.name}</h3>
              {team2.abbrev && (
                <img
                  src={`https://a.espncdn.com/i/teamlogos/mlb/500/${team2.abbrev.toLowerCase()}.png`}
                  alt={`${team2.abbrev} logo`}
                  className="w-12 h-12 mx-auto"
                />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Hitting Stats</h2>
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {team1.abbrev}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {team2.abbrev}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hittingCategories.map((cat) => (
                  <tr key={cat.valueKey}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cat.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getValue(stats1.hitting, cat.valueKey)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getValue(stats2.hitting, cat.valueKey)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Pitching Stats</h2>
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {team1.abbrev}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {team2.abbrev}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pitchingCategories.map((cat) => (
                  <tr key={cat.valueKey}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cat.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getValue(stats1.pitching, cat.valueKey)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getValue(stats2.pitching, cat.valueKey)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-gray-500">
            Data via MLB Stats API © MLBAM
          </p>
        </>
      ) : (
        <p className="text-center text-gray-600">Select two teams to compare their stats.</p>
      )}
    </div>
  );
};

export default TeamComparison;
