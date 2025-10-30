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
    return <p className="text-center text-gray-600 font-medium">Loading scores...</p>;
  if (error && !detailsError)
    return <p className="text-center text-red-600 font-medium">{error}</p>;
  if (detailsError)
    return <p className="text-center text-red-600 font-medium">{detailsError}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">
          NFL Scores - {getWeekTitle()}
        </h2>
        <p className="text-center text-xs text-gray-500 py-4">
          Data courtesy of ESPN API © ESPN Enterprises, Inc.
        </p>
        <WeekSelector
          selectedWeekStart={selectedWeekStart}
          onWeekStartChange={setSelectedWeekStart}
        />
        {games.length === 0 ? (
          <p className="text-center text-gray-600 font-medium">No games this week.</p>
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
    </div>
  );
};

export default NflScores;
