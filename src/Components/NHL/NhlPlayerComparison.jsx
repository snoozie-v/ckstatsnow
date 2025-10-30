import { useState, useEffect } from "react";
import { getGradient } from "../NHL/nhlUtils";
import {
  fetchNhlTeams,
  searchNhlPlayers,
  fetchNhlPlayerDetails,
  fetchNhlPlayerStats,
} from "../../api/nhl";

// Constants
const skaterCategories = [
  { displayName: "G", valueKey: "goals", order: "desc" },
  { displayName: "A", valueKey: "assists", order: "desc" },
  { displayName: "P", valueKey: "points", order: "desc" },
  { displayName: "+/-", valueKey: "plusMinus", order: "desc" },
  { displayName: "SOG", valueKey: "shots", order: "desc" },
  { displayName: "PIM", valueKey: "pim", order: "asc" },
];

const goalieCategories = [
  { displayName: "W", valueKey: "wins", order: "desc" },
  { displayName: "GAA", valueKey: "goalAgainstAverage", order: "asc" },
  { displayName: "SV%", valueKey: "savePercentage", order: "desc" },
  { displayName: "SO", valueKey: "shutouts", order: "desc" },
];

// Utility Functions (could be moved to a shared file)
const parseStat = (value) => {
  if (value === "-" || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const isLeading = (myNum, oppNum, order) => {
  if (myNum === null && oppNum === null) return false;
  if (myNum === null) return false;
  if (oppNum === null) return true;
  return order === "desc" ? myNum > oppNum : myNum < oppNum;
};

// Main Component: NhlPlayerComparison
const NhlPlayerComparison = () => {
  const [player1, setPlayer1] = useState({ id: null, name: "", team: "" });
  const [player2, setPlayer2] = useState({ id: null, name: "", team: "" });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState({});
  const [year, setYear] = useState(`${new Date().getFullYear() - 1}${new Date().getFullYear()}`);
  const [stats1, setStats1] = useState({ skating: {}, goaltending: {} });
  const [stats2, setStats2] = useState({ skating: {}, goaltending: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Simplified useEffects for fetching data
  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const teams = await fetchNhlTeams(year);
        const teamsMap = teams.reduce((acc, team) => {
          acc[team.id] = team.abbreviation;
          return acc;
        }, {});
        setAllTeams(teamsMap);
      } catch (err) {
        setError("Failed to fetch NHL teams");
      }
    };
    fetchAllTeams();
  }, [year]);

  useEffect(() => {
    if (search1.length < 2) {
      setSuggestions1([]);
      return;
    }
    const timer = setTimeout(async () => {
      const suggestions = await searchNhlPlayers(search1);
      setSuggestions1(suggestions);
    }, 300);
    return () => clearTimeout(timer);
  }, [search1]);

  useEffect(() => {
    if (search2.length < 2) {
      setSuggestions2([]);
      return;
    }
    const timer = setTimeout(async () => {
      const suggestions = await searchNhlPlayers(search2);
      setSuggestions2(suggestions);
    }, 300);
    return () => clearTimeout(timer);
  }, [search2]);

  const selectPlayer = (person, setPlayer, setSearch, setSuggestions) => {
    setPlayer({
      id: person.id,
      name: person.fullName,
      team: person.team || "",
    });
    setSearch("");
    setSuggestions([]);
  };

  const fetchStats = async (playerId, setter) => {
    if (!playerId) return;
    setLoading(true);
    try {
      const stats = await fetchNhlPlayerStats({ playerId, year });
      setter(stats);
    } catch (err) {
      setError("Failed to fetch NHL player stats");
      setter({ skating: {}, goaltending: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(player1.id, setStats1);
  }, [player1.id, year]);

  useEffect(() => {
    fetchStats(player2.id, setStats2);
  }, [player2.id, year]);

  // Simplified render logic for brevity
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold tracking-tight text-indigo-900">NHL Player Comparison - Coming Soon</h2>
      {/* Player Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Selector */}
        <div>
          <input value={search1} onChange={(e) => setSearch1(e.target.value)} placeholder="Player 1" />
          <ul>{suggestions1.map(p => <li key={p.id} onClick={() => selectPlayer(p, setPlayer1, setSearch1, setSuggestions1)}>{p.fullName}</li>)}</ul>
          {player1.id && <p>Selected: {player1.name}</p>}
        </div>
        {/* Player 2 Selector */}
        <div>
          <input value={search2} onChange={(e) => setSearch2(e.target.value)} placeholder="Player 2" />
          <ul>{suggestions2.map(p => <li key={p.id} onClick={() => selectPlayer(p, setPlayer2, setSearch2, setSuggestions2)}>{p.fullName}</li>)}</ul>
          {player2.id && <p>Selected: {player2.name}</p>}
        </div>
      </div>
      {/* Stats Display */}
      {(player1.id || player2.id) && (
        <div>
          {/* Skater Stats */}
          <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Skater Stats</h4>
          {/* StatsTable would be rendered here with skaterCategories */}

          {/* Goalie Stats */}
          <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Goalie Stats</h4>
          {/* StatsTable would be rendered here with goalieCategories */}
        </div>
      )}
    </div>
  );
};

export default NhlPlayerComparison;
