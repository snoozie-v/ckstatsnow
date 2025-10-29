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
  <table className="w-full table-fixed bg-white shadow-lg rounded-xl overflow-hidden border-collapse">
    <tbody className="divide-y divide-gray-200">
      {categories.map((cat, index) => {
        const val1 = getValue(stats1, cat.valueKey);
        const val2 = team2?.id ? getValue(stats2, cat.valueKey) : null;
        const num1 = parseStat(val1);
        const num2 = parseStat(val2);
        const leads1 = isLeading(num1, num2, cat.order);
        const leads2 = isLeading(num2, num1, cat.order);
        return (
          <tr
            key={cat.valueKey}
            className={`transition duration-150 ease-in-out ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50`}
          >
            <td
              className={`px-6 py-4 text-lg font-medium text-gray-900 text-center ${
                team1.id && team2.id ? "w-1/3" : "w-1/2"
              }`}
            >
              {cat.displayName}
            </td>
            {team1.id && (
              <td
                className={`text-2xl px-6 py-4 font-semibold text-center ${
                  team1.id && team2.id ? "w-1/3" : "w-1/2"
                } ${leads1 ? "text-white" : "text-gray-600"}`}
                style={{
                  background:
                    leads1 && team1?.abbrev
                      ? getGradient(team1.abbrev)
                      : "transparent",
                }}
              >
                {val1}
              </td>
            )}
            {team2.id && (
              <td
                className={`text-2xl px-6 py-4 font-semibold w-1/3 text-center ${
                  leads2 ? "text-white" : "text-gray-600"
                }`}
                style={{
                  background:
                    leads2 && team2?.abbrev
                      ? getGradient(team2.abbrev)
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
  const [preset, setPreset] = useState("custom");
  const [stats1, setStats1] = useState({ hitting: {}, pitching: {} });
  const [stats2, setStats2] = useState({ hitting: {}, pitching: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null); // New: For date validation
  const [gameType, setGameType] = useState("R");
  const [selectedLeague, setSelectedLeague] = useState("MLB");
  const [hittingFirst, setHittingFirst] = useState(true); // New state for toggle

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
    setValidationError(null);
    if (new Date(tempStartDate) > new Date(tempEndDate)) {
      setValidationError("Start date must be before or equal to end date.");
      return;
    }
    if (!tempStartDate || !tempEndDate) {
      setValidationError("Please select valid start and end dates.");
      return;
    }
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  const handlePresetChange = (event) => {
    const value = event.target.value;
    setPreset(value);

    if (value === "custom") {
      return;
    }

    const now = new Date();
    const getDateStr = (d) => d.toISOString().split("T")[0];
    let s, e;

    if (value === "today") {
      s = getDateStr(now);
      e = s;
    } else if (value === "yesterday") {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      s = getDateStr(yest);
      e = s;
    } else if (value === "thisWeek") {
      const start = new Date(now);
      start.setDate(start.getDate() - now.getDay());
      s = getDateStr(start);
      e = getDateStr(now);
    } else if (value === "lastWeek") {
      const startThis = new Date(now);
      startThis.setDate(startThis.getDate() - now.getDay());
      const endLast = new Date(startThis);
      endLast.setDate(endLast.getDate() - 1);
      const startLast = new Date(endLast);
      startLast.setDate(startLast.getDate() - 6);
      s = getDateStr(startLast);
      e = getDateStr(endLast);
    }

    setTempStartDate(s);
    setTempEndDate(e);
    applyDateRange(); // Automatically apply for presets
  };

  const getValue = (groupData, key) => {
    return groupData?.[key] ?? "-";
  };

  const displayPeriod = `${formatForDisplay(startDate)} to ${formatForDisplay(
    endDate
  )}`;

  const toggleOrder = () => {
    setHittingFirst(!hittingFirst);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      {validationError && (
        <p className="text-center text-red-600 font-medium">{validationError}</p>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-indigo-900">Team Comparison</h2>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Year: {year}</span>
          {useDateRange && <span>Period: {displayPeriod}</span>}
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
          <option value="R">Regular Season</option>
          <option value="P">Postseason</option>
        </select>
        <label className="whitespace-nowrap font-medium text-gray-800">League: </label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          <option value="MLB">MLB</option>
          <option value="AL">AL</option>
          <option value="NL">NL</option>
        </select>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <label className="text-sm font-medium text-gray-800">Use Custom Date Range:</label>
        <input
          type="checkbox"
          checked={useDateRange}
          onChange={(e) => setUseDateRange(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
      {useDateRange && (
        <>
          <div className="flex items-center justify-center space-x-4">
            <label htmlFor="presetFilter" className="text-sm font-medium text-gray-800">
              Quick Filter:
            </label>
            <select
              id="presetFilter"
              value={preset}
              onChange={handlePresetChange}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
            >
              <option value="custom">Custom</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
            </select>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Start Date:
              </label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => {
                  setTempStartDate(e.target.value);
                  setPreset("custom");
                }}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                End Date:
              </label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => {
                  setTempEndDate(e.target.value);
                  setPreset("custom");
                }}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
              />
            </div>
            <button
              onClick={applyDateRange}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-6 hover:bg-indigo-700 transition duration-150 ease-in-out hover:scale-105"
            >
              Apply
            </button>
          </div>
        </>
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
                <h3 className="text-xl font-bold text-indigo-900">{team1.name}</h3>
                <img
                  src={`https://a.espncdn.com/i/teamlogos/mlb/500/${team1.abbrev.toLowerCase()}.png`}
                  alt={`${team1.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            ) : (
              <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
                <h3 className="text-xl font-bold text-indigo-900">{team2.name}</h3>
                <img
                  src={`https://a.espncdn.com/i/teamlogos/mlb/500/${team2.abbrev.toLowerCase()}.png`}
                  alt={`${team2.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            )}
            {team1.id && team2.id && (
              <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
                <h3 className="text-xl font-bold text-indigo-900">{team2.name}</h3>
                <img
                  src={`https://a.espncdn.com/i/teamlogos/mlb/500/${team2.abbrev.toLowerCase()}.png`}
                  alt={`${team2.abbrev} logo`}
                  className="w-16 h-16 mx-auto mt-2"
                />
              </div>
            )}
          </div>

          <div className="p-4 space-y-8">
            {hittingFirst ? (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Hitting Stats</h4>
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
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Pitching Stats</h4>
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
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Pitching Stats</h4>
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
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Hitting Stats</h4>
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
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center p-4">
            <button
              onClick={toggleOrder}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out hover:scale-105"
            >
              {hittingFirst ? "View Pitching First" : "View Hitting First"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 py-4">
            Data via MLB Stats API © MLBAM
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

export default MlbTeamComparison;
