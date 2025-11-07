import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NhlStandings from "./NhlStandings";
import NhlScores from "./NhlScores";
import NhlLeaders from "./NhlLeaders";
import NhlPlayerComparison from "./NhlPlayerComparison";
import NhlTeamComparison from "./NhlTeamComparison";

const NhlPage = () => {
  const { view: paramView } = useParams();
  const currentView = paramView || "scores";
  const navigate = useNavigate();
  const title = "NHL";
  const league = "nhl"; // Hardcode for nhl

  // Redirect if invalid view
  useEffect(() => {
    const validViews = [
      "standings",
      "scores",
      "leaders",
      "comparison",
      "teamcomparison",
    ];
    if (!validViews.includes(currentView)) {
      navigate("/nhl/standings", { replace: true });
    }
  }, [currentView, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        <button
          onClick={() => navigate("/nhl/scores")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "scores" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Scores
        </button>
        <button
          onClick={() => navigate("/nhl/standings")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "standings"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Standings
        </button>
        <button
          onClick={() => navigate("/nhl/leaders")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "leaders" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Leaders
        </button>
        <button
          onClick={() => navigate("/nhl/comparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "comparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Player Comparison
        </button>
        <button
          onClick={() => navigate("/nhl/teamcomparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "teamcomparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Team Comparison
        </button>
      </div>
      {currentView === "standings" && <NhlStandings league={league} />}
      {currentView === "scores" && <NhlScores league={league} />}
      {currentView === "leaders" && <NhlLeaders league={league} />}
      {currentView === "comparison" && <NhlPlayerComparison league={league} />}
      {currentView === "teamcomparison" && (
        <NhlTeamComparison league={league} />
      )}
    </div>
  );
};
export default NhlPage;
