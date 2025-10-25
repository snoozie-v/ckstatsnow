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
  if (myNum === null || oppNum === null) return false;
  return order === "desc" ? myNum > oppNum : myNum < oppNum;
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
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for a player..."
      className="w-full p-2 border rounded mb-1"
    />
    {suggestions.length > 0 && (
      <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded z-10 absolute w-full md:w-1/2">
        {suggestions.slice(0, 5).map((p) => (
          <li
            key={p.id}
            onClick={() => selectPlayer(p)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
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
          className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
        >
          Clear
        </button>
      </p>
    )}
  </div>
);

const PlayerHeader = ({ player }) => (
  <div className="text-center bg-gray-100 p-4 rounded">
    <h3 className="text-xl font-semibold">{player.name}</h3>
    {player.id && (
      <img
        src={`https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png`}
        alt={`${player.name} headshot`}
        className="w-24 h-24 mx-auto rounded-full mb-2 bg-gray-300 object-cover"
        onError={(e) => {
          e.target.style.visibility = "hidden";
        }}
      />
    )}
    {player.team && (
      <img
        src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`}
        alt={`${player.team} logo`}
        className="w-18 h-18 mx-auto"
      />
    )}
  </div>
);

const StatsTable = ({
  title,
  categories,
  stats1,
  stats2,
  player1,
  player2,
}) => {
  if (
    !hasStatsForCategory(stats1, categories) &&
    !hasStatsForCategory(stats2, categories)
  ) {
    return null;
  }

  return (
    <div className="my-4">
      <h4 className="text-lg font-bold text-center mb-2">{title}</h4>
      <table className="w-full table-fixed divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((cat) => {
            const val1 = stats1[cat.valueKey] ?? "-";
            const val2 = stats2[cat.valueKey] ?? "-";
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
                    background: leads1
                      ? getNflGradient(player1.team)
                      : "transparent",
                  }}
                >
                  {val1}
                </td>
                <td
                  className={`text-2xl px-4 py-2 font-semibold w-1/3 text-center ${
                    leads2 ? "text-white" : "text-gray-500"
                  }`}
                  style={{
                    background: leads2
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
    </div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-blue-900">
          NFL Player Comparison
        </div>
        <div className="flex items-center space-x-2">
          <label>Year:</label>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {loading && (
        <p className="text-center text-gray-600">Loading player data...</p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}

      {player1.id && player2.id ? (
        <div className="border-4 border-sky-800">
          <div className="grid grid-cols-3">
            <div className="bg-sky-800 text-white py-4 px-6 flex items-center justify-center">
              ckstats
            </div>
            <PlayerHeader player={player1} />
            <PlayerHeader player={player2} />
          </div>

          <StatsTable
            title="Passing"
            categories={passingCategories}
            stats1={player1.stats}
            stats2={player2.stats}
            player1={player1}
            player2={player2}
          />

          <StatsTable
            title="Rushing"
            categories={rushingCategories}
            stats1={player1.stats}
            stats2={player2.stats}
            player1={player1}
            player2={player2}
          />

          <StatsTable
            title="Receiving"
            categories={receivingCategories}
            stats1={player1.stats}
            stats2={player2.stats}
            player1={player1}
            player2={player2}
          />
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Select two players to compare their stats.
        </p>
      )}
    </div>
  );
};

export default NflPlayerComparison;
