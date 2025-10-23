// Updated NflScores.jsx (fixed logo path to use team.logo from ESPN API)
// Place this in ./components/NflScores.jsx
import { useState, useEffect } from "react";
import WeekSelector from "../Utilities/WeekSelector";
import useFetchScores from "../../hooks/useFetchScores";
import { fetchGameSummary } from "../../api/espn";
import GameList from "../Utilities/GameList";
import GameModal from "../Utilities/GameModal";
import NflGameDetails from "./NflGameDetails";

const NflScores = () => {
  const getInitialWeekStart = () => {
    const today = new Date();
    const daysToThu = (today.getDay() - 4 + 7) % 7;
    const thurs = new Date(today);
    thurs.setDate(today.getDate() - daysToThu);
    const pad = (n) => String(n).padStart(2, "0");
    return `${thurs.getFullYear()}-${pad(thurs.getMonth() + 1)}-${pad(
      thurs.getDate()
    )}`;
  };

  const {
    games,
    loading,
    error,
    selectedDate: selectedWeekStart,
    setSelectedDate: setSelectedWeekStart,
  } = useFetchScores("football/nfl", getInitialWeekStart());
  const [selectedGame, setSelectedGame] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [isWideScreen, setIsWideScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getWeekTitle = () => {
    const startDate = new Date(selectedWeekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Monday for display
    const startStr = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const yearStr = startDate.getFullYear();
    return `${startStr} - ${endStr}, ${yearStr}`;
  };

  const fetchGameDetails = async (eventId) => {
    try {
      setDetailsError(null);
      const gameData = await fetchGameSummary("football/nfl", eventId);
      setSelectedGame(gameData);
    } catch (err) {
      setDetailsError("Failed to fetch game details.");
      setSelectedGame(null);
    }
  };

  const getStatusColor = (game) => {
    const status = game.status.type.name;
    if (status === "STATUS_FINAL" || status === "STATUS_CANCELED") {
      return "bg-gray-300";
    }
    if (
      status === "STATUS_IN_PROGRESS" ||
      status === "STATUS_HALFTIME" ||
      status === "STATUS_END_PERIOD"
    ) {
      return "bg-green-200";
    }
    if (status === "STATUS_SCHEDULED" || status === "STATUS_PRE") {
      return "bg-blue-200";
    }
    return "bg-gray-200";
  };

  const getStatusContent = (game) => {
    const competition = game.competitions[0];
    const away = competition.competitors.find((c) => c.homeAway === "away");
    const home = competition.competitors.find((c) => c.homeAway === "home");
    const status = game.status.type.name;

    if (status === "STATUS_FINAL" || status === "STATUS_CANCELED") {
      return `Final: ${away.score ?? "0"} - ${home.score ?? "0"}`;
    }
    if (
      status === "STATUS_IN_PROGRESS" ||
      status === "STATUS_HALFTIME" ||
      status === "STATUS_END_PERIOD"
    ) {
      const displayClock = game.status.displayClock;
      const period = game.status.period;
      return `${away.score ?? "0"} - ${home.score ?? "0"} (${
        period ? `Q${period} ` : ""
      }${displayClock})`;
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
  };

  if (loading)
    return <p className="text-center text-gray-600">Loading scores...</p>;
  if (error && !detailsError)
    return <p className="text-center text-red-600">{error}</p>;
  if (detailsError)
    return <p className="text-center text-red-600">{detailsError}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">
        NFL Scores - {getWeekTitle()}
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Data courtesy of ESPN API © ESPN Enterprises, Inc.
      </p>
      <WeekSelector
        selectedWeekStart={selectedWeekStart}
        onWeekStartChange={setSelectedWeekStart}
      />
      {games.length === 0 ? (
        <p className="text-center text-gray-600">No games this week.</p>
      ) : (
        <GameList
          games={games}
          onGameClick={fetchGameDetails}
          getStatusColor={getStatusColor}
          getStatusContent={getStatusContent}
          gridLayout={isWideScreen}
          getTeamInfo={(competitor) => ({
            name: competitor.team.displayName,
            logo: competitor.team.logo,
          })}
        />
      )}
      <GameModal
        selectedGame={selectedGame}
        onClose={() => setSelectedGame(null)}
        getTeamInfo={(competitor) => ({
          name: competitor.team.displayName,
          logo: competitor.team.logos?.[0]?.href || "", // Correct path for summary data
        })}
      >
        <NflGameDetails details={selectedGame} />
      </GameModal>
    </div>
  );
};

export default NflScores;
