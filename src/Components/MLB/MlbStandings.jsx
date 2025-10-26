import { useState, useEffect } from "react";
import axios from "axios";
import { getGradient } from "./mlbUtils";
import PlayoffMatchups from "./MlbPlayoffMatchups";

const MlbStandings = ({ league }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const leagueMap = {
    103: "AL",
    104: "NL",
  };

  const divMap = {
    200: "AL West",
    201: "AL East",
    202: "AL Central",
    203: "NL West",
    204: "NL East",
    205: "NL Central",
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

  const fetchStandings = async () => {
    try {
      setLoading(true);
      let url;
      let response;
      if (league === "mlb") {
        const year = new Date().getFullYear();
        url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason,wildCard`;
        response = await axios.get(url);
        setData(response.data.records || []); // Array of divisions and wildcards
      } else {
        throw new Error("Unsupported league");
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch standings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
    const interval = setInterval(fetchStandings, 300000);
    return () => clearInterval(interval);
  }, [league]);

  if (loading)
    return <p className="text-center text-gray-600">Loading standings...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!data || data.length === 0)
    return (
      <p className="text-center text-gray-600">No standings data available.</p>
    );

  // Filter data
  const divisionRecords = data.filter(
    (rec) => rec.standingsType === "regularSeason"
  );
  const wildCardRecords = data.filter(
    (rec) => rec.standingsType === "wildCard"
  );

  // Create team to division map
  const teamDivisionMap = {};
  divisionRecords.forEach((div) => {
    div.teamRecords.forEach((teamRec) => {
      teamDivisionMap[teamRec.team.id] = div.division.id;
    });
  });

  return (
    <div>
      <PlayoffMatchups />
      <h1 className="text-2xl font-bold mb-4">Division Standings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisionRecords.map((div) => (
          <div
            key={div.division.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <h2 className="text-xl font-semibold bg-blue-100 py-2 px-4">
              {divMap[div.division.id]}
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Team
                  </th>
                  <th>W</th>
                  <th>L</th>
                  <th>PCT</th>
                  <th>GB</th>
                </tr>
              </thead>
              <tbody>
                {div.teamRecords.map((team) => (
                  <tr
                    key={team.team.id}
                    className={team.gamesBack === "-" ? "bg-green-100" : ""}
                  >
                    <td className="px-6 py-4 flex items-center">
                      <img
                        src={`https://a.espncdn.com/i/teamlogos/mlb/500/${
                          teamAbbrevMap[team.team.id]
                        }.png`}
                        alt={`${team.team.name} logo`}
                        className="w-6 h-6 mr-2"
                      />
                      {team.team.name}
                    </td>
                    <td>{team.wins}</td>
                    <td>{team.losses}</td>
                    <td>{team.winningPercentage}</td>
                    <td>{team.gamesBack === "-" ? "-" : team.gamesBack}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold my-4">Wild Card Standings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wildCardRecords.map((wc) => (
          <div
            key={wc.league.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <h2 className="text-xl font-semibold bg-blue-100 py-2 px-4">
              {leagueMap[wc.league.id]} Wild Card
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Div
                  </th>
                  <th>W</th>
                  <th>L</th>
                  <th>PCT</th>
                  <th>WCGB</th>
                </tr>
              </thead>
              <tbody>
                {wc.teamRecords.map((team) => (
                  <tr
                    key={team.team.id}
                    className={
                      parseInt(team.wildCardRank) <= 3
                        ? "bg-green-100"
                        : "bg-red-100"
                    }
                  >
                    <td className="px-6 py-4 flex items-center">
                      <img
                        src={`https://a.espncdn.com/i/teamlogos/mlb/500/${
                          teamAbbrevMap[team.team.id]
                        }.png`}
                        alt={`${team.team.name} logo`}
                        className="w-6 h-6 mr-2"
                      />
                      {team.team.name}
                    </td>
                    <td className="px-6 py-4">
                      {divMap[teamDivisionMap[team.team.id]]}
                    </td>
                    <td>{team.wins}</td>
                    <td>{team.losses}</td>
                    <td>{team.winningPercentage}</td>
                    <td>
                      {team.wildCardGamesBack === "0.0"
                        ? "-"
                        : team.wildCardGamesBack}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MlbStandings;
