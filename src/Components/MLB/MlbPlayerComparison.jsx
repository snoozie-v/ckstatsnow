import { useState, useEffect } from "react";
import { getGradient } from "../MLB/mlbUtils";
import {
  fetchMlbTeams,
  searchMlbPlayers,
  fetchMlbPlayerDetails,
  fetchMlbPlayerStats,
} from "../../api/mlb";

// Constants
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
  if (order === "desc") {
    return myNum > oppNum;
  } else {
    return myNum < oppNum;
  }
};

const formatForDisplay = (isoDate) => {
  const [y, m, d] = isoDate.split("-");
  return `${m}/${d}/${y}`;
};

const hasHittingStats = (stats) => {
  return parseInt(stats.atBats || 0) > 0;
};

const hasPitchingStats = (stats) => {
  return parseInt(stats.gamesPitched || 0) > 0;
};

// Sub-Component: PlayerSelector
const PlayerSelector = ({
  label,
  search,
  setSearch,
  suggestions,
  selectPlayer,
  player,
  clearPlayer,
}) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-800">{label}</label>
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for a player..."
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
    />
    {suggestions.length > 0 && (
      <ul className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
        {suggestions.slice(0, 5).map((person) => (
          <li
            key={person.id}
            onClick={() => selectPlayer(person)}
            className="p-3 hover:bg-indigo-50 cursor-pointer transition duration-150 text-gray-800"
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
          className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
        >
          Clear
        </button>
      </p>
    )}
  </div>
);

// Sub-Component: PlayerHeader
const PlayerHeader = ({ player }) => (
  <div className="text-center p-4 bg-indigo-50 min-h-[120px] flex flex-col justify-center">
    <h3 className="text-xl font-bold text-indigo-900">{player?.name || "Player 2"}</h3>
    {player?.id && (
      <img
        src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic-sit:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.id}/headshot/67/current`}
        alt={`${player.name} headshot`}
        className="w-16 h-16 mx-auto mt-2 rounded-full"
      />
    )}
  </div>
);

// Sub-Component: StatsTable
const StatsTable = ({ categories, stats1, stats2, player1, player2 }) => {
  const getValue = (groupData, key) =>
    groupData ? groupData[key] ?? "-" : "-";

  return (
    <table className="w-full table-fixed bg-white shadow-lg rounded-xl overflow-hidden border-collapse">
      <tbody className="divide-y divide-gray-200">
        {categories.map((cat, index) => {
          const val1 = getValue(stats1, cat.valueKey);
          const val2 = player2?.id ? getValue(stats2, cat.valueKey) : null;
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
                  player1.id && player2.id ? "w-1/3" : "w-1/2"
                }`}
              >
                {cat.displayName}
              </td>
              {player1.id && (
                <td
                  className={`text-2xl px-6 py-4 font-semibold text-center ${
                    player1.id && player2.id ? "w-1/3" : "w-1/2"
                  } ${leads1 ? "text-white" : "text-gray-600"}`}
                  style={{
                    background:
                      leads1 && player1?.team
                        ? getGradient(player1.team)
                        : "transparent",
                  }}
                >
                  {val1}
                </td>
              )}
              {player2.id && (
                <td
                  className={`text-2xl px-6 py-4 font-semibold w-1/3 text-center ${
                    leads2 ? "text-white" : "text-gray-600"
                  }`}
                  style={{
                    background:
                      leads2 && player2?.team
                        ? getGradient(player2.team)
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
};

// Main Component: MlbPlayerComparison
const MlbPlayerComparison = () => {
  const [player1, setPlayer1] = useState({ id: null, name: "", team: "" });
  const [player2, setPlayer2] = useState({ id: null, name: "", team: "" });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState({});
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

  const fetchAllTeams = async () => {
    try {
      const teams = await fetchMlbTeams(year);
      const teamsMap = teams.reduce((acc, team) => {
        acc[team.id] = team.abbreviation;
        return acc;
      }, {});
      setAllTeams(teamsMap);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to fetch teams");
    }
  };

  const fetchPlayerTeam = async (playerId) => {
    try {
      // Use the dedicated endpoint for fetching a single player's details
      const person = await fetchMlbPlayerDetails(playerId);
      const teamId = person.currentTeam?.id;
      if (teamId && allTeams[teamId]) {
        return allTeams[teamId];
      }
      return "";
    } catch (err) {
      console.error("Failed to fetch player team:", err);
      return "";
    }
  };

  useEffect(() => {
    fetchAllTeams(year);
  }, [year]);

  useEffect(() => {
    let timer;
    if (search1.length >= 2) {
      timer = setTimeout(async () => {
        const suggestions = await searchMlbPlayers(search1, year);
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
        const suggestions = await searchMlbPlayers(search2, year);
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
      team: person.currentTeam?.abbreviation || "",
    });
    setSearch1("");
    setSuggestions1([]);
  };

  const selectPlayer2 = (person) => {
    setPlayer2({
      id: person.id,
      name: person.fullName,
      team: person.currentTeam?.abbreviation || "",
    });
    setSearch2("");
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
    setPlayer1({ id: null, name: "", team: "" });
    setStats1({ hitting: {}, pitching: {} });
    setSearch1("");
  };

  const clearPlayer2 = () => {
    setPlayer2({ id: null, name: "", team: "" });
    setStats2({ hitting: {}, pitching: {} });
    setSearch2("");
  };

  const fetchPlayerStats = async (playerId, setter) => {
    if (!playerId) return;
    setLoading(true);
    try {
      const stats = await fetchMlbPlayerStats({
        playerId,
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
      setError("Failed to fetch player stats");
      setter({ hitting: {}, pitching: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerStats(player1.id, setStats1);
  }, [
    player1.id,
    year,
    useDateRange,
    startDate,
    endDate,
    gameType,
    selectedLeague,
  ]);

  useEffect(() => {
    fetchPlayerStats(player2.id, setStats2);
  }, [
    player2.id,
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
        <h2 className="text-2xl font-bold tracking-tight text-indigo-900">Player Comparison</h2>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Year: {year}</span>
          {useDateRange && <span>Period: {displayPeriod}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {player1.id || player2.id ? (
        <div className="border-2 border-indigo-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div
            className={`grid ${
              player1.id && player2.id ? "grid-cols-3" : "grid-cols-2"
            } bg-indigo-800 text-white font-bold`}
          >
            <div className="py-4 px-6 flex items-center justify-center text-lg tracking-wide">
              Stats Comparison
            </div>
            {player1.id ? (
              <PlayerHeader player={player1} />
            ) : (
              <PlayerHeader player={player2} />
            )}
            {player1.id && player2.id && <PlayerHeader player={player2} />}
          </div>

          <div className="p-4 space-y-8">
            {hittingFirst ? (
              <>
                {(hasHittingStats(stats1.hitting) ||
                  hasHittingStats(stats2.hitting)) && (
                  <div>
                    <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Hitting Stats</h4>
                    <StatsTable
                      categories={hittingCategories}
                      stats1={stats1.hitting}
                      stats2={stats2.hitting}
                      player1={player1}
                      player2={player2}
                    />
                  </div>
                )}
                {(hasPitchingStats(stats1.pitching) ||
                  hasPitchingStats(stats2.pitching)) && (
                  <div>
                    <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Pitching Stats</h4>
                    <StatsTable
                      categories={pitchingCategories}
                      stats1={stats1.pitching}
                      stats2={stats2.pitching}
                      player1={player1}
                      player2={player2}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {(hasPitchingStats(stats1.pitching) ||
                  hasPitchingStats(stats2.pitching)) && (
                  <div>
                    <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Pitching Stats</h4>
                    <StatsTable
                      categories={pitchingCategories}
                      stats1={stats1.pitching}
                      stats2={stats2.pitching}
                      player1={player1}
                      player2={player2}
                    />
                  </div>
                )}
                {(hasHittingStats(stats1.hitting) ||
                  hasHittingStats(stats2.hitting)) && (
                  <div>
                    <h4 className="text-lg font-semibold text-center bg-indigo-100 py-3 rounded-t-lg text-indigo-900">Hitting Stats</h4>
                    <StatsTable
                      categories={hittingCategories}
                      stats1={stats1.hitting}
                      stats2={stats2.hitting}
                      player1={player1}
                      player2={player2}
                    />
                  </div>
                )}
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
          Select players to compare their stats.
        </p>
      )}
    </div>
  );
};

export default MlbPlayerComparison;
