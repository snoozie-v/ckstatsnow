// Updated NflScores.jsx (fixed logo path to use team.logo from ESPN API)
// Place this in ./components/NflScores.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import WeekSelector from '../Utilities/WeekSelector';

const NflScores = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const daysToThu = (today.getDay() - 4 + 7) % 7;
    const thurs = new Date(today);
    thurs.setDate(today.getDate() - daysToThu);
    const pad = (n) => String(n).padStart(2, '0');
    return `${thurs.getFullYear()}-${pad(thurs.getMonth() + 1)}-${pad(thurs.getDate())}`;
  });

  const pad = (n) => String(n).padStart(2, '0');

  const formatDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

  const getWeekTitle = () => {
    const startDate = new Date(selectedWeekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Monday for display
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const yearStr = startDate.getFullYear();
    return `${startStr} - ${endStr}, ${yearStr}`;
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);
      const startDate = new Date(selectedWeekStart);
      const thursStr = formatDate(startDate);
      const tue = new Date(startDate);
      tue.setDate(startDate.getDate() + 5); // Tuesday to capture Monday night UTC
      const tueStr = formatDate(tue);
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${thursStr}-${tueStr}`;
      const response = await axios.get(url);
      setGames(response.data.events || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NFL scores:', err);
      setError('Failed to fetch scores');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [selectedWeekStart]);

  useEffect(() => {
    const interval = setInterval(fetchScores, 300000); // Auto-update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading scores...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  // Group games by local ET date for better display (handles UTC offsets for night games)
  const groupedGames = games.reduce((acc, game) => {
    const gameDate = new Date(game.date);
    const dateStr = gameDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York',
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(game);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedGames).sort((a, b) => Date.parse(a) - Date.parse(b));

  const noGamesMessage = "No games this week.";

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">NFL Scores - {getWeekTitle()}</h2>
      <WeekSelector selectedWeekStart={selectedWeekStart} onWeekStartChange={setSelectedWeekStart} />
      {games.length === 0 ? (
        <p>{noGamesMessage}</p>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-lg font-medium mt-4 mb-2">{date}</h3>
            <div className="space-y-3">
              {groupedGames[date].map((game) => {
                const home = game.teams?.home || game.competitions[0].competitors.find(c => c.homeAway === 'home');
                const away = game.teams?.away || game.competitions[0].competitors.find(c => c.homeAway === 'away');
                let status = game.status?.abstractGameState || game.status.type.shortDetail;
                let awayScore = away.score ?? '';
                let homeScore = home.score ?? '';

                // For final games, explicitly format as "Final: X - Y" for clarity
                const isFinal = status.toLowerCase().includes('final');
                const scoreDisplay = isFinal ? `Final: ${awayScore} - ${homeScore}` : `${awayScore} - ${homeScore}`;
                const statusDisplay = isFinal ? '' : `(${status})`;

                // Get logo URLs (fixed to use team.logo)
                const awayLogo = away.team?.logo || '';
                const homeLogo = home.team?.logo || '';

                const awayName = away.team?.name || away.displayName;
                const homeName = home.team?.name || home.displayName;

                return (
                  <div key={game.id} className="flex items-center justify-between py-3 px-4 border-b border-gray-200 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={awayLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='}
                        alt={`${awayName} logo`}
                        className="w-8 h-8 rounded-full object-contain flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{awayName}</p>
                        <p className="text-xs text-gray-500">at</p>
                      </div>
                      <img
                        src={homeLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='}
                        alt={`${homeName} logo`}
                        className="w-8 h-8 rounded-full object-contain flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-sm font-semibold text-gray-900 truncate">{homeName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-4">
                      <span className="text-lg font-bold text-gray-900">
                        {awayScore || homeScore ? scoreDisplay : ''}
                      </span>
                      {statusDisplay && (
                        <span className="text-xs text-gray-500">{statusDisplay}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NflScores;
