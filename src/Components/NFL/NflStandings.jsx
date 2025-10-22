import { useState, useEffect } from 'react';
import axios from 'axios';

const findStat = (stats, type) => {
  const stat = stats.find(s => s.type === type);
  return stat ? stat.displayValue || stat.value || '-' : '-';
};

const NflStandings = () => {
  const [standings, setStandings] = useState([]);
  const [playoffStandings, setPlayoffStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const seasons = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://cdn.espn.com/core/nfl/standings/_/season/${selectedSeason}?xhr=1`;
      const response = await axios.get(url);
      const nflStandings = response.data.content.standings || {};
      setStandings(nflStandings.groups || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NFL division standings:', err);
      setError('Failed to fetch standings');
      setLoading(false);
    }
  };

  const fetchPlayoff = async () => {
    try {
      const url = `https://cdn.espn.com/core/nfl/standings/_/season/${selectedSeason}/view/playoff?xhr=1`;
      const response = await axios.get(url);
      const nflPlayoff = response.data.content.standings || {};
      setPlayoffStandings(nflPlayoff.groups || []);
    } catch (err) {
      console.error('Error fetching NFL playoff standings:', err);
    }
  };

  useEffect(() => {
    fetchDivisions();
    fetchPlayoff();
  }, [selectedSeason]);

  if (loading) return <p className="text-center text-gray-600">Loading standings...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  const afcConference = standings.find(conf => conf.abbreviation === 'AFC') || {};
  const nfcConference = standings.find(conf => conf.abbreviation === 'NFC') || {};

  const afcDivisions = afcConference.groups || [];
  const nfcDivisions = nfcConference.groups || [];

  const renderDivision = (division) => (
    <div key={division.id || division.name} className="bg-white shadow-md rounded-lg overflow-hidden">
      <h3 className="text-xl font-semibold bg-blue-100 py-2 px-4">{division.name}</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">T</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>

            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PF</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PA</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pts</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {division.standings.entries.map((entry, index) => {
            const team = entry.team;
            const stats = entry.stats || [];
            const rowClass = index === 0 ? 'bg-green-100' : '';
            const logoUrl = team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation?.toLowerCase() ?? ''}.png`;

            return (
              <tr key={team.id} className={rowClass}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <img
                    src={logoUrl}
                    alt={`${team.displayName} logo`}
                    className="w-6 h-6 object-contain mr-2"
                    onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='; }}
                  />
                  {team.displayName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'wins')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'losses')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'ties')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'winpercent')}</td>

                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'pointsfor')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'pointsagainst')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'differential')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderConferencePlayoff = (conf) => (
    <div key={conf.abbreviation} className="bg-white shadow-md rounded-lg overflow-hidden">
      <h3 className="text-xl font-semibold bg-blue-100 py-2 px-4">{conf.abbreviation} Playoff Picture</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seed</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">T</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DIV</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CONF</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SOS</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SOV</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conf.standings.entries.map((entry) => {
            const team = entry.team;
            const stats = entry.stats || [];
            const seed = team.seed || '-';
            const clincher = team.clincher ? `${team.clincher}` : '';
            const rowClass = parseInt(seed) <= 7 ? 'bg-green-100' : 'bg-red-100';
            const logoUrl = team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation?.toLowerCase() ?? ''}.png`;

            return (
              <tr key={team.id} className={rowClass}>
                <td className="px-6 py-4 whitespace-nowrap">{seed}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <img
                    src={logoUrl}
                    alt={`${team.displayName} logo`}
                    className="w-6 h-6 object-contain mr-2"
                    onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='; }}
                  />
                  {team.displayName} {clincher}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'total_wins')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'total_losses')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'total_ties')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'total_winpercent')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'divisionrecord')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'conferencerecord')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'strengthofschedule')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{findStat(stats, 'strengthofvictory')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">NFL Standings - {selectedSeason}</h1>
      <div className="mb-4">
        <label htmlFor="season-select" className="mr-2">Select Season:</label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {seasons.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <h2 className="text-2xl font-bold mb-4">Division Standings</h2>
      <h3 className="text-xl font-bold mb-2">AFC</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {afcDivisions.map(renderDivision)}
      </div>
      <h3 className="text-xl font-bold mb-2">NFC</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {nfcDivisions.map(renderDivision)}
      </div>
      {playoffStandings.length > 0 && (
        <>
          <h2 className="text-2xl font-bold my-4">Playoff Picture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {playoffStandings.map(renderConferencePlayoff)}
          </div>
        </>
      )}
    </div>
  );
};

export default NflStandings;
