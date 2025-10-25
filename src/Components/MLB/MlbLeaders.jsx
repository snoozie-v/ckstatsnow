import { useState, useEffect } from "react";
import { fetchMlbLeaders } from "../../api/mlb";
import { fetchChadwickIdMap } from "../../api/chadwick";

const MlbLeaders = () => {
  const [statLeaders, setStatLeaders] = useState([]);
  const [allLeaders, setAllLeaders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("MLB");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState(
    `${new Date().getFullYear()}-04-01`
  );
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-10-01`);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [gameType, setGameType] = useState("R");
  const [idMap, setIdMap] = useState(new Map());
  const [idMapError, setIdMapError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Default to empty
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const teamAbbrevMap = new Map([
    [108, 'LAA'],
    [109, 'ARI'],
    [110, 'BAL'],
    [111, 'BOS'],
    [112, 'CHC'],
    [113, 'CIN'],
    [114, 'CLE'],
    [115, 'COL'],
    [116, 'DET'],
    [117, 'HOU'],
    [118, 'KC'],
    [119, 'LAD'],
    [120, 'WSH'],
    [121, 'NYM'],
    [133, 'OAK'],
    [134, 'PIT'],
    [135, 'SD'],
    [136, 'SEA'],
    [137, 'SF'],
    [138, 'STL'],
    [139, 'TB'],
    [140, 'TEX'],
    [141, 'TOR'],
    [142, 'MIN'],
    [143, 'PHI'],
    [144, 'ATL'],
    [145, 'CWS'],
    [146, 'MIA'],
    [147, 'NYY'],
    [158, 'MIL'],
  ]);

  const hittingCategories = [
    {
      sortStat: "homeRuns",
      displayName: "Home Runs",
      valueKey: "homeRuns",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "avg",
      displayName: "Batting Average",
      valueKey: "avg",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "rbi",
      displayName: "Runs Batted In",
      valueKey: "rbi",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "hits",
      displayName: "Hits",
      valueKey: "hits",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "doubles",
      displayName: "Doubles",
      valueKey: "doubles",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "triples",
      displayName: "Triples",
      valueKey: "triples",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "stolenBases",
      displayName: "Stolen Bases",
      valueKey: "stolenBases",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "obp",
      displayName: "On-Base Percentage",
      valueKey: "obp",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "slg",
      displayName: "Slugging Percentage",
      valueKey: "slg",
      group: "hitting",
      order: "desc",
    },
    {
      sortStat: "ops",
      displayName: "OPS",
      valueKey: "ops",
      group: "hitting",
      order: "desc",
    },
  ];

  const pitchingCategories = [
    {
      sortStat: "wins",
      displayName: "Wins",
      valueKey: "wins",
      group: "pitching",
      order: "desc",
    },
    {
      sortStat: "era",
      displayName: "ERA",
      valueKey: "era",
      group: "pitching",
      order: "asc",
    },
    {
      sortStat: "strikeOuts",
      displayName: "Strikeouts",
      valueKey: "strikeOuts",
      group: "pitching",
      order: "desc",
    },
    {
      sortStat: "saves",
      displayName: "Saves",
      valueKey: "saves",
      group: "pitching",
      order: "desc",
    },
    {
      sortStat: "whip",
      displayName: "WHIP",
      valueKey: "whip",
      group: "pitching",
      order: "asc",
    },
    {
      sortStat: "inningsPitched",
      displayName: "Innings Pitched",
      valueKey: "inningsPitched",
      group: "pitching",
      order: "desc",
    },
  ];

  const categories = [...hittingCategories, ...pitchingCategories];

  useEffect(() => {
const loadIdMap = async () => {
  const cachedMap = localStorage.getItem('chadwickIdMap');
  if (cachedMap) {
    try {
      const entries = JSON.parse(cachedMap);
      setIdMap(new Map(entries));
      console.log("idMap loaded from cache, size:", entries.length);
      return; // Exit early if cache hit
    } catch (err) {
      console.error("Failed to load cached idMap:", err);
    }
  }

  try {
    const map = await fetchChadwickIdMap();
    setIdMap(map);
    localStorage.setItem('chadwickIdMap', JSON.stringify(Array.from(map.entries())));
    console.log("idMap loaded successfully and cached, size:", map.size);
  } catch (err) {
    const errorMsg = "Failed to fetch or parse ID map: " + err.message;
    setIdMapError(errorMsg);
    console.error(errorMsg, err);
  }
};
    loadIdMap();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      let leagueId = "";
      if (selectedLeague === "AL") {
        leagueId = "103";
      } else if (selectedLeague === "NL") {
        leagueId = "104";
      } else {
        leagueId = "103,104";
      }

      let stats = "season";
      let playerPool = gameType === "R" && !useDateRange ? "qualified" : "all";
      if (useDateRange) {
        stats = "byDateRange";
      }

      if (selectedCategory === "all") {
        const fetches = categories.map(async (cat) => {
          const players = await fetchMlbLeaders({
            gameType,
            group: cat.group,
            sortStat: cat.sortStat,
            order: cat.order,
            season: year,
            limit,
            offset: 0,
            stats,
            playerPool,
            startDate: useDateRange ? startDate : undefined,
            endDate: useDateRange ? endDate : undefined,
            leagueId,
          });
          const newLeaders = players.map((player) => ({
            name: player.playerFullName,
            team: player.teamAbbrev,
            value: player[cat.valueKey],
            playerId: player.playerId,
          }));
          return { sortStat: cat.sortStat, leaders: newLeaders };
        });
        const results = await Promise.all(fetches);
        const newAllLeaders = {};
        results.forEach((result) => {
          newAllLeaders[result.sortStat] = result.leaders;
        });
        setAllLeaders(newAllLeaders);
        setStatLeaders([]);
        setHasMore(false);
      } else {
        const cat = categories.find((c) => c.sortStat === selectedCategory);
        if (!cat) {
          throw new Error("Selected category not found");
        }
        const players = await fetchMlbLeaders({
          gameType,
          group: cat.group,
          sortStat: cat.sortStat,
          order: cat.order,
          season: year,
          limit,
          offset,
          stats,
          playerPool,
          startDate: useDateRange ? startDate : undefined,
          endDate: useDateRange ? endDate : undefined,
          leagueId,
        });
        const newLeaders = players.map((player) => ({
          name: player.playerFullName,
          team: player.teamAbbrev,
          value: player[cat.valueKey],
          playerId: player.playerId,
        }));
        setStatLeaders((prev) =>
          offset === 0 ? newLeaders : [...prev, ...newLeaders]
        );
        setHasMore(newLeaders.length === limit);
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
    setOffset(0);
    setStatLeaders([]);
    setAllLeaders({});
    setHasMore(true);
    
    fetchLeaders();
    const interval = setInterval(fetchLeaders, 300000);
    return () => clearInterval(interval);
  }, [
    selectedLeague,
    year,
    useDateRange,
    startDate,
    endDate,
    gameType,
    selectedCategory,
  ]);

  useEffect(() => {
    if (offset > 0) {
      fetchLeaders();
    }
  }, [offset]);

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

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const renderTable = (cat, leaders, idxOffset = 0) => {
    return (
      <div key={cat.sortStat} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-blue-100 py-2 px-4">
              <div className="text-lg font-bold text-blue-900">ckstats</div>
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
                  {leaders.map((leader, idx) => {
                    const hasMapping =
                      leader.playerId && idMap.has(leader.playerId);
                    if (!hasMapping && leader.playerId) {
                      console.log(
                        `No mapping found for player: ${leader.name} (ID: ${leader.playerId})`
                      );
                    }
                    return (
                      <tr key={idx}>
                        <td className="px-2 py-4 whitespace-nowrap md:px-6">
                          {idx + 1 + idxOffset}
                        </td>
                        <td className="px-2 py-4 md:px-6">
                          {leader.team && (
                            <img
                              src={`https://a.espncdn.com/i/teamlogos/mlb/500/${leader.team.toLowerCase()}.png`}
                              alt={`${leader.team} logo`}
                              className="w-6 h-6 object-contain md:w-8 md:h-8"
                            />
                          )}
                        </td>
                        <td className="px-2 py-4 md:px-6">
                          <div className="flex items-center">
                            {leader.playerId && (
                              <img
                                src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic-sit:headshot:67:current.png/w_213,q_auto:best/v1/people/${leader.playerId}/headshot/67/current`}
                                alt={`${leader.name} headshot`}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            )}
                            {hasMapping ? (
                              <a
                                href={`https://www.baseball-reference.com/players/${idMap
                                  .get(leader.playerId)
                                  .charAt(0)}/${idMap.get(
                                  leader.playerId
                                )}.shtml`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {leader.name || "Unknown"}
                              </a>
                            ) : (
                              leader.name || "Unknown"
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-4 md:px-6">
                          {leader.team || "-"}
                        </td>
                        <td className="px-2 py-4 md:px-6">
                          {leader.value || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500 px-4 py-2">
              Data via MLB Stats API © MLBAM
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div>
      {idMapError && (
        <p className="text-center text-red-600 mb-4">{idMapError}</p>
      )}
      <div className="mb-4 flex items-center justify-center">
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
      <div className="mb-4 flex items-center justify-center">
        <label htmlFor="gameTypeFilter" className="mr-2 text-lg font-medium">
          Game Type:
        </label>
        <select
          id="gameTypeFilter"
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="R">Regular Season</option>
          <option value="P">Postseason</option>
        </select>
      </div>
      <div className="mb-4 flex items-center justify-center">
        <label htmlFor="leagueFilter" className="mr-2 text-lg font-medium">
          Filter by League:
        </label>
        <select
          id="leagueFilter"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="MLB">MLB Overall</option>
          <option value="AL">American League (AL)</option>
          <option value="NL">National League (NL)</option>
        </select>
      </div>
      <div className="mb-4 flex items-center justify-center">
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
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={applyDateRange}
            className="p-2 bg-blue-500 text-white rounded mt-6"
          >
            Apply
          </button>
        </div>
      )}
      {!selectedCategory ? (
        <p className="text-center text-gray-600">
          Select a stat to view leaders.
        </p>
      ) : loading ? (
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
            offset
          )}
        </div>
      )}
      {hasMore && selectedCategory && selectedCategory !== "all" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="p-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MlbLeaders;
