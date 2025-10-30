import { useState, useEffect } from "react";
import axios from "axios";

const NhlStandings = ({ league }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      if (league === "nhl") {
        const date = new Date().toISOString().split('T')[0]; 
        const url = `/nhl-api/v1/standings/${date}`;
        const response = await axios.get(url);
        setData(response.data.standings || []);
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
    const interval = setInterval(fetchStandings, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [league]);

  if (loading) {
    return <p className="text-center text-gray-600 font-medium">Loading standings...</p>;
  }
  if (error) {
    return <p className="text-center text-red-600 font-medium">{error}</p>;
  }
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-600 font-medium">No standings data available.</p>
    );
  }

  // Group by conference, then by division
  const conferences = data.reduce((acc, team) => {
    const conferenceName = team.conferenceName || "Unknown Conference";
    const divisionName = team.divisionName || "Unknown Division";

    if (!acc[conferenceName]) {
      acc[conferenceName] = {};
    }
    if (!acc[conferenceName][divisionName]) {
      acc[conferenceName][divisionName] = [];
    }
    acc[conferenceName][divisionName].push(team);
    return acc;
  }, {});

  // ESPN logo abbreviation overrides for specific teams
  const logoAbbrevMap = {
    SJS: 'sj',
    LAK: 'la',
    TBL: 'tb',
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      {Object.entries(conferences).map(([conferenceName, divisions]) => (
        <div key={conferenceName} className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">
            {conferenceName} Conference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(divisions).map(([divisionName, teams]) => (
              <div
                key={divisionName}
                className="bg-white shadow-xl rounded-2xl overflow-hidden"
              >
                <h3 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">
                  {divisionName}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="w-3/5 px-4 py-3 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          GP
                        </th>
                        <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          W
                        </th>
                        <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          L
                        </th>
                        <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          OT
                        </th>
                        <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teams.map((team, index) => {
                        const apiAbbrev = team.teamAbbrev.default;
                        const logoAbbrev = logoAbbrevMap[apiAbbrev] || apiAbbrev.toLowerCase();
                        return (
                          <tr
                            key={apiAbbrev}
                            className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition duration-150 ease-in-out`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                              <img
                                src={`https://a.espncdn.com/i/teamlogos/nhl/500/${logoAbbrev}.png`}
                                alt={`${team.teamName.default} logo`}
                                className="w-12 h-12 mr-3 flex-shrink-0"
                              />
                              <span className="text-base font-semibold text-gray-900 truncate">
                                {team.teamName.default}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                              {team.gamesPlayed}
                            </td>
                            <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                              {team.wins}
                            </td>
                            <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                              {team.losses}
                            </td>
                            <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                              {team.otLosses}
                            </td>
                            <td className="px-2 py-3 text-center text-base font-bold text-indigo-900">
                              {team.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NhlStandings;
