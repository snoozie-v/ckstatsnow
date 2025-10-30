import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NbaStandings from "./NbaStandings";
import NbaScores from "./NbaScores";
import NbaLeaders from "./NbaLeaders";
import NbaPlayerComparison from "./NbaPlayerComparison";
import NbaTeamComparison from "./NbaTeamComparison";

const NbaPage = () => {
  const { view: paramView } = useParams();
  const currentView = paramView || "standings";
  const navigate = useNavigate();
  const title = "NBA";
  const league = "nba";

  useEffect(() => {
    const validViews = [
      "standings",
      "scores",
      "leaders",
      "comparison",
      "teamcomparison",
    ];
    if (!validViews.includes(currentView)) {
      navigate("/nba/standings", { replace: true });
    }
  }, [currentView, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        <button
          onClick={() => navigate("/nba/standings")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "standings"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Standings
        </button>
        <button
          onClick={() => navigate("/nba/scores")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "scores" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Scores
        </button>
        <button
          onClick={() => navigate("/nba/leaders")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "leaders" ? "bg-sky-600 text-white" : "bg-gray-200"
          }`}
        >
          Leaders
        </button>
        <button
          onClick={() => navigate("/nba/comparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "comparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Player Comparison
        </button>
        <button
          onClick={() => navigate("/nba/teamcomparison")}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            currentView === "teamcomparison"
              ? "bg-sky-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Team Comparison
        </button>
      </div>
      {currentView === "standings" && <NbaStandings league={league} />}
      {currentView === "scores" && <NbaScores league={league} />}
      {currentView === "leaders" && <NbaLeaders league={league} />}
      {currentView === "comparison" && <NbaPlayerComparison league={league} />}
      {currentView === "teamcomparison" && (
        <NbaTeamComparison league={league} />
      )}
    </div>
  );
};

export default NbaPage;
