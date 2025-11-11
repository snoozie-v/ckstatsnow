import { useState, useEffect } from "react";
import { fetchNflFantasyLeaders } from "../../api/espn";
import { getNflGradient } from "./nflUtils";

const passingCategories = [
  { displayName: "Pass Yds", valueKey: "3", order: "desc" },
  { displayName: "Pass TDs", valueKey: "4", order: "desc" },
  { displayName: "Interceptions", valueKey: "20", order: "asc" },
];

const rushingCategories = [
  { displayName: "Rush Yds", valueKey: "24", order: "desc" },
  { displayName: "Rush TDs", valueKey: "25", order: "desc" },
  { displayName: "Rush Att", valueKey: "23", order: "desc" },
];

const receivingCategories = [
  { displayName: "Rec Yds", valueKey: "42", order: "desc" },
  { displayName: "Receptions", valueKey: "53", order: "desc" },
  { displayName: "Rec TDs", valueKey: "43", order: "desc" },
];

const teamMap = {
  1: "ATL",
  2: "BUF",
  3: "CHI",
  4: "CIN",
  5: "CLE",
  6: "DAL",
  7: "DEN",
  8: "DET",
  9: "GB",
  10: "TEN",
  11: "IND",
  12: "KC",
  13: "LV",
  14: "LAR",
  15: "MIA",
  16: "MIN",
  17: "NE",
  18: "NO",
  19: "NYG",
  20: "NYJ",
  21: "PHI",
  22: "ARI",
  23: "PIT",
  24: "LAC",
  25: "SF",
  26: "SEA",
  27: "TB",
  28: "WAS",
  29: "CAR",
  30: "JAX",
  33: "BAL",
  34: "HOU",
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

const hasStatsForCategory = (stats, categories) => {
  return categories.some((cat) => parseFloat(stats[cat.valueKey] || 0) > 0);
};

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
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
    />
    {suggestions.length > 0 && (
      <ul className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
        {suggestions.slice(0, 5).map((p) => (
          <li
            key={p.id}
            onClick={() => selectPlayer(p)}
            className="p-3 hover:bg-blue-50 cursor-pointer transition duration-150 text-gray-800"
          >
            {p.fullName} ({teamMap[p.proTeamId] || "N/A"})
          </li>
        ))}
      </ul>
    )}
    {player.name && (
      <p className="mt-2 text-sm text-gray-600">
        Selected: {player.name} ({player.team})
        <button
          onClick={clearPlayer}
          className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          Clear
        </button>
      </p>
    )}
  </div>
);

const PlayerHeader = ({ player }) => (
  <div className="text-center p-4 bg-blue-50 min-h-[120px] flex flex-col justify-center">
    <h3 className="text-xl font-bold text-blue-900">{player?.name || "Player"}</h3>
    {player?.id && (
      <img
        src={`https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png`}
        alt={`${player.name} headshot`}
        className="w-16 h-16 mx-auto mt-2 rounded-full object-cover"
        onError={(e) => {
          e.target.style.visibility = "hidden";
        }}
      />
    )}
  </div>
);

const StatsTable = ({
  categories,
  stats1,
  stats2,
  player1,
  player2,
}) => {
  return (
    <table className="w-full table-fixed bg-white shadow-lg rounded-xl overflow-hidden border-collapse">
      <tbody className="divide-y divide-gray-200">
        {categories.map((cat, index) => {
          const val1 = stats1[cat.valueKey] ?? "-";
          const val2 = stats2[cat.valueKey] ?? "-";
          const num1 = parseStat(val1);
          const num2 = parseStat(val2);
          const leads1 = isLeading(num1, num2, cat.order);
          const leads2 = isLeading(num2, num1, cat.order);
          return (
            <tr
              key={cat.valueKey}
              className={`transition duration-150 ease-in-out ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
            >
              <td
                className={`px-3 py-2 text-lg font-medium text-gray-900 text-center w-1/3`}
              >
                {cat.displayName}
              </td>
              <td
                className={`text-2xl px-3 py-2 font-semibold text-center w-1/3 ${leads1 ? "text-white" : "text-gray-600"}`}
                style={{
                  background:
                    leads1 && player1?.team
                      ? getNflGradient(player1.team)
                      : "transparent",
                }}
              >
                {val1}
              </td>
              <td
                className={`text-2xl px-3 py-2 font-semibold text-center w-1/3 ${leads2 ? "text-white" : "text-gray-600"}`}
                style={{
                  background:
                    leads2 && player2?.team
                      ? getNflGradient(player2.team)
                      : "transparent",
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
};

const NflPlayerComparison = () => {
  const [player1, setPlayer1] = useState({
    id: null,
    name: "",
    team: "",
    stats: {},
  });
  const [player2, setPlayer2] = useState({
    id: null,
    name: "",
    team: "",
    stats: {},
  });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const statEntryId = "00" + year;
        const playersData = await fetchNflFantasyLeaders(year);
        const processedPlayers = (playersData || [])
          .map((p) => {
            const seasonStats =
              p.stats?.find((s) => s.id === statEntryId) || {};
            return { ...p, stats: seasonStats.stats || {} };
          })
          .filter((p) => p.fullName && !p.fullName.endsWith(" TQB"));
        setAllPlayers(processedPlayers);
      } catch (err) {
        setError("Failed to fetch player data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPlayers();
  }, [year]);

  useEffect(() => {
    if (search1.length >= 2) {
      setSuggestions1(
        allPlayers.filter((p) =>
          p.fullName.toLowerCase().includes(search1.toLowerCase())
        )
      );
    } else {
      setSuggestions1([]);
    }
  }, [search1, allPlayers]);

  useEffect(() => {
    if (search2.length >= 2) {
      setSuggestions2(
        allPlayers.filter((p) =>
          p.fullName.toLowerCase().includes(search2.toLowerCase())
        )
      );
    } else {
      setSuggestions2([]);
    }
  }, [search2, allPlayers]);

  const selectPlayer = (player, playerNumber) => {
    const setter = playerNumber === 1 ? setPlayer1 : setPlayer2;
    const setSearch = playerNumber === 1 ? setSearch1 : setSearch2;
    const setSuggestions =
      playerNumber === 1 ? setSuggestions1 : setSuggestions2;

    setter({
      id: player.id,
      name: player.fullName,
      team: teamMap[player.proTeamId] || "N/A",
      stats: player.stats,
    });
    setSearch("");
    setSuggestions([]);
  };

  const clearPlayer = (playerNumber) => {
    const setter = playerNumber === 1 ? setPlayer1 : setPlayer2;
    const setSearch = playerNumber === 1 ? setSearch1 : setSearch2;
    setter({ id: null, name: "", team: "", stats: {} });
    setSearch("");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">NFL Player Comparison</h2>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Year: {year}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayerSelector
          label="Player 1:"
          search={search1}
          setSearch={setSearch1}
          suggestions={suggestions1}
          selectPlayer={(p) => selectPlayer(p, 1)}
          player={player1}
          clearPlayer={() => clearPlayer(1)}
        />
        <PlayerSelector
          label="Player 2:"
          search={search2}
          setSearch={setSearch2}
          suggestions={suggestions2}
          selectPlayer={(p) => selectPlayer(p, 2)}
          player={player2}
          clearPlayer={() => clearPlayer(2)}
        />
      </div>

      <div className="flex flex-wrap items-center space-x-4 text-sm">
        <label className="whitespace-nowrap font-medium text-gray-800">Year: </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-center text-gray-600 font-medium">Loading player data...</p>
      )}
      {error && <p className="text-center text-red-600 font-medium">{error}</p>}

      {player1.id && player2.id ? (
        <div className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="grid grid-cols-3 bg-blue-800 text-white font-bold">
            <div className="py-4 px-6 flex items-center justify-center text-lg tracking-wide">
              ckstats
            </div>
            <PlayerHeader player={player1} />
            <PlayerHeader player={player2} />
          </div>

          <div className="p-4 space-y-8">
            {hasStatsForCategory(player1.stats, passingCategories) ||
            hasStatsForCategory(player2.stats, passingCategories) ? (
              <div>
                <h4 className="text-lg font-semibold text-center bg-blue-100 py-3 rounded-t-lg text-blue-900">Passing Stats</h4>
                <StatsTable
                  categories={passingCategories}
                  stats1={player1.stats}
                  stats2={player2.stats}
                  player1={player1}
                  player2={player2}
                />
              </div>
            ) : null}
            {hasStatsForCategory(player1.stats, rushingCategories) ||
            hasStatsForCategory(player2.stats, rushingCategories) ? (
              <div>
                <h4 className="text-lg font-semibold text-center bg-blue-100 py-3 rounded-t-lg text-blue-900">Rushing Stats</h4>
                <StatsTable
                  categories={rushingCategories}
                  stats1={player1.stats}
                  stats2={player2.stats}
                  player1={player1}
                  player2={player2}
                />
              </div>
            ) : null}
            {hasStatsForCategory(player1.stats, receivingCategories) ||
            hasStatsForCategory(player2.stats, receivingCategories) ? (
              <div>
                <h4 className="text-lg font-semibold text-center bg-blue-100 py-3 rounded-t-lg text-blue-900">Receiving Stats</h4>
                <StatsTable
                  categories={receivingCategories}
                  stats1={player1.stats}
                  stats2={player2.stats}
                  player1={player1}
                  player2={player2}
                />
              </div>
            ) : null}
          </div>

          <p className="text-center text-xs text-gray-500 py-4">
            Data via ESPN API
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-600 font-medium">
          Select two players to compare their stats.
        </p>
      )}
    </div>
  );
};

export default NflPlayerComparison;
