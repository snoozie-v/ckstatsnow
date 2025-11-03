import { useState, useEffect } from "react";
import DateSelector from "../Utilities/DateSelector";
import GameList from "../Utilities/GameList";
import GameModal from "../Utilities/GameModal";
import useFetchScores from "../../hooks/useFetchScores";
import { fetchGameSummary } from "../../api/espn";
import NbaGameDetails from "./NbaGameDetails";

const NbaScores = () => {
  const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const { games, loading, error, selectedDate, setSelectedDate } =
    useFetchScores("basketball/nba", getLocalDate());
  const [selectedGame, setSelectedGame] = useState(null);
  const [isWideScreen, setIsWideScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [detailsError, setDetailsError] = useState(null);

  const fetchGameDetails = async (eventId) => {
    try {
      setDetailsError(null);
      const gameData = await fetchGameSummary("basketball/nba", eventId);
      setSelectedGame(gameData);
    } catch (err) {
      setDetailsError("Failed to fetch game details.");
      setSelectedGame(null);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 font-medium">Loading scores...</p>
    );
  if (error && !detailsError)
    return <p className="text-center text-red-600 font-medium">{error}</p>;
  if (detailsError)
    return (
      <p className="text-center text-red-600 font-medium">{detailsError}</p>
    );

  const getTeamInfo = (competitor) => ({
    name: competitor.team.displayName,
    logo: `https://a.espncdn.com/i/teamlogos/nba/500/${competitor.team.abbreviation.toLowerCase()}.png`,
  });

  const getStatusColor = (game) => {
    const status = game.status.type.name;
    if (status === "STATUS_POSTPONED") return "bg-yellow-200";
    if (status === "STATUS_FINAL" || status === "STATUS_CANCELED")
      return "bg-gray-300";
    if (status === "STATUS_IN_PROGRESS") return "bg-green-200";
    if (status === "STATUS_SCHEDULED" || status === "STATUS_PRE")
      return "bg-blue-200";
    return "bg-gray-200";
  };

  const getStatusContent = (game) => {
    const competition = game.competitions[0];
    const away = competition.competitors.find((c) => c.homeAway === "away");
    const home = competition.competitors.find((c) => c.homeAway === "home");
    const status = game.status.type.name;
    const detail = game.status.type.detail;

    if (status === "STATUS_POSTPONED") return "Postponed";

    if (status === "STATUS_FINAL" || status === "STATUS_CANCELED") {
      return `${detail}: ${away.score ?? "0"} - ${home.score ?? "0"}`;
    }

    if (status === "STATUS_IN_PROGRESS") {
      return `${away.score ?? "0"} - ${home.score ?? "0"} (${detail})`;
    }

    if (status === "STATUS_SCHEDULED" || status === "STATUS_PRE") {
      const startTime = new Date(game.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/New_York",
        hour12: true,
      });
      return `Starts at ${startTime} ET`;
    }

    return detail;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold tracking-tight text-indigo-900 text-center">
        NBA Scores
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Data courtesy of ESPN API © ESPN Enterprises, Inc.
      </p>
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <GameList
        games={games}
        onGameClick={fetchGameDetails}
        getStatusColor={getStatusColor}
        getStatusContent={getStatusContent}
        gridLayout={isWideScreen}
        getTeamInfo={getTeamInfo}
      />
      <GameModal
        selectedGame={selectedGame}
        onClose={() => setSelectedGame(null)}
        getTeamInfo={getTeamInfo}
      >
        {selectedGame && <NbaGameDetails game={selectedGame} />}
      </GameModal>
    </div>
  );
};

export default NbaScores;
