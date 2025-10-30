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

  if (loading) return <p className="text-center text-gray-600 font-medium">Loading standings...</p>;
  if (error) return <p className="text-center text-red-600 font-medium">{error}</p>;

  const afcConference = standings.find(conf => conf.abbreviation === 'AFC') || {};
  const nfcConference = standings.find(conf => conf.abbreviation === 'NFC') || {};

  const afcDivisions = afcConference.groups || [];
  const nfcDivisions = nfcConference.groups || [];

  const renderDivision = (division) => (
    <div key={division.id || division.name} className="bg-white shadow-xl rounded-2xl overflow-hidden">
      <h3 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">{division.name}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              <th className="w-3/5 px-4 py-3 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">Team</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">W</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">L</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">T</th>
              {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">PCT</th> */}
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">PF</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">PA</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">Net Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {division.standings.entries.map((entry, index) => {
              const team = entry.team;
              const stats = entry.stats || [];
              const rowClass = index === 0 ? 'bg-indigo-50' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');
              const logoUrl = team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation?.toLowerCase() ?? ''}.png`;

              return (
                <tr key={team.id} className={`${rowClass} hover:bg-indigo-50 transition duration-150 ease-in-out`}>
                  <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={`${team.displayName} logo`}
                      className="w-12 h-12 mr-3 flex-shrink-0"
                    />
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {team.displayName}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'wins')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'losses')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'ties')}</td>
                  {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'winpercent')}</td> */}
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'pointsfor')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'pointsagainst')}</td>
                  <td className="px-2 py-3 text-center text-base text-indigo-900">{findStat(stats, 'differential')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConferencePlayoff = (conf) => (
    <div key={conf.abbreviation} className="bg-white shadow-xl rounded-2xl overflow-hidden">
      <h3 className="text-xl font-semibold bg-indigo-100 text-indigo-900 py-4 px-6 text-center">{conf.abbreviation} Playoff Picture</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">Seed</th>
              <th className="w-4/12 px-4 py-3 text-left text-sm font-semibold text-indigo-900 uppercase tracking-wider">Team</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">W</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">L</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">T</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">PCT</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">DIV</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">CONF</th>
              {/* <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">SOS</th>
              <th className="w-1/12 px-2 py-3 text-center text-sm font-semibold text-indigo-900 uppercase tracking-wider">SOV</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {conf.standings.entries.map((entry, index) => {
              const team = entry.team;
              const stats = entry.stats || [];
              const seed = entry.team.seed || '-';
              const clincher = team.clincher ? `${team.clincher}` : '';
              const rowClass = parseInt(seed) <= 7 ? 'bg-indigo-50' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');
              const logoUrl = team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation?.toLowerCase() ?? ''}.png`;

              return (
                <tr key={team.id} className={`${rowClass} hover:bg-indigo-50 transition duration-150 ease-in-out`}>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{seed}</td>
                  <td className="px-4 py-3 whitespace-nowrap flex items-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={`${team.displayName} logo`}
                      className="w-12 h-12 mr-3 flex-shrink-0"
                    />
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {team.displayName} {clincher}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'total_wins')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'total_losses')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'total_ties')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'total_winpercent')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'divisionrecord')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'conferencerecord')}</td>
                  {/* <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'strengthofschedule')}</td>
                  <td className="px-2 py-3 text-center text-base font-medium text-gray-700">{findStat(stats, 'strengthofvictory')}</td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      <h1 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">NFL Standings - {selectedSeason}</h1>
      <div className="mb-4">
        <label htmlFor="season-select" className="mr-2 text-sm font-medium text-gray-800">Select Season:</label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
        >
          {seasons.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">Division Standings</h2>
      <h3 className="text-xl font-bold mb-4 text-indigo-900">AFC</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {afcDivisions.map(renderDivision)}
      </div>
      <h3 className="text-xl font-bold mb-4 text-indigo-900">NFC</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {nfcDivisions.map(renderDivision)}
      </div>
      {playoffStandings.length > 0 && (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-6">Playoff Picture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {playoffStandings.map(renderConferencePlayoff)}
          </div>
        </>
      )}
    </div>
  );
};

export default NflStandings;
