// Place this in ./components/MlbPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Standings from "../MLB/Standings"; // Existing MLB-compatible component
import Leaders from "./Leaders"; // Existing MLB-compatible component
import Scores from "./Scores"; // Existing MLB-compatible component
import PlayerComparison from "../MLB/PlayerComparison";
import TeamComparison from "../MLB/TeamComparison";

const MlbPage = () => {
  const { view: paramView } = useParams();
  const currentView = paramView || "standings";
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
          onClick={() => navigate("/mlb/scores")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "scores" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Scores
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
      {currentView === "standings" && <Standings league={league} />}
      {currentView === "scores" && <Scores league={league} />}
      {currentView === "leaders" && <Leaders league={league} />}
      {currentView === "comparison" && <PlayerComparison league={league} />}
      {currentView === "teamcomparison" && <TeamComparison league={league} />}
    </div>
  );
};

export default MlbPage;
