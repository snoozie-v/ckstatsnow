// New NflPage.jsx (similar structure, but will use NFL-specific components)
// Place this in ./components/NflPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NflStandings from "./NflStandings";
import NflScores from "./NflScores";
import NflLeaders from "./NflLeaders";
import NflPlayerComparison from "./NflPlayerComparison";
import NflTeamComparison from "./NflTeamComparison";

const NflPage = () => {
  const { view: paramView } = useParams();
  const currentView = paramView || "scores";
  const navigate = useNavigate();
  const title = "NFL";

  // Redirect if invalid view
  useEffect(() => {
    const validViews = [
      "standings",
      "scores",
      "leaders",
      "player-comparison",
      "team-comparison",
    ];
    if (!validViews.includes(currentView)) {
      navigate("/nfl/standings", { replace: true });
    }
  }, [currentView, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        <button
          onClick={() => navigate("/nfl/scores")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "scores" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Scores
        </button>
        <button
          onClick={() => navigate("/nfl/standings")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "standings"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Standings
        </button>
        <button
          onClick={() => navigate("/nfl/leaders")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "leaders" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Leaders
        </button>
        <button
          onClick={() => navigate("/nfl/player-comparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "player-comparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Player Comparison
        </button>
        <button
          onClick={() => navigate("/nfl/team-comparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "team-comparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Team Comparison
        </button>
      </div>
      {currentView === "standings" && <NflStandings />}
      {currentView === "scores" && <NflScores />}
      {currentView === "leaders" && <NflLeaders />}
      {currentView === "player-comparison" && <NflPlayerComparison />}
      {currentView === "team-comparison" && <NflTeamComparison />}
    </div>
  );
};

export default NflPage;
