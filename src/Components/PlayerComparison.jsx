import { useState, useEffect } from 'react';
import axios from 'axios';
// import { teamColors, getGradient } from './mlbUtils';

// Constants
const teamColors = {
  AZ: { dark: '#A71930', light: '#E3D4AD' },
  ATL: { dark: '#13274F', light: '#CE1141' },
  BAL: { dark: '#000000', light: '#DF4601' },
  BOS: { dark: '#0C2340', light: '#BD3039' },
  CHC: { dark: '#0E3386', light: '#CC3433' },
  CWS: { dark: '#27251F', light: '#C4CED4' },
  CIN: { dark: '#000000', light: '#C6011F' },
  CLE: { dark: '#00385D', light: '#E50022' },
  COL: { dark: '#333366', light: '#C4CED4' },
  DET: { dark: '#0C2340', light: '#FA4616' },
  HOU: { dark: '#002D62', light: '#EB6E1F' },
  KC: { dark: '#004687', light: '#BD9B60' },
  LAA: { dark: '#003263', light: '#BA0021' },
  LAD: { dark: '#005A9C', light: '#A5ACAF' },
  MIA: { dark: '#EF3340', light: '#00A3E0' },
  MIL: { dark: '#12284B', light: '#FFC52F' },
  MIN: { dark: '#002B5C', light: '#D31145' },
  NYM: { dark: '#002D72', light: '#FF5910' },
  NYY: { dark: '#003087', light: '#C4CED3' },
  ATH: { dark: '#1d9a8bff', light: '#EFB21E' },
  PHI: { dark: '#002D72', light: '#E81828' },
  PIT: { dark: '#27251F', light: '#FDB827' },
  SD: { dark: '#2F241D', light: '#FFC425' },
  SF: { dark: '#27251F', light: '#FD5A1E' },
  SEA: { dark: '#0C2C56', light: '#005C5C' },
  STL: { dark: '#0C2340', light: '#C41E3A' },
  TB: { dark: '#092C5C', light: '#8FBCE6' },
  TEX: { dark: '#003278', light: '#C0111F' },
  TOR: { dark: '#1D2D5C', light: '#134A8E' },
  WSH: { dark: '#14225A', light: '#AB0003' },
};

const hittingCategories = [
  { displayName: 'Home Runs', valueKey: 'homeRuns', order: 'desc' },
  { displayName: 'Batting Average', valueKey: 'avg', order: 'desc' },
  { displayName: 'Runs Batted In', valueKey: 'rbi', order: 'desc' },
  { displayName: 'Hits', valueKey: 'hits', order: 'desc' },
  { displayName: 'Doubles', valueKey: 'doubles', order: 'desc' },
  { displayName: 'Triples', valueKey: 'triples', order: 'desc' },
  { displayName: 'Stolen Bases', valueKey: 'stolenBases', order: 'desc' },
  { displayName: 'On-Base Percentage', valueKey: 'obp', order: 'desc' },
  { displayName: 'Slugging Percentage', valueKey: 'slg', order: 'desc' },
  { displayName: 'OPS', valueKey: 'ops', order: 'desc' },
];

const pitchingCategories = [
  { displayName: 'Wins', valueKey: 'wins', order: 'desc' },
  { displayName: 'ERA', valueKey: 'era', order: 'asc' },
  { displayName: 'Strikeouts', valueKey: 'strikeOuts', order: 'desc' },
  { displayName: 'WHIP', valueKey: 'whip', order: 'asc' },
  { displayName: 'Innings Pitched', valueKey: 'inningsPitched', order: 'desc' },
];

// Utility Functions
const getGradient = (teamAbbr) => {
    console.log(teamAbbr)
  const abbr = teamAbbr.toUpperCase();
  const colors = teamColors[abbr];
  if (!colors) {
    return 'linear-gradient(to right, #6b7280, #9ca3af)';
  }
  return `linear-gradient(to right, ${colors.dark}, ${colors.light})`;
};

const parseStat = (value) => {
  if (value === '-' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const isLeading = (myNum, oppNum, order) => {
  if (myNum === null && oppNum === null) return false;
  if (myNum === null) return false;
  if (oppNum === null) return true;
  if (order === 'desc') {
    return myNum > oppNum;
  } else {
    return myNum < oppNum;
  }
};

const formatForApi = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
};

const formatForDisplay = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  return `${m}/${d}/${y}`;
};

// Sub-Component: PlayerSelector
const PlayerSelector = ({ label, search, setSearch, suggestions, selectPlayer, player, clearPlayer }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for a player..."
      className="w-full p-2 border rounded mb-1"
    />
    {suggestions.length > 0 && (
      <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded">
        {suggestions.slice(0, 5).map((person) => (
          <li
            key={person.id}
            onClick={() => selectPlayer(person)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            {person.fullName} ({person.primaryPosition?.abbreviation})
          </li>
        ))}
      </ul>
    )}
    {player.name && (
      <p className="mt-2 text-sm text-gray-600">
        Selected: {player.name} ({player.team})
        <button
          onClick={clearPlayer}
          className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
        >
          Clear
        </button>
      </p>
    )}
  </div>
);

// Sub-Component: PlayerHeader
const PlayerHeader = ({ player }) => (
  <div className="text-center bg-blue-100 p-4 rounded">
    <h3 className="text-xl font-semibold">{player.name}</h3>
    {player.team && (
      <img
        src={`https://a.espncdn.com/i/teamlogos/mlb/500/${player.team.toLowerCase()}.png`}
        alt={`${player.team} logo`}
        className="w-12 h-12 mx-auto"
      />
    )}
  </div>
);

// Sub-Component: StatsTable
const StatsTable = ({ categories, stats1, stats2, player1, player2 }) => {
  const getValue = (groupData, key) => groupData[key] ?? '-';

  return (
    <div>
      <table className="w-full table-fixed divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((cat) => {
            const val1 = getValue(stats1, cat.valueKey);
            const val2 = getValue(stats2, cat.valueKey);
            const num1 = parseStat(val1);
            const num2 = parseStat(val2);
            const leads1 = isLeading(num1, num2, cat.order);
            const leads2 = isLeading(num2, num1, cat.order);
            return (
              <tr key={cat.valueKey}>
                <td className="px-6 py-4 text-base font-medium text-gray-900 w-1/3 text-center text-[24px]">
                  {cat.displayName}
                </td>
                <td
                  className={`text-[32px] px-6 py-4 text-base w-1/3 text-center ${leads1 ? 'text-white' : 'text-gray-500'}`}
                  style={{ background: leads1 ? getGradient(player1.team) : 'transparent' }}
                >
                  {val1}
                </td>
                <td
                  className={`text-[32px] px-6 py-4 text-base w-1/3 text-center ${leads2 ? 'text-white' : 'text-gray-500'}`}
                  style={{ background: leads2 ? getGradient(player2.team) : 'transparent' }}
                >
                  {val2}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Main Component: PlayerComparison
const PlayerComparison = () => {
  const [player1, setPlayer1] = useState({ id: null, name: '', team: '' });
  const [player2, setPlayer2] = useState({ id: null, name: '', team: '' });
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState({});
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2025-10-01');
  const [stats1, setStats1] = useState({ hitting: {}, pitching: {} });
  const [stats2, setStats2] = useState({ hitting: {}, pitching: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllTeams = async () => {
    try {
      const response = await axios.get('https://statsapi.mlb.com/api/v1/teams?sportId=1');
      const teamsMap = response.data.teams.reduce((acc, team) => {
        acc[team.id] = team.abbreviation;
        return acc;
      }, {});
      setAllTeams(teamsMap);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const fetchPlayerTeam = async (playerId) => {
    try {
      const response = await axios.get(`https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam`);
      const person = response.data.people[0];
      const teamId = person.currentTeam?.id;
      if (teamId && allTeams[teamId]) {
        return allTeams[teamId];
      }
      return '';
    } catch (err) {
      console.error('Failed to fetch player team:', err);
      return '';
    }
  };

  const searchPlayers = async (term, season) => {
    if (term.length < 2) return [];
    try {
      const response = await axios.get(
        `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(term)}&season=${season}&hydrate=currentTeam`
      );
      return response.data.people || [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchAllTeams();
  }, []);

  useEffect(() => {
    let timer;
    if (search1.length >= 2) {
      timer = setTimeout(async () => {
        const suggestions = await searchPlayers(search1, year);
        setSuggestions1(suggestions);
      }, 300);
    } else {
      setSuggestions1([]);
    }
    return () => clearTimeout(timer);
  }, [search1, year]);

  useEffect(() => {
    let timer;
    if (search2.length >= 2) {
      timer = setTimeout(async () => {
        const suggestions = await searchPlayers(search2, year);
        setSuggestions2(suggestions);
      }, 300);
    } else {
      setSuggestions2([]);
    }
    return () => clearTimeout(timer);
  }, [search2, year]);

  const selectPlayer1 = (person) => {
    setPlayer1({
      id: person.id,
      name: person.fullName,
      team: person.currentTeam?.abbreviation || '',
    });
    setSearch1('');
    setSuggestions1([]);
  };

  const selectPlayer2 = (person) => {
    setPlayer2({
      id: person.id,
      name: person.fullName,
      team: person.currentTeam?.abbreviation || '',
    });
    setSearch2('');
    setSuggestions2([]);
  };

  useEffect(() => {
    if (player1.id && !player1.team && Object.keys(allTeams).length > 0) {
      fetchPlayerTeam(player1.id).then((team) => {
        setPlayer1((prev) => ({ ...prev, team }));
      });
    }
  }, [player1.id, allTeams]);

  useEffect(() => {
    if (player2.id && !player2.team && Object.keys(allTeams).length > 0) {
      fetchPlayerTeam(player2.id).then((team) => {
        setPlayer2((prev) => ({ ...prev, team }));
      });
    }
  }, [player2.id, allTeams]);

  const clearPlayer1 = () => {
    setPlayer1({ id: null, name: '', team: '' });
    setStats1({ hitting: {}, pitching: {} });
    setSearch1('');
  };

  const clearPlayer2 = () => {
    setPlayer2({ id: null, name: '', team: '' });
    setStats2({ hitting: {}, pitching: {} });
    setSearch2('');
  };

  const fetchPlayerStats = async (playerId, setter) => {
    if (!playerId) return;
    setLoading(true);
    try {
      const apiStartDate = formatForApi(startDate);
      const apiEndDate = formatForApi(endDate);
      const baseUrl = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=byDateRange&gameType=R&season=${year}&startDate=${apiStartDate}&endDate=${apiEndDate}`;
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
      setError('Failed to fetch player stats');
      setter({ hitting: {}, pitching: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerStats(player1.id, setStats1);
  }, [player1.id, year, startDate, endDate]);

  useEffect(() => {
    fetchPlayerStats(player2.id, setStats2);
  }, [player2.id, year, startDate, endDate]);

  const displayPeriod = `${formatForDisplay(startDate)} to ${formatForDisplay(endDate)}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-blue-900">Player Comparison</div>
        <div className="flex space-x-4 text-sm">
          <span>Year: {year}</span>
          <span>Period: {displayPeriod}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlayerSelector
          label="Player 1:"
          search={search1}
          setSearch={setSearch1}
          suggestions={suggestions1}
          selectPlayer={selectPlayer1}
          player={player1}
          clearPlayer={clearPlayer1}
        />
        <PlayerSelector
          label="Player 2:"
          search={search2}
          setSearch={setSearch2}
          suggestions={suggestions2}
          selectPlayer={selectPlayer2}
          player={player2}
          clearPlayer={clearPlayer2}
        />
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

      {player1.id && player2.id ? (
        <div className="border-4 border-sky-800">
          <div className="grid grid-cols-3">
            <div className="bg-sky-800 text-white py-4 px-6 flex items-center justify-center">ckstats</div>
            <PlayerHeader player={player1} />
            <PlayerHeader player={player2} />
          </div>

          <StatsTable
            categories={hittingCategories}
            stats1={stats1.hitting}
            stats2={stats2.hitting}
            player1={player1}
            player2={player2}
          />
        
          <StatsTable
            categories={pitchingCategories}
            stats1={stats1.pitching}
            stats2={stats2.pitching}
            player1={player1}
            player2={player2}
          />

        </div>
      ) : (
        <p className="text-center text-gray-600">Select two players to compare their stats.</p>
      )}
    </div>
  );
};

export default PlayerComparison;
