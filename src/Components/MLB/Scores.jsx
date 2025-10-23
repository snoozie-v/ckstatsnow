import { useState, useEffect } from "react";
import axios from "axios";
import DateSelector from "../Utilities/DateSelector";
import GameList from "./GameList";
import GameModal from "../Utilities/GameModal";
import useFetchScores from "../../hooks/useFetchScores"; // Assuming you create this hook

const Scores = () => {
  const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const { games, loading, error, selectedDate, setSelectedDate } =
    useFetchScores("baseball/mlb", getLocalDate());
  const [selectedGame, setSelectedGame] = useState(null);
  const [isWideScreen, setIsWideScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [detailsError, setDetailsError] = useState(null);

  const fetchGameDetails = async (eventId) => {
    try {
      setDetailsError(null); // Clear previous details error
      const url = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`;
      const response = await axios.get(url);
      setSelectedGame(response.data);
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
    return <p className="text-center text-gray-600">Loading scores...</p>;
  // Display the scoreboard error from the hook
  if (error && !detailsError)
    return <p className="text-center text-red-600">{error}</p>;
  // Display the game details error if it exists
  if (detailsError)
    return <p className="text-center text-red-600">{detailsError}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">MLB Scores</h2>
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
        getStatusColor={(game) => {
          const status = game.status.type.name;
          if (status === "STATUS_POSTPONED") return "bg-yellow-200";
          if (status === "STATUS_FINAL" || status === "STATUS_CANCELED")
            return "bg-gray-300";
          if (status === "STATUS_IN_PROGRESS") return "bg-green-200";
          if (status === "STATUS_SCHEDULED" || status === "STATUS_PRE")
            return "bg-blue-200";
          return "bg-gray-200";
        }}
        getStatusContent={(game) => {
          const competition = game.competitions[0];
          const away = competition.competitors.find(
            (c) => c.homeAway === "away"
          );
          const home = competition.competitors.find(
            (c) => c.homeAway === "home"
          );
          const status = game.status.type.name;
          if (status === "STATUS_FINAL" || status === "STATUS_CANCELED") {
            return `Final: ${away.score ?? "0"} - ${home.score ?? "0"}`;
          }
          if (status === "STATUS_IN_PROGRESS") {
            return `${away.score ?? "0"} - ${home.score ?? "0"}`;
          }
          if (status === "STATUS_SCHEDULED" || status === "STATUS_PRE") {
            const startTime = new Date(game.date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Chicago",
              hour12: true,
            });
            return `Starts at ${startTime} CDT`;
          }
          return "Unknown Status";
        }}
        gridLayout={isWideScreen}
        getTeamInfo={(competitor) => ({
          name: competitor.team.displayName,
          logo: `https://a.espncdn.com/i/teamlogos/mlb/500/${competitor.team.abbreviation.toLowerCase()}.png`,
        })}
      />
      <GameModal
        selectedGame={selectedGame}
        onClose={() => setSelectedGame(null)}
        getTeamInfo={(competitor) => ({
          name: competitor.team.displayName,
          logo: `https://a.espncdn.com/i/teamlogos/mlb/500/${competitor.team.abbreviation.toLowerCase()}.png`,
        })}
      >
        {/* We can add MlbGameDetails here in the future if needed */}
      </GameModal>
    </div>
  );
};

export default Scores;
