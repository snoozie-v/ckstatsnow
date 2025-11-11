import { useState, useEffect } from "react";
import { getNflGradient } from "../NFL/nflUtils"; // Assume similar utility for NFL gradients
import { fetchNflTeams, fetchNflTeamStats } from "../../api/nfl"; // Correct import

const offenseCategories = [
  // { displayName: "Points Scored", cat: "pass", abbrev: "PTS", order: "desc" },
  { displayName: "Total Yards", cat: "pass", abbrev: "TYDS", order: "desc" },
  { displayName: "Passing Yards", cat: "pass", abbrev: "YDS", order: "desc" },
  { displayName: "Rushing Yards", cat: "rush", abbrev: "YDS", order: "desc" },
  { displayName: "Receiving Yards", cat: "rec", abbrev: "YDS", order: "desc" },
  // { displayName: "Touchdowns", cat: "pass", abbrev: "TD", order: "desc" },
  { displayName: "Completions", cat: "pass", abbrev: "CMP", order: "desc" },
  { displayName: "Completion %", cat: "pass", abbrev: "CMP%", order: "desc" },
  // { displayName: "QB Rating", cat: "pass", abbrev: "RTG", order: "desc" },
];

const defenseCategories = [
  // { displayName: "Points Allowed", cat: "def", abbrev: "PA", order: "asc" },
  // { displayName: "Yards Allowed", cat: "def", abbrev: "YA", order: "asc" },
  { displayName: "Sacks", cat: "def", abbrev: "SACK", order: "desc" },
  { displayName: "Interceptions", cat: "defint", abbrev: "INT", order: "desc" },
  { displayName: "Total Tackles", cat: "def", abbrev: "TOT", order: "desc" },
  { displayName: "Tackles for Loss", cat: "def", abbrev: "TFL", order: "desc" },
  // { displayName: "Safeties", cat: "def", abbrev: "SAFE", order: "desc" },
];

const StatsTable = ({
  categories,
  stats1,
  stats2,
  team1,
  team2,
  parseStat,
  isLeading,
  getValue,
}) => (
  <table className="w-full table-fixed bg-white shadow-lg rounded-b-xl overflow-hidden border-collapse">
    <tbody className="divide-y divide-gray-200">
      {categories.map((cat, index) => {
        const val1 = getValue(stats1, cat.cat, cat.abbrev);
        const val2 = team2?.id ? getValue(stats2, cat.cat, cat.abbrev) : null;
        const num1 = parseStat(val1);
        const num2 = parseStat(val2);
        const leads1 = isLeading(num1, num2, cat.order);
        const leads2 = isLeading(num2, num1, cat.order);
        return (
          <tr
            key={`${cat.cat}-${cat.abbrev}`}
            className={`transition duration-150 ease-in-out ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50`}
          >
            <td
              className={`px-3 py-2 text-lg font-medium text-gray-900 text-center ${
                team1.id && team2.id ? "w-1/3" : "w-1/2"
              }`}
            >
              {cat.displayName}
            </td>
            {team1.id && (
              <td
                className={`text-2xl px-3 py-2 font-semibold text-center ${
                  team1.id && team2.id ? "w-1/3" : "w-1/2"
                } ${leads1 ? "text-white" : "text-gray-600"}`}
                style={{
                  background:
                    leads1 && team1?.abbrev
                      ? getNflGradient(team1.abbrev)
                      : "transparent",
                }}
              >
                {val1}
              </td>
            )}
            {team2.id && (
              <td
                className={`text-2xl px-3 py-2 font-semibold w-1/3 text-center ${
                  leads2 ? "text-white" : "text-gray-600"
                }`}
                style={{
                  background:
                    leads2 && team2?.abbrev
                      ? getNflGradient(team2.abbrev)
                      : "transparent",
                }}
              >
                {val2}
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  </table>
);

const NflTeamComparison = () => {
  const [team1, setTeam1] = useState({ id: null, name: "", abbrev: "" });
  const [team2, setTeam2] = useState({ id: null, name: "", abbrev: "" });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [useWeek, setUseWeek] = useState(false); // Toggle for week mode
  const [selectedWeek, setSelectedWeek] = useState("1"); // Selected week
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameType, setGameType] = useState("R");
  const [selectedLeague, setSelectedLeague] = useState("NFL");
  const [offenseFirst, setOffenseFirst] = useState(true);

  const parseStat = (value) => {
    if (value === "-" || value === null || value === undefined) return null;
    const cleaned = value.replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const isLeading = (myNum, oppNum, order) => {
    if (myNum === null && oppNum === null) return false;
    if (myNum === null) return false;
    if (oppNum === null) return true;
    if (order === "desc") {
      return myNum > oppNum;
    } else {
      return myNum < oppNum;
    }
  };

  const fetchAllTeams = async (season) => {
    try {
      const teams = await fetchNflTeams(season);
      setAllTeams(teams);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to fetch teams");
    }
  };

  useEffect(() => {
    fetchAllTeams(year);
  }, [year]);

  useEffect(() => {
    if (search1.length >= 2) {
      const filtered = allTeams
        .filter(
          (team) =>
            team.name.toLowerCase().includes(search1.toLowerCase()) ||
            team.abbreviation.toLowerCase().includes(search1.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions1(filtered);
    } else {
      setSuggestions1([]);
    }
  }, [search1, allTeams]);

  useEffect(() => {
    if (search2.length >= 2) {
      const filtered = allTeams
        .filter(
          (team) =>
            team.name.toLowerCase().includes(search2.toLowerCase()) ||
            team.abbreviation.toLowerCase().includes(search2.toLowerCase())
        )
        .slice(0, 5);
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
    setSearch1("");
    setSuggestions1([]);
  };

  const selectTeam2 = (team) => {
    setTeam2({
      id: team.id,
      name: team.name,
      abbrev: team.abbreviation,
    });
    setSearch2("");
    setSuggestions2([]);
  };

  const clearTeam1 = () => {
    setTeam1({ id: null, name: "", abbrev: "" });
    setStats1(null);
    setSearch1("");
  };

  const clearTeam2 = () => {
    setTeam2({ id: null, name: "", abbrev: "" });
    setStats2(null);
    setSearch2("");
  };

  const fetchTeamStats = async (teamId, setter) => {
    if (!teamId) return;
    setLoading(true);
    try {
      const stats = await fetchNflTeamStats({
        teamId,
        year,
        gameType,
        selectedLeague,
        week: useWeek ? selectedWeek : undefined, // Pass week if enabled
      });
      setter(stats);
      setError(null);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError("Failed to fetch team stats");
      setter(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamStats(team1.id, setStats1);
  }, [
    team1.id,
    year,
    gameType,
    selectedLeague,
    useWeek,
    selectedWeek,
  ]);

  useEffect(() => {
    fetchTeamStats(team2.id, setStats2);
  }, [
    team2.id,
    year,
    gameType,
    selectedLeague,
    useWeek,
    selectedWeek,
  ]);

  const getValue = (statsData, cat, abbrev) => {
    const category = statsData?.splits?.categories?.find((c) => c.abbreviation === cat);
    const stat = category?.stats?.find((s) => s.abbreviation === abbrev);
    return stat ? stat.displayValue : "-";
  };

  const toggleOrder = () => {
    setOffenseFirst(!offenseFirst);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-indigo-900">Team Comparison</h2>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Year: {year}</span>
          {useWeek && <span>Week: {selectedWeek}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-800">Team 1:</label>
          <input
            type="text"
            value={search1}
            onChange={(e) => setSearch1(e.target.value)}
            placeholder="Search for a team..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
          {suggestions1.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
              {suggestions1.map((team) => (
                <li
                  key={team.id}
                  onClick={() => selectTeam1(team)}
                  className="p-3 hover:bg-indigo-50 cursor-pointer transition duration-150 text-gray-800"
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
                className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
              >
                Clear
              </button>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-800">Team 2:</label>
          <input
            type="text"
            value={search2}
            onChange={(e) => setSearch2(e.target.value)}
            placeholder="Search for a team..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
          {suggestions2.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
              {suggestions2.map((team) => (
                <li
                  key={team.id}
                  onClick={() => selectTeam2(team)}
                  className="p-3 hover:bg-indigo-50 cursor-pointer transition duration-150 text-gray-800"
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
                className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center space-x-4 text-sm">
        <label className="whitespace-nowrap font-medium text-gray-800">Year: </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
        <label className="whitespace-nowrap font-medium text-gray-800">Game Type: </label>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          <option value="P">Preseason</option>
          <option value="R">Regular Season</option>
          <option value="O">Postseason</option>
        </select>
        <label className="whitespace-nowrap font-medium text-gray-800">League: </label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          <option value="NFL">NFL</option>
          <option value="AFC">AFC</option>
          <option value="NFC">NFC</option>
        </select>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <label className="text-sm font-medium text-gray-800">Use Single Week:</label>
        <input
          type="checkbox"
          checked={useWeek}
          onChange={(e) => setUseWeek(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
      {useWeek && (
        <div className="flex items-center justify-center space-x-4">
          <label className="text-sm font-medium text-gray-800">Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <p className="text-center text-gray-600 font-medium">Loading comparison...</p>
      )}
      {error && <p className="text-center text-red-600 font-medium">{error}</p>}

      {team1.id || team2.id ? (
        <div className="border-2 border-indigo-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div
            className={`grid ${
              team1.id && team2.id ? "grid-cols-3" : "grid-cols-2"
            } bg-sky-800 text-white font-bold`}
          >
            <div className="py-4 px-6 flex items-center justify-center text-lg tracking-wide">

            </div>
            {team1.id ? (
              <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
                <img
                  src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team1.abbrev.toLowerCase()}.png`}
                  alt={`${team1.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            ) : (
              <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
                <img
                  src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team2.abbrev.toLowerCase()}.png`}
                  alt={`${team2.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            )}
            {team1.id && team2.id && (
              <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
                <img
                  src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team2.abbrev.toLowerCase()}.png`}
                  alt={`${team2.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            )}
          </div>

          <div className="p-4 space-y-8">
            {offenseFirst ? (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Offense Stats</h4>
                  <StatsTable
                    categories={offenseCategories}
                    stats1={stats1}
                    stats2={stats2}
                    team1={team1}
                    team2={team2}
                    parseStat={parseStat}
                    isLeading={isLeading}
                    getValue={getValue}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Defense Stats</h4>
                  <StatsTable
                    categories={defenseCategories}
                    stats1={stats1}
                    stats2={stats2}
                    team1={team1}
                    team2={team2}
                    parseStat={parseStat}
                    isLeading={isLeading}
                    getValue={getValue}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Defense Stats</h4>
                  <StatsTable
                    categories={defenseCategories}
                    stats1={stats1}
                    stats2={stats2}
                    team1={team1}
                    team2={team2}
                    parseStat={parseStat}
                    isLeading={isLeading}
                    getValue={getValue}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Offense Stats</h4>
                  <StatsTable
                    categories={offenseCategories}
                    stats1={stats1}
                    stats2={stats2}
                    team1={team1}
                    team2={team2}
                    parseStat={parseStat}
                    isLeading={isLeading}
                    getValue={getValue}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center p-4">
            <button
              onClick={toggleOrder}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out hover:scale-105"
            >
              {offenseFirst ? "View Defense First" : "View Offense First"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 py-4">
            Data via ESPN API
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-600 font-medium">
          Select teams to compare their stats.
        </p>
      )}
    </div>
  );
};

export default NflTeamComparison;
