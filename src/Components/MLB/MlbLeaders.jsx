import { useState, useEffect } from "react";
import { fetchMlbLeaders, fetchMlbTeams } from "../../api/mlb";
import { fetchChadwickPlayerId } from "../../api/chadwick";

const MlbLeaders = () => {
  const [statLeaders, setStatLeaders] = useState([]);
  const [allLeaders, setAllLeaders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null); // New: For date validation errors
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
  const [teamMap, setTeamMap] = useState(new Map()); // New: Map team ID to abbrev
  const [selectedCategory, setSelectedCategory] = useState(""); // Default to empty
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [preset, setPreset] = useState("custom");
  const [hittingFirst, setHittingFirst] = useState(true); // New state for toggle
  const limit = 10;

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
    const loadTeamMap = async () => {
      try {
        const teams = await fetchMlbTeams(year);
        const map = new Map(teams.map((t) => [t.id, t.abbreviation]));
        setTeamMap(map);
      } catch (err) {
        console.error("Failed to load team map:", err);
      }
    };
    loadTeamMap();
  }, [year]);

  const handlePlayerClick = async (playerId) => {
    if (!playerId) return;
    try {
      const chadwickId = await fetchChadwickPlayerId(playerId);
      if (chadwickId) {
        const url = `https://www.baseball-reference.com/players/${chadwickId.charAt(
          0
        )}/${chadwickId}.shtml`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to fetch Chadwick ID:", err);
    }
  };

  const fetchLeaders = async () => {
    setLoading(true);
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    setError(null);
    const leagueFilter =
      selectedLeague === "MLB" ? "qualified" : selectedLeague; // Standardized for qualified leaders
    const statType = useDateRange ? "byDateRange" : "season";
    const season = useDateRange ? undefined : year;

    try {
      if (selectedCategory === "all") {
        const fetches = categories.map(async (cat) => {
          const players = await fetchMlbLeaders({
            playerPool: leagueFilter,
            useDateRange,
            gameType,
            group: cat.group,
            sortStat: cat.sortStat,
            order: cat.order,
            season,
            statType,
            limit,
            offset: 0,
            startDate,
            endDate,
          });
          const newLeaders = players
            .map((player) => ({
              name: player.player?.fullName || "Unknown",
              team: player.team?.id ? teamMap.get(player.team.id) : "-",
              value: player.stat?.[cat.valueKey],
              playerId: player.player?.id,
            }))
            .filter((p) => p.value !== null && p.value !== undefined);
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
          playerPool: leagueFilter,
          useDateRange,
          gameType,
          group: cat.group,
          sortStat: cat.sortStat,
          order: cat.order,
          season,
          statType,
          limit,
          offset,
          startDate,
          endDate,
        });
        const newLeaders = players
          .map((player) => ({
            name: player.player?.fullName || "Unknown",
            team: player.team?.id ? teamMap.get(player.team.id) : "-",
            value: player.stat?.[cat.valueKey],
            playerId: player.player?.id,
          }))
          .filter((p) => p.value !== null && p.value !== undefined);
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

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const toggleOrder = () => {
    setHittingFirst(!hittingFirst);
  };

  const renderTable = (cat, leaders, idxOffset = 0) => {
    return (
      <div key={cat.sortStat} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="flex justify-between items-center bg-indigo-100 py-3 px-6">
              <div className="text-lg font-bold text-indigo-900">ckstats</div>
              <h2 className="text-xl font-semibold text-indigo-900">{cat.displayName}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {cat.displayName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, idx) => (
                    <tr
                      key={idx}
                      className={`transition duration-150 ease-in-out ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {idx + 1 + idxOffset}
                      </td>
                      <td className="px-6 py-4">
                        {/* Team logo can be added here if desired */}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {leader.playerId && (
                            <img
                              src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic-sit:headshot:67:current.png/w_213,q_auto:best/v1/people/${leader.playerId}/headshot/67/current`}
                              alt={`${leader.name} headshot`}
                              className="w-12 h-12 rounded-full mr-3 object-cover"
                            />
                          )}
                          <button
                            onClick={() => handlePlayerClick(leader.playerId)}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline text-left font-medium"
                            disabled={!leader.playerId}
                            title={
                              leader.playerId
                                ? "View on Baseball-Reference"
                                : "Player ID not available"
                            }
                          >
                            {leader.name || "Unknown"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {leader.team || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {leader.value || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-500 px-6 py-3">
              Data via MLB Stats API © MLBAM
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <p className="text-center text-red-600 font-medium">{error}</p>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      {validationError && (
        <p className="text-center text-red-600 font-medium mb-4">{validationError}</p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-indigo-900 text-center">MLB Leaders</h2>
      <div className="flex flex-wrap items-center justify-center space-x-4 text-sm">
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
      </div>
      <div className="flex items-center justify-center space-x-4">
        <label className="whitespace-nowrap font-medium text-gray-800">Filter by League: </label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          <option value="MLB">MLB Overall</option>
          <option value="AL">American League (AL)</option>
          <option value="NL">National League (NL)</option>
        </select>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <label className="whitespace-nowrap font-medium text-gray-800">Select Stat: </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
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
      {!selectedCategory ? (
        <p className="text-center text-gray-600 font-medium">
          Select a stat to view leaders.
        </p>
      ) : loading ? (
        <p className="text-center text-gray-600 font-medium">Loading leaders...</p>
      ) : selectedCategory === "all" ? (
        Object.keys(allLeaders).length === 0 ? (
          <p className="text-center text-gray-600 font-medium">
            No leaders data available for this selection.
          </p>
        ) : (
          <>
            <div className="space-y-8">
              {hittingFirst
                ? [...hittingCategories, ...pitchingCategories].map((cat) => {
                    const leaders = allLeaders[cat.sortStat] || [];
                    if (leaders.length === 0) return null;
                    return renderTable(cat, leaders);
                  })
                : [...pitchingCategories, ...hittingCategories].map((cat) => {
                    const leaders = allLeaders[cat.sortStat] || [];
                    if (leaders.length === 0) return null;
                    return renderTable(cat, leaders);
                  })}
            </div>
            <div className="flex justify-center p-4">
              <button
                onClick={toggleOrder}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out hover:scale-105"
              >
                {hittingFirst ? "View Pitching First" : "View Hitting First"}
              </button>
            </div>
          </>
        )
      ) : statLeaders.length === 0 ? (
        <p className="text-center text-gray-600 font-medium">
          No leaders data available for this selection.
        </p>
      ) : (
        <div className="space-y-8">
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out hover:scale-105"
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
