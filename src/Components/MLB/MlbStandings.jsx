import { useState, useEffect } from "react";
import axios from "axios";
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
    return (
      <p className="text-center text-gray-600 font-medium">
        Loading standings...
      </p>
    );
  if (error)
    return <p className="text-center text-red-600 font-medium">{error}</p>;
  if (!data || data.length === 0)
    return (
      <p className="text-center text-gray-600 font-medium">
        No standings data available.
      </p>
    );

  // Filter data
  const divisionRecords = data.filter(
    (rec) => rec.standingsType === "regularSeason"
  );
  const wildCardRecords = data.filter(
    (rec) => rec.standingsType === "wildCard"
  );

  const alDivisions = divisionRecords.filter((rec) => rec.league.id === 103);
  const nlDivisions = divisionRecords.filter((rec) => rec.league.id === 104);

  // Create team to division map
  const teamDivisionMap = {};
  divisionRecords.forEach((div) => {
    div.teamRecords.forEach((teamRec) => {
      teamDivisionMap[teamRec.team.id] = div.division.id;
    });
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      <PlayoffMatchups />
      <h1 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">
        Division Standings
      </h1>
      <h2 className="text-xl font-bold mb-4 text-indigo-900">
        American League
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {alDivisions.map((div) => (
          <div
            key={div.division.id}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <h3 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">
              {divMap[div.division.id]}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="w-3/5 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="w-1/12 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      W
                    </th>
                    <th className="w-1/12 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      L
                    </th>
                    {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      PCT
                    </th> */}
                    <th className="w-1/12 text-center text-sm text-indigo-900 uppercase tracking-wider">
                      GB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {div.teamRecords.map((team, index) => (
                    <tr
                      key={team.team.id}
                      className={`${
                        index === 0
                          ? "bg-indigo-50"
                          : index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } hover:bg-indigo-50 transition duration-150 ease-in-out`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                        <img
                          src={`https://a.espncdn.com/i/teamlogos/mlb/500/${
                            teamAbbrevMap[team.team.id]
                          }.png`}
                          alt={`${team.team.name} logo`}
                          className="w-12 h-12 mr-3 flex-shrink-0"
                        />
                        <span className="text-xs text-base font-semibold text-gray-900 truncate">
                          {team.team.name}
                        </span>
                      </td>
                      <td className="text-center text-base font-medium text-gray-700">
                        {team.wins}
                      </td>
                      <td className="text-center text-base font-medium text-gray-700">
                        {team.losses}
                      </td>
                      {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.winningPercentage}
                      </td> */}
                      <td className="pr-2 text-center text-base text-indigo-900">
                        {team.gamesBack === "-" ? "-" : team.gamesBack}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mb-4 text-indigo-900">
        National League
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {nlDivisions.map((div) => (
          <div
            key={div.division.id}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <h3 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">
              {divMap[div.division.id]}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="w-3/5 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="w-1/12 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      W
                    </th>
                    <th className="w-1/12 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      L
                    </th>
                    {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      PCT
                    </th> */}
                    <th className="pr-2 w-1/12 text-center text-sm text-indigo-900 uppercase tracking-wider">
                      GB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {div.teamRecords.map((team, index) => (
                    <tr
                      key={team.team.id}
                      className={`${
                        index === 0
                          ? "bg-indigo-50"
                          : index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } hover:bg-indigo-50 transition duration-150 ease-in-out`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                        <img
                          src={`https://a.espncdn.com/i/teamlogos/mlb/500/${
                            teamAbbrevMap[team.team.id]
                          }.png`}
                          alt={`${team.team.name} logo`}
                          className="w-12 h-12 mr-3 flex-shrink-0"
                        />
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {team.team.name}
                        </span>
                      </td>
                      <td className="text-center text-base font-medium text-gray-700">
                        {team.wins}
                      </td>
                      <td className=" text-center text-base font-medium text-gray-700">
                        {team.losses}
                      </td>
                      {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.winningPercentage}
                      </td> */}
                      <td className="pr-1 text-center text-base text-indigo-900">
                        {team.gamesBack === "-" ? "-" : team.gamesBack}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">
        Wild Card Standings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {wildCardRecords.map((wc) => (
          <div
            key={wc.league.id}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <h2 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">
              {leagueMap[wc.league.id]} Wild Card
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="w-3/5 px-4 py-3 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      Team
                    </th>
                    {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      Div
                    </th> */}
                    <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      W
                    </th>
                    <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      L
                    </th>
                    {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      PCT
                    </th> */}
                    <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      WCGB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wc.teamRecords.map((team, index) => (
                    <tr
                      key={team.team.id}
                      className={`${
                        parseInt(team.wildCardRank) <= 3
                          ? "bg-indigo-50"
                          : index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      } hover:bg-indigo-50 transition duration-150 ease-in-out`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                        <img
                          src={`https://a.espncdn.com/i/teamlogos/mlb/500/${
                            teamAbbrevMap[team.team.id]
                          }.png`}
                          alt={`${team.team.name} logo`}
                          className="w-12 h-12 mr-3 flex-shrink-0"
                        />
                        <span className="text-base font-semibold text-gray-900 truncate">
                          {team.team.name}
                        </span>
                      </td>
                      {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {divMap[teamDivisionMap[team.team.id]]}
                      </td> */}
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.wins}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.losses}
                      </td>
                      {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.winningPercentage}
                      </td> */}
                      <td className="px-2 py-3 text-center text-base font-bold text-indigo-900">
                        {team.wildCardGamesBack === "0.0"
                          ? "-"
                          : team.wildCardGamesBack}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MlbStandings;
