import { useState, useEffect } from "react";
import { fetchMlbPlayoffData } from "../../api/mlb";

const MlbPlayoffMatchups = () => {
  const [playoffData, setPlayoffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const leagueMap = {
    103: "AL",
    104: "NL",
  };

  const teamAbbrevMap = {
    108: "laa",
    109: "ari",
    110: "bal",
    111: "bos",
    112: "chc",
    113: "cin",
    114: "cle",
    115: "col",
    116: "det",
    117: "hou",
    118: "kc",
    119: "lad",
    120: "wsh",
    121: "nym",
    133: "oak",
    134: "pit",
    135: "sd",
    136: "sea",
    137: "sf",
    138: "stl",
    139: "tb",
    140: "tex",
    141: "tor",
    142: "min",
    143: "phi",
    144: "atl",
    145: "cws",
    146: "mia",
    147: "nyy",
    158: "mil",
  };

  const roundMap = {
    F: "Wild Card Series",
    D: "Division Series",
    L: "League Championship Series",
    W: "World Series",
  };

  const winsNeededMap = {
    F: 2,
    D: 3,
    L: 4,
    W: 4,
  };

  const fetchPlayoffData = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const series = await fetchMlbPlayoffData(year);
      setPlayoffData(series);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch playoff data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayoffData();
    const interval = setInterval(fetchPlayoffData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 font-medium">Loading playoff matchups...</p>
    );
  if (error) return <p className="text-center text-red-600 font-medium">{error}</p>;
  if (!playoffData || playoffData.length === 0)
    return (
      <p className="text-center text-gray-600 font-medium">No playoff data available.</p>
    );

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">Playoff Matchups</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {playoffData.map((seriesItem, index) => {
          if (seriesItem.games.length === 0) return null;
          const series = seriesItem.series;
          const gameType = series.gameType;
          const roundName = roundMap[gameType] || "Unknown Series";
          const winsNeeded = winsNeededMap[gameType] || 0;
          const firstGame = seriesItem.games[0];
          const homeTeam = firstGame.teams.home.team;
          const awayTeam = firstGame.teams.away.team;
          if (homeTeam.name === "TBD" && awayTeam.name === "TBD") return null;
          let homeWins = 0;
          let awayWins = 0;
          seriesItem.games.forEach((game) => {
            if (game.status.abstractGameState === "Final") {
              const winnerId = game.teams.home.isWinner
                ? game.teams.home.team.id
                : game.teams.away.team.id;
              if (winnerId === homeTeam.id) {
                homeWins++;
              } else {
                awayWins++;
              }
            }
          });
          const isOver = Math.max(homeWins, awayWins) >= winsNeeded;
          const totalWins = homeWins + awayWins;
          let statusText = " (Ongoing)";
          if (totalWins === 0) statusText = " (Upcoming)";
          else if (isOver) statusText = " (Completed)";
          let leagueId = homeTeam.league
            ? homeTeam.league.id
            : awayTeam.league
            ? awayTeam.league.id
            : null;
          const leagueName =
            gameType === "W" ? "" : leagueId ? leagueMap[leagueId] : "";
          const homeAbbrev =
            homeTeam.name !== "TBD" ? teamAbbrevMap[homeTeam.id] : null;
          const awayAbbrev =
            awayTeam.name !== "TBD" ? teamAbbrevMap[awayTeam.id] : null;
          let winnerMessage = null;
          if (isOver) {
            const winner = homeWins >= winsNeeded ? homeTeam : awayTeam;
            const loser = homeWins >= winsNeeded ? awayTeam : homeTeam;
            const seriesScore = `${Math.max(homeWins, awayWins)}-${Math.min(
              homeWins,
              awayWins
            )}`;
            winnerMessage = `${winner.teamName || winner.name} win the series ${seriesScore}`;
          }
          return (
            <div
              key={index}
              className={`bg-white shadow-xl rounded-2xl overflow-hidden p-6 ${isOver ? "bg-indigo-50" : ""} ${gameType === "W" ? "md:col-span-2" : ""}`}
            >
              <h2 className="text-xl font-semibold text-indigo-900 mb-4 text-center">
                {leagueName ? leagueName + " " : ""}
                {roundName}
                {statusText}
              </h2>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {homeAbbrev && (
                    <img
                      src={`https://a.espncdn.com/i/teamlogos/mlb/500/${homeAbbrev}.png`}
                      alt={homeTeam.name}
                      className="w-12 h-12 mr-3 flex-shrink-0"
                    />
                  )}
                  {!homeAbbrev && <span className="w-12 h-12 mr-3"></span>}
                  <span className={`text-base font-semibold text-gray-900 ${homeWins > awayWins ? "font-bold" : ""}`}>
                    {homeTeam.teamName || homeTeam.name} ({homeWins})
                  </span>
                </div>
                <span className="text-lg font-medium text-gray-700 mx-6">vs</span>
                <div className="flex items-center">
                  <span className={`text-base font-semibold text-gray-900 mr-3 ${awayWins > homeWins ? "font-bold" : ""}`}>
                    {awayTeam.teamName || awayTeam.name} ({awayWins})
                  </span>
                  {awayAbbrev && (
                    <img
                      src={`https://a.espncdn.com/i/teamlogos/mlb/500/${awayAbbrev}.png`}
                      alt={awayTeam.name}
                      className="w-12 h-12 flex-shrink-0"
                    />
                  )}
                </div>
              </div>
              {winnerMessage && (
                <p className="text-center text-base font-bold text-indigo-900">{winnerMessage}</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MlbPlayoffMatchups;
