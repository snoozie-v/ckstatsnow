// Basic NflLeaders.jsx - Displays top 10 leaders in all categories for 2025 regular season NFL overall
// Place this in ./components/NFL/NflLeaders.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const NflLeaders = () => {
  const [allLeaders, setAllLeaders] = useState({}); // For 'all' view
  const [statLeaders, setStatLeaders] = useState([]); // For single category view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState(""); // Default to empty
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const categories = [
    // Adding a placeholder for the "All" option
    {
      sortStat: "passingYards",
      displayName: "Passing Yards",
      statId: "3",
      group: "passing",
    },
    {
      sortStat: "passingTouchdowns",
      displayName: "Passing Touchdowns",
      statId: "4",
      group: "passing",
    },
    {
      sortStat: "rushingYards",
      displayName: "Rushing Yards",
      statId: "24",
      group: "rushing",
    },
    {
      sortStat: "rushingTouchdowns",
      displayName: "Rushing Touchdowns",
      statId: "25",
      group: "rushing",
    },
    {
      sortStat: "receivingYards",
      displayName: "Receiving Yards",
      statId: "42",
      group: "receiving",
    },
    {
      sortStat: "receivingTouchdowns",
      displayName: "Receiving Touchdowns",
      statId: "43",
      group: "receiving",
    },
    {
      sortStat: "receptions",
      displayName: "Receptions",
      statId: "53",
      group: "receiving",
    },
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

  const processFetchedData = (players) => {
    setLoading(true);
    setError(null);
    try {
      const statEntryId = "00" + year;
      if (selectedCategory === "all") {
        const newAllLeaders = {};
        categories.forEach((cat) => {
          const sorted = [...players]
            .filter((player) => parseFloat(player.stats[cat.statId] || 0) > 0)
            .sort(
              (a, b) =>
                parseFloat(b.stats[cat.statId] || 0) -
                parseFloat(a.stats[cat.statId] || 0)
            );
          const topLeaders = sorted.slice(0, 10);
          newAllLeaders[cat.sortStat] = topLeaders.map((player) => ({
            name: player.fullName,
            team: teamMap[player.proTeamId] || "-",
            value: player.stats[cat.statId] || "0",
            playerId: player.id,
          }));
        });
        setAllLeaders(newAllLeaders);
        setStatLeaders([]);
        setHasMore(false);
      } else {
        const cat = categories.find((c) => c.sortStat === selectedCategory);
        if (!cat) throw new Error("Category not found");
        const sorted = [...players]
          .filter((player) => parseFloat(player.stats[cat.statId] || 0) > 0)
          .sort(
            (a, b) =>
              parseFloat(b.stats[cat.statId] || 0) -
              parseFloat(a.stats[cat.statId] || 0)
          );

        const newLeaders = sorted
          .slice(offset, offset + limit)
          .map((player) => ({
            name: player.fullName,
            team: teamMap[player.proTeamId] || "-",
            value: player.stats[cat.statId] || "0",
            playerId: player.id,
          }));

        setStatLeaders((prev) =>
          offset === 0 ? newLeaders : [...prev, ...newLeaders]
        );
        setHasMore(offset + limit < sorted.length);
        setAllLeaders({});
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch leaders: " + err.message);
      setLoading(false);
      console.error("Failed to fetch leaders", err);
    }
  };

  useEffect(() => {
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchAllPlayers = async () => {
      try {
        const statEntryId = "00" + year;
        const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/players?view=kona_player_info`;
        const headers = {
          "X-Fantasy-Filter": JSON.stringify({
            players: { limit: 2000, filterActive: { value: true } },
          }),
        };
        const response = await axios.get(url, { headers });
        let players = (response.data || [])
          .map((p) => {
            const seasonStats =
              p.stats?.find((s) => s.id === statEntryId) || {};
            return { ...p, stats: seasonStats.stats || {} };
          })
          .filter((p) => p.fullName && !p.fullName.endsWith(" TQB"));

        processFetchedData(players);
      } catch (err) {
        setError("Failed to fetch player data: " + err.message);
        setLoading(false);
      }
    };
    fetchAllPlayers();
  }, [year, selectedCategory, offset]);

  useEffect(() => {
    setOffset(0);
  }, [year, selectedCategory]);

  const renderTable = (cat, leaders, idxOffset = 0) => {
    return (
      <div key={cat.sortStat} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-blue-100 py-2 px-4">
              <div className="text-lg font-bold text-blue-900">NFL Stats</div>
              <h2 className="text-xl font-semibold">{cat.displayName}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead>
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">
                      Rank
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6"></th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">
                      Player
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">
                      Team
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">
                      {cat.displayName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-4 whitespace-nowrap md:px-6">
                        {idx + 1 + idxOffset}
                      </td>
                      <td className="px-2 py-4 md:px-6">
                        <img
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${leader.team.toLowerCase()}.png`}
                          alt={`${leader.team} logo`}
                          className="w-6 h-6 object-contain md:w-8 md:h-8"
                        />
                      </td>
                      <td className="px-2 py-4 md:px-6">
                        {leader.name || "Unknown"}
                      </td>
                      <td className="px-2 py-4 md:px-6">
                        {leader.team || "-"}
                      </td>
                      <td className="px-2 py-4 md:px-6">
                        {leader.value || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500 px-4 py-2">
              Data via ESPN API
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-center space-x-4">
        <div>
          <label htmlFor="yearFilter" className="mr-2 text-lg font-medium">
            Year:
          </label>
          <select
            id="yearFilter"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="categoryFilter" className="mr-2 text-lg font-medium">
            Select Stat:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              Select Stat
            </option>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.sortStat} value={cat.sortStat}>
                {cat.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCategory ? (
        <p className="text-center text-gray-600">
          Select a stat to view leaders.
        </p>
      ) : loading && offset === 0 ? (
        <p className="text-center text-gray-600">Loading leaders...</p>
      ) : selectedCategory === "all" ? (
        Object.keys(allLeaders).length === 0 ? (
          <p className="text-center text-gray-600">
            No leaders data available for this selection.
          </p>
        ) : (
          <div className="max-w-2xl mx-auto">
            {categories.map((cat) => {
              const leaders = allLeaders[cat.sortStat] || [];
              if (leaders.length === 0) return null;
              return renderTable(cat, leaders);
            })}
          </div>
        )
      ) : statLeaders.length === 0 ? (
        <p className="text-center text-gray-600">
          No leaders data available for this selection.
        </p>
      ) : (
        <div className="max-w-2xl mx-auto">
          {renderTable(
            categories.find((c) => c.sortStat === selectedCategory),
            statLeaders,
            0
          )}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setOffset((prev) => prev + limit)}
                className="p-2 bg-blue-500 text-white rounded"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NflLeaders;
