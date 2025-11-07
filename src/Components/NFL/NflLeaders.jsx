import { useState, useEffect, useRef } from "react";
import { fetchNflFantasyLeaders } from "../../api/espn";

const NflLeaders = () => {
  const [allLeaders, setAllLeaders] = useState({});
  const [statLeaders, setStatLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [selectedConference, setSelectedConference] = useState("NFL");
  const year = "2025";
  const [useWeekRange, setUseWeekRange] = useState(false);
  const [startWeek, setStartWeek] = useState(1);
  const [endWeek, setEndWeek] = useState(18);
  const [tempStartWeek, setTempStartWeek] = useState(1);
  const [tempEndWeek, setTempEndWeek] = useState(18);
  const [seasonType, setSeasonType] = useState("2"); // 2: Regular, 3: Postseason
  const [selectedCategory, setSelectedCategory] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [rangeApplied, setRangeApplied] = useState(false);
  const limit = 10;
  const cache = useRef(new Map());

  const categories = [
    {
      sortStat: "passingYards",
      displayName: "Passing Yards",
      statId: "3",
      group: "passing",
      order: "desc",
    },
    {
      sortStat: "passingTouchdowns",
      displayName: "Passing Touchdowns",
      statId: "4",
      group: "passing",
      order: "desc",
    },
    {
      sortStat: "rushingYards",
      displayName: "Rushing Yards",
      statId: "24",
      group: "rushing",
      order: "desc",
    },
    {
      sortStat: "rushingTouchdowns",
      displayName: "Rushing Touchdowns",
      statId: "25",
      group: "rushing",
      order: "desc",
    },
    {
      sortStat: "receivingYards",
      displayName: "Receiving Yards",
      statId: "42",
      group: "receiving",
      order: "desc",
    },
    {
      sortStat: "receivingTouchdowns",
      displayName: "Receiving Touchdowns",
      statId: "43",
      group: "receiving",
      order: "desc",
    },
    {
      sortStat: "receptions",
      displayName: "Receptions",
      statId: "53",
      group: "receiving",
      order: "desc",
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

  const conferenceTeams = {
    AFC: [2, 15, 17, 20, 33, 4, 5, 23, 34, 11, 30, 10, 7, 12, 24, 13],
    NFC: [22, 1, 29, 3, 6, 8, 9, 14, 16, 18, 19, 21, 25, 26, 27, 28],
  };

  useEffect(() => {
    const maxWeek = seasonType === "2" ? 18 : 4;
    setStartWeek(1);
    setEndWeek(maxWeek);
    setTempStartWeek(1);
    setTempEndWeek(maxWeek);
    setRangeApplied(false);
  }, [seasonType]);

  useEffect(() => {
    setTempStartWeek(startWeek);
    setTempEndWeek(endWeek);
  }, [useWeekRange, startWeek, endWeek]);

  const applyWeekRange = () => {
    setValidationError(null);
    if (tempStartWeek > tempEndWeek) {
      setValidationError("Start week must be before or equal to end week.");
      return;
    }
    if (!tempStartWeek || !tempEndWeek) {
      setValidationError("Please select valid start and end weeks.");
      return;
    }
    setStartWeek(tempStartWeek);
    setEndWeek(tempEndWeek);
    setRangeApplied(true);
  };

  const handlePlayerClick = (playerId) => {
    if (!playerId) return;
    const url = `https://www.espn.com/nfl/player/_/id/${playerId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fetchLeaders = async () => {
    setLoading(true);
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    if (useWeekRange && !rangeApplied) {
      setLoading(false);
      return;
    }
    setError(null);

    try {
      let players = [];

      const typePrefix = seasonType === "3" ? "03" : "02";
      const seasonStatId = seasonType === "3" ? "10" + year : "00" + year;

      if (!useWeekRange) {
        const cacheKey = `${year}-${seasonType}-0`;
        let response;
        if (cache.current.has(cacheKey)) {
          response = cache.current.get(cacheKey);
        } else {
          response = await fetchNflFantasyLeaders(year, 0, seasonType);
          cache.current.set(cacheKey, response);
        }
        players = (response || [])
          .map((p) => {
            const seasonStats = p.stats?.find((s) => s.id === seasonStatId) || {};
            return { ...p, stats: seasonStats.stats || {} };
          })
          .filter((p) => p.fullName && !p.fullName.endsWith(" TQB"));
      } else {
        if (startWeek > endWeek) {
          throw new Error("Invalid week range.");
        }

        const weeklyFetches = [];
        for (let w = startWeek; w <= endWeek; w++) {
          const cacheKey = `${year}-${seasonType}-${w}`;
          if (cache.current.has(cacheKey)) {
            weeklyFetches.push({
              week: w,
              promise: Promise.resolve(cache.current.get(cacheKey))
            });
          } else {
            const promise = fetchNflFantasyLeaders(year, w, seasonType).then(res => {
              cache.current.set(cacheKey, res);
              return res;
            });
            weeklyFetches.push({
              week: w,
              promise
            });
          }
        }

        const weeklyResults = await Promise.all(weeklyFetches.map(f => f.promise));

        const allWeeklyStats = [];
        weeklyFetches.forEach((f, index) => {
          const weeklyResponse = weeklyResults[index];
          const weekId = typePrefix + f.week.toString().padStart(2, "0") + year;
          allWeeklyStats.push(
            (weeklyResponse || []).map((p) => {
              const weekStats = p.stats?.find((s) => s.id === weekId) || {};
              return { ...p, stats: weekStats.stats || {} };
            })
          );
        });

        if (startWeek === endWeek) {
          // Optimization for single week: no need to sum
          players = allWeeklyStats[0].filter((p) => p.fullName && !p.fullName.endsWith(" TQB"));
        } else {
          const playerStatsSum = new Map();
          allWeeklyStats.forEach((weekly) => {
            weekly.forEach((p) => {
              if (!p.id) return;
              const currentSum = playerStatsSum.get(p.id) || {};
              Object.entries(p.stats).forEach(([key, value]) => {
                currentSum[key] = (parseFloat(currentSum[key]) || 0) + (parseFloat(value) || 0);
              });
              playerStatsSum.set(p.id, currentSum);
            });
          });

          playerStatsSum.forEach((stats, id) => {
            const playerInfo = allWeeklyStats.flat().find((p) => p.id === id) || {};
            players.push({ ...playerInfo, stats });
          });
        }
      }

      // Filter by conference if not NFL
      if (selectedConference !== "NFL") {
        players = players.filter((p) => conferenceTeams[selectedConference].includes(p.proTeamId));
      }

      // Process data
      if (selectedCategory === "all") {
        const newAllLeaders = {};
        categories.forEach((cat) => {
          const sorted = [...players]
            .filter((player) => parseFloat(player.stats[cat.statId] || 0) > 0)
            .sort(
              (a, b) =>
                (cat.order === "desc" ? -1 : 1) * (parseFloat(a.stats[cat.statId] || 0) - parseFloat(b.stats[cat.statId] || 0))
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
              (cat.order === "desc" ? -1 : 1) * (parseFloat(a.stats[cat.statId] || 0) - parseFloat(b.stats[cat.statId] || 0))
          );

        const newLeaders = sorted
          .slice(offset, offset + limit)
          .map((player) => ({
            name: player.fullName,
            team: teamMap[player.proTeamId] || "-",
            value: player.stats[cat.statId] || "0",
            playerId: player.id,
          }));

        setStatLeaders((prev) => offset === 0 ? newLeaders : [...prev, ...newLeaders]);
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
    selectedConference,
    useWeekRange,
    startWeek,
    endWeek,
    seasonType,
    selectedCategory,
    rangeApplied,
  ]);

  useEffect(() => {
    if (offset > 0) {
      fetchLeaders();
    }
  }, [offset]);

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const renderTable = (cat, leaders, idxOffset = 0) => {
    return (
      <div key={cat.sortStat} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="flex justify-between items-center bg-blue-100 py-3 px-6">
              <div className="text-lg font-bold text-blue-900">ckstats</div>
              <h2 className="text-xl font-semibold text-blue-900">{cat.displayName}</h2>
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
                      className={`transition duration-150 ease-in-out ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {idx + 1 + idxOffset}
                      </td>
                      <td className="px-6 py-4">
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {leader.playerId && (
                            <img
                              src={`https://a.espncdn.com/i/headshots/nfl/players/full/${leader.playerId}.png`}
                              alt={`${leader.name} headshot`}
                              className="w-12 h-12 rounded-full mr-3 object-cover"
                            />
                          )}
                          <button
                            onClick={() => handlePlayerClick(leader.playerId)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-left font-medium"
                            disabled={!leader.playerId}
                            title={
                              leader.playerId
                                ? "View on ESPN"
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
              Data via ESPN API
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <p className="text-center text-red-600 font-medium">{error}</p>;

  const maxWeek = seasonType === "2" ? 18 : 4;

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      {validationError && (
        <p className="text-center text-red-600 font-medium mb-4">{validationError}</p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-blue-900 text-center">NFL Leaders</h2>
      <div className="flex flex-wrap items-center justify-center space-x-4 text-sm">
        <label className="whitespace-nowrap font-medium text-gray-800">Game Type: </label>
        <select
          value={seasonType}
          onChange={(e) => setSeasonType(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          <option value="2">Regular Season</option>
          <option value="3">Postseason</option>
        </select>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <label className="whitespace-nowrap font-medium text-gray-800">Filter by Conference: </label>
        <select
          value={selectedConference}
          onChange={(e) => setSelectedConference(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          <option value="NFL">NFL Overall</option>
          <option value="AFC">American Football Conference (AFC)</option>
          <option value="NFC">National Football Conference (NFC)</option>
        </select>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <label className="whitespace-nowrap font-medium text-gray-800">Select Stat: </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
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
        <label className="text-sm font-medium text-gray-800">Filter by Week Range:</label>
        <input
          type="checkbox"
          checked={useWeekRange}
          onChange={(e) => {
            setUseWeekRange(e.target.checked);
            setRangeApplied(false);
          }}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
      {useWeekRange && (
        <div className="flex justify-center space-x-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Start Week:
            </label>
            <select
              value={tempStartWeek}
              onChange={(e) => setTempStartWeek(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              End Week:
            </label>
            <select
              value={tempEndWeek}
              onChange={(e) => setTempEndWeek(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
            >
              {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={applyWeekRange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-6 hover:bg-blue-700 transition duration-150 ease-in-out hover:scale-105"
          >
            Apply
          </button>
        </div>
      )}
      {!selectedCategory ? (
        <p className="text-center text-gray-600 font-medium">
          Select a stat to view leaders.
        </p>
      ) : loading ? (
        <p className="text-center text-gray-600 font-medium">Loading leaders... This may take a moment as we fetch data from ESPN.</p>
      ) : useWeekRange && !rangeApplied ? (
        <p className="text-center text-gray-600 font-medium">
          Please apply the week range to view leaders.
        </p>
      ) : selectedCategory === "all" ? (
        Object.keys(allLeaders).length === 0 ? (
          <p className="text-center text-gray-600 font-medium">
            No leaders data available for this selection.
          </p>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => {
              const leaders = allLeaders[cat.sortStat] || [];
              if (leaders.length === 0) return null;
              return renderTable(cat, leaders);
            })}
          </div>
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
            0
          )}
        </div>
      )}
      {hasMore && selectedCategory && selectedCategory !== "all" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out hover:scale-105"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NflLeaders;
