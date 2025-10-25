import { useState, useEffect } from "react";
import { getGradient } from "../MLB/mlbUtils";
import { fetchMlbTeams, fetchMlbTeamStats } from "../../api/mlb"; // Correct import

const hittingCategories = [
  { displayName: "HR", valueKey: "homeRuns", order: "desc" },
  { displayName: "AVG", valueKey: "avg", order: "desc" },
  { displayName: "RBI", valueKey: "rbi", order: "desc" },
  { displayName: "Hits", valueKey: "hits", order: "desc" },
  { displayName: "Doubles", valueKey: "doubles", order: "desc" },
  { displayName: "Triples", valueKey: "triples", order: "desc" },
  { displayName: "SB", valueKey: "stolenBases", order: "desc" },
  { displayName: "OBP", valueKey: "obp", order: "desc" },
  { displayName: "Slugging", valueKey: "slg", order: "desc" },
  { displayName: "OPS", valueKey: "ops", order: "desc" },
];

const pitchingCategories = [
  { displayName: "Wins", valueKey: "wins", order: "desc" },
  { displayName: "ERA", valueKey: "era", order: "asc" },
  { displayName: "K", valueKey: "strikeOuts", order: "desc" },
  { displayName: "WHIP", valueKey: "whip", order: "asc" },
  { displayName: "IP", valueKey: "inningsPitched", order: "desc" },
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
            <td className="px-4 py-2 text-lg font-medium text-gray-900 w-1/3 text-center">
              {cat.displayName}
            </td>
            <td
              className={`text-2xl px-4 py-2 font-semibold w-1/3 text-center ${
                leads1 ? "text-white" : "text-gray-500"
              }`}
              style={{
                background: leads1 ? getGradient(team1.abbrev) : "transparent",
              }}
            >
              {val1}
            </td>
            <td
              className={`text-2xl px-4 py-2 font-semibold w-1/3 text-center ${
                leads2 ? "text-white" : "text-gray-500"
              }`}
              style={{
                background: leads2 ? getGradient(team2.abbrev) : "transparent",
              }}
            >
              {val2}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const MlbTeamComparison = () => {
  const [team1, setTeam1] = useState({ id: null, name: "", abbrev: "" });
  const [team2, setTeam2] = useState({ id: null, name: "", abbrev: "" });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState(
    `${new Date().getFullYear()}-04-01`
  );
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-10-01`);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [stats1, setStats1] = useState({ hitting: {}, pitching: {} });
  const [stats2, setStats2] = useState({ hitting: {}, pitching: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameType, setGameType] = useState("R");
  const [selectedLeague, setSelectedLeague] = useState("MLB");

  const formatForApi = (isoDate) => {
    const [y, m, d] = isoDate.split("-");
    return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
  };

  const formatForDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split("-");
    return `${m}/${d}/${y}`;
  };

  const parseStat = (value) => {
    if (value === "-" || value === null || value === undefined) return null;
    const num = parseFloat(value);
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
      const teams = await fetchMlbTeams(season);
      setAllTeams(teams);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
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
    setStats1({ hitting: {}, pitching: {} });
    setSearch1("");
  };

  const clearTeam2 = () => {
    setTeam2({ id: null, name: "", abbrev: "" });
    setStats2({ hitting: {}, pitching: {} });
    setSearch2("");
  };

  const fetchTeamStats = async (teamId, setter) => {
    if (!teamId) return;
    setLoading(true);
    try {
      const stats = await fetchMlbTeamStats({
        teamId,
        year,
        gameType,
        useDateRange,
        startDate,
        endDate,
        selectedLeague,
      });
      setter(stats);
      setError(null);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError("Failed to fetch team stats");
      setter({ hitting: {}, pitching: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamStats(team1.id, setStats1);
  }, [
    team1.id,
    year,
    useDateRange,
    startDate,
    endDate,
    gameType,
    selectedLeague,
  ]);

  useEffect(() => {
    fetchTeamStats(team2.id, setStats2);
  }, [
    team2.id,
    year,
    useDateRange,
    startDate,
    endDate,
    gameType,
    selectedLeague,
  ]);

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

  const getValue = (groupData, key) => {
    return groupData[key] ?? "-";
  };

  const displayPeriod = `${formatForDisplay(startDate)} to ${formatForDisplay(
    endDate
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-blue-900">Team Comparison</div>
        <div className="flex space-x-4 text-sm">
          <span>Year: {year}</span>
          {useDateRange && <span>Period: {displayPeriod}</span>}
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
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-1 border rounded"
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
        <label className="whitespace-nowrap">Game Type: </label>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="p-1 border rounded"
        >
          <option value="R">Regular Season</option>
          <option value="P">Postseason</option>
        </select>
        <label className="whitespace-nowrap">League: </label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-1 border rounded"
        >
          <option value="MLB">MLB</option>
          <option value="AL">AL</option>
          <option value="NL">NL</option>
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
            <label className="block text-sm font-medium mb-1">
              Start Date:
            </label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="p-1 border rounded"
            />
          </div>
          <button
            onClick={applyDateRange}
            className="p-1 bg-blue-500 text-white rounded mt-6"
          >
            Apply
          </button>
        </div>
      )}

      {loading && (
        <p className="text-center text-gray-600">Loading comparison...</p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}

      {team1.id && team2.id ? (
        <div className="border-4 border-sky-800">
          <div className="grid grid-cols-3">
            <div className="bg-sky-800 text-white py-4 px-6 flex items-center justify-center">
              ckstats
            </div>
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
            <div className="text-center bg-blue-100 p-4 rounded">
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

          <StatsTable
            categories={hittingCategories}
            stats1={stats1.hitting}
            stats2={stats2.hitting}
            team1={team1}
            team2={team2}
            parseStat={parseStat}
            isLeading={isLeading}
            getValue={getValue}
          />

          <StatsTable
            categories={pitchingCategories}
            stats1={stats1.pitching}
            stats2={stats2.pitching}
            team1={team1}
            team2={team2}
            parseStat={parseStat}
            isLeading={isLeading}
            getValue={getValue}
          />

          <p className="text-center text-xs text-gray-500">
            Data via MLB Stats API © MLBAM
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Select two teams to compare their stats.
        </p>
      )}
    </div>
  );
};

export default MlbTeamComparison;
