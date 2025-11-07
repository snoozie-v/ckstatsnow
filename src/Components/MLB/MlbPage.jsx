// Place this in ./components/MlbPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MlbStandings from "../MLB/MlbStandings"; // Existing MLB-compatible component
import MlbScores from "./MlbScores";
import MlbLeaders from "./MlbLeaders";
import MlbPlayerComparison from "./MlbPlayerComparison";
import MlbTeamComparison from "./MlbTeamComparison";

const MlbPage = () => {
  const { view: paramView } = useParams();
  const currentView = paramView || "scores";
  const navigate = useNavigate();
  const title = "MLB";
  const league = "mlb"; // Hardcode for MLB

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
      navigate("/mlb/standings", { replace: true });
    }
  }, [currentView, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        <button
          onClick={() => navigate("/mlb/scores")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "scores" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Scores
        </button>
        <button
          onClick={() => navigate("/mlb/standings")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "standings"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Standings
        </button>
        <button
          onClick={() => navigate("/mlb/leaders")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "leaders" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Leaders
        </button>
        <button
          onClick={() => navigate("/mlb/comparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "comparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Player Comparison
        </button>
        <button
          onClick={() => navigate("/mlb/teamcomparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "teamcomparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Team Comparison
        </button>
      </div>
      {currentView === "standings" && <MlbStandings league={league} />}
      {currentView === "scores" && <MlbScores league={league} />}
      {currentView === "leaders" && <MlbLeaders league={league} />}
      {currentView === "comparison" && <MlbPlayerComparison league={league} />}
      {currentView === "teamcomparison" && (
        <MlbTeamComparison league={league} />
      )}
    </div>
  );
};
export default MlbPage;
