import { useState, useEffect } from "react";
// import { getGradient } from "../NHL/nhlUtils";
import { fetchNhlTeams, fetchNhlTeamStats } from "../../api/nhl";

const teamStatCategories = [
    { displayName: "Goals For", valueKey: "goalsPerGame", order: "desc" },
    { displayName: "Goals Against", valueKey: "goalsAgainstPerGame", order: "asc" },
    { displayName: "PP%", valueKey: "powerPlayPercentage", order: "desc" },
    { displayName: "PK%", valueKey: "penaltyKillPercentage", order: "desc" },
    { displayName: "Shots/GP", valueKey: "shotsPerGame", order: "desc" },
    { displayName: "Shots Against/GP", valueKey: "shotsAllowed", order: "asc" },
];

// Utility Functions
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

// Main Component: NhlTeamComparison
const NhlTeamComparison = () => {
  const [team1, setTeam1] = useState({ id: null, name: "", abbrev: "" });
  const [team2, setTeam2] = useState({ id: null, name: "", abbrev: "" });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [year, setYear] = useState(`${new Date().getFullYear() - 1}${new Date().getFullYear()}`);
  const [stats1, setStats1] = useState({});
  const [stats2, setStats2] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const teams = await fetchNhlTeams(year);
        setAllTeams(teams);
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
    const filtered = allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(search1.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(search1.toLowerCase())
    );
    setSuggestions1(filtered.slice(0, 5));
  }, [search1, allTeams]);

  useEffect(() => {
    if (search2.length < 2) {
      setSuggestions2([]);
      return;
    }
    const filtered = allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(search2.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(search2.toLowerCase())
    );
    setSuggestions2(filtered.slice(0, 5));
  }, [search2, allTeams]);

  const selectTeam = (team, setTeam, setSearch, setSuggestions) => {
    setTeam({
      id: team.id,
      name: team.name,
      abbrev: team.abbreviation,
    });
    setSearch("");
    setSuggestions([]);
  };

  const fetchStats = async (teamId, setter) => {
    if (!teamId) return;
    setLoading(true);
    try {
      const stats = await fetchNhlTeamStats({ teamId, year });
      setter(stats);
    } catch (err) {
      setError("Failed to fetch NHL team stats");
      setter({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(team1.id, setStats1);
  }, [team1.id, year]);

  useEffect(() => {
    fetchStats(team2.id, setStats2);
  }, [team2.id, year]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold tracking-tight text-indigo-900">NHL Team Comparison - Coming Soon</h2>
      {/* Team Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Selector */}
        <div>
          <input value={search1} onChange={(e) => setSearch1(e.target.value)} placeholder="Team 1" />
          <ul>{suggestions1.map(t => <li key={t.id} onClick={() => selectTeam(t, setTeam1, setSearch1, setSuggestions1)}>{t.name}</li>)}</ul>
          {team1.id && <p>Selected: {team1.name}</p>}
        </div>
        {/* Team 2 Selector */}
        <div>
          <input value={search2} onChange={(e) => setSearch2(e.target.value)} placeholder="Team 2" />
          <ul>{suggestions2.map(t => <li key={t.id} onClick={() => selectTeam(t, setTeam2, setSearch2, setSuggestions2)}>{t.name}</li>)}</ul>
          {team2.id && <p>Selected: {team2.name}</p>}
        </div>
      </div>
      {/* Stats Display */}
      {(team1.id || team2.id) && (
        <div>
          <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Team Stats</h4>
          {/* StatsTable would be rendered here with teamStatCategories */}
        </div>
      )}
    </div>
  );
};

export default NhlTeamComparison;
