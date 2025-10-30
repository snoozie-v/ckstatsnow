import { useState, useEffect } from "react";
import { fetchNbaStandings } from "../../api/espn";

const NbaStandings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11, September is 8, October is 9
    return now.getFullYear() + (month >= 9 ? 1 : 0);
  });

  const fetchStandingsData = async () => {
    try {
      setLoading(true);
      const standingsData = await fetchNbaStandings(year);
      setData(standingsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch standings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandingsData();
    const interval = setInterval(fetchStandingsData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [year]);

  if (loading) {
    return <p className="text-center text-gray-600">Loading standings...</p>;
  }
  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-600">No standings data available.</p>
    );
  }

  // Group by conference
  const conferences = data.reduce((acc, team) => {
    const conferenceName = team.conference || "Unknown Conference";
    if (!acc[conferenceName]) {
      acc[conferenceName] = [];
    }
    acc[conferenceName].push(team);
    return acc;
  }, {});

  // Generate years for the dropdown (last 10 seasons)
  const years = Array.from({ length: 10 }, (_, i) => year - i);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      <div className="flex justify-center">
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="p-2 border border-gray-300 rounded-lg"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y - 1}-{y} Season
            </option>
          ))}
        </select>
      </div>
      {Object.entries(conferences).map(([conferenceName, teams]) => (
        <div key={conferenceName}>
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">
            {conferenceName} Conference
          </h2>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      PCT
                    </th>
                    <th className="px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">
                      GB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map((team, index) => (
                    <tr
                      key={team.team.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-indigo-50 transition duration-150 ease-in-out`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap flex items-center">
                        <img
                          src={team.team.logos[0].href}
                          alt={`${team.team.displayName} logo`}
                          className="w-8 h-8 mr-3"
                        />
                        <span className="text-base font-semibold text-gray-900">
                          {team.team.displayName}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.stats.find((s) => s.name === "wins")?.value || 0}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.stats.find((s) => s.name === "losses")?.value ||
                          0}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.stats.find((s) => s.name === "winPercent")
                          ?.displayValue || ".000"}
                      </td>
                      <td className="px-2 py-3 text-center text-base font-medium text-gray-700">
                        {team.stats.find((s) => s.name === "gamesBehind")
                          ?.displayValue || "0.0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NbaStandings;
