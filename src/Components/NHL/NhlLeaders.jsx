import { useState, useEffect } from "react";
import { fetchNhlLeaders, fetchNhlTeams } from "../../api/nhl";
import { fetchNhlReferenceId } from "../../api/nhl"; // Placeholder

const NhlLeaders = () => {
  const [statLeaders, setStatLeaders] = useState([]);
  const [allLeaders, setAllLeaders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(`${new Date().getFullYear() - 1}${new Date().getFullYear()}`);
  const [gameType, setGameType] = useState("R");
  const [teamMap, setTeamMap] = useState(new Map());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [playerType, setPlayerType] = useState("skater"); // 'skater' or 'goalie'
  const limit = 10;

  const skaterCategories = [
    { sortStat: "points", displayName: "Points", valueKey: "points", group: "skater", order: "desc" },
    { sortStat: "goals", displayName: "Goals", valueKey: "goals", group: "skater", order: "desc" },
    { sortStat: "assists", displayName: "Assists", valueKey: "assists", group: "skater", order: "desc" },
    { sortStat: "plusMinus", displayName: "Plus/Minus", valueKey: "plusMinus", group: "skater", order: "desc" },
    { sortStat: "shots", displayName: "Shots", valueKey: "shots", group: "skater", order: "desc" },
    { sortStat: "powerPlayGoals", displayName: "Power Play Goals", valueKey: "powerPlayGoals", group: "skater", order: "desc" },
  ];

  const goalieCategories = [
    { sortStat: "wins", displayName: "Wins", valueKey: "wins", group: "goalie", order: "desc" },
    { sortStat: "savePercentage", displayName: "Save Percentage", valueKey: "savePercentage", group: "goalie", order: "desc" },
    { sortStat: "goalsAgainstAverage", displayName: "GAA", valueKey: "goalsAgainstAverage", group: "goalie", order: "asc" },
    { sortStat: "shutouts", displayName: "Shutouts", valueKey: "shutouts", group: "goalie", order: "desc" },
  ];

  const categories = playerType === 'skater' ? skaterCategories : goalieCategories;

  useEffect(() => {
    const loadTeamMap = async () => {
      try {
        const teams = await fetchNhlTeams(year);
        const map = new Map(teams.map((t) => [t.id, t.abbreviation]));
        setTeamMap(map);
      } catch (err) {
        console.error("Failed to load NHL team map:", err);
      }
    };
    loadTeamMap();
  }, [year]);

  const handlePlayerClick = async (playerId) => {
    if (!playerId) return;
    try {
      const referenceId = await fetchNhlReferenceId(playerId); // This is a placeholder
      if (referenceId) {
        const url = `https://www.hockey-reference.com/players/${referenceId.charAt(0)}/${referenceId}.html`;
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        console.log("Hockey-Reference ID not found for player ID:", playerId);
      }
    } catch (err) {
      console.error("Failed to fetch Hockey-Reference ID:", err);
    }
  };

  const fetchLeaders = async () => {
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const cat = categories.find((c) => c.sortStat === selectedCategory);
      if (!cat) {
        setStatLeaders([]);
        setLoading(false);
        return;
      }
      
      // NOTE: NHL API for leaders is different. This is a placeholder call.
      const players = await fetchNhlLeaders({
        group: cat.group,
        sortStat: cat.sortStat,
        season: year,
        limit,
        offset,
      });

      const newLeaders = players.map((player) => ({
        name: player.player?.fullName || "Unknown",
        team: player.team?.abbreviation || "-",
        value: player.stat?.[cat.valueKey],
        playerId: player.player?.id,
      })).filter(p => p.value !== null && p.value !== undefined);

      setStatLeaders((prev) => offset === 0 ? newLeaders : [...prev, ...newLeaders]);
      setHasMore(newLeaders.length === limit);
    } catch (err) {
      setError("Failed to fetch NHL leaders: " + err.message);
      console.error("Failed to fetch NHL leaders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setStatLeaders([]);
    setHasMore(true);
    if (selectedCategory) {
      fetchLeaders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, gameType, selectedCategory, playerType]);

  useEffect(() => {
    if (offset > 0) {
      fetchLeaders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const handlePlayerTypeChange = (type) => {
    setPlayerType(type);
    setSelectedCategory(''); // Reset category when switching player type
    setStatLeaders([]);
    setAllLeaders({});
  }

  return (
    // 
    <div>NHL Leaders Coming Soon</div>
  );
};

export default NhlLeaders;
