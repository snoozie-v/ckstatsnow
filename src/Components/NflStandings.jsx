// Updated NflScores.jsx with clickable game modal details
// Place this in ./components/NflScores.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import WeekSelector from './WeekSelector';

const GameModal = ({ selectedGame, onClose }) => {
  if (!selectedGame) return null;

  const competition = selectedGame.competitions?.[0];
  if (!competition) return null;

  const away = competition.competitors.find(c => c.homeAway === 'away');
  const home = competition.competitors.find(c => c.homeAway === 'home');

  const awayName = away?.team?.displayName || 'Away';
  const homeName = home?.team?.displayName || 'Home';
  const awayScore = away?.score || '0';
  const homeScore = home?.score || '0';

  const boxscore = selectedGame.boxscore?.players || [];
  // Simple display of top performers or something, but for now show basic info

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {awayName} @ {homeName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{awayScore} - {homeScore}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedGame.status?.type?.detail || 'Final'}</p>
          </div>
        </div>
        <div className="p-6">
          {/* Placeholder for box score or more details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">{awayName}</h4>
              {/* Add player stats if available */}
              <ul className="text-sm space-y-1">
                {boxscore.length > 0 ? (
                  boxscore.slice(0, 5).map((player, idx) => (
                    <li key={idx}>{player.athlete.displayName}: {player.statistics[0]?.[0]?.value || 'N/A'}</li>
                  ))
                ) : (
                  <li>No stats available</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{homeName}</h4>
              {/* Similar for home */}
              <ul className="text-sm space-y-1">
                {boxscore.length > 0 ? (
                  boxscore.slice(5, 10).map((player, idx) => (
                    <li key={idx}>{player.athlete.displayName}: {player.statistics[0]?.[0]?.value || 'N/A'}</li>
                  ))
                ) : (
                  <li>No stats available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedGame, setSelectedGame] = useState(null);

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

  const fetchGameDetails = async (eventId) => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${eventId}`;
      const response = await axios.get(url);
      setSelectedGame(response.data);
    } catch (err) {
      console.error('Error fetching game details:', err);
      setSelectedGame(null);
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
            <div className="space-y-2">
              {groupedGames[date].map((game) => {
                const home = game.teams?.home || game.competitions[0].competitors.find(c => c.homeAway === 'home');
                const away = game.teams?.away || game.competitions[0].competitors.find(c => c.homeAway === 'away');
                const gameState = game.status?.abstractGameState || 'Preview';
                let statusDetail = game.status?.type?.shortDetail || '';
                let awayScore = away.score ?? '0';
                let homeScore = home.score ?? '0';

                // For final games, explicitly format as "Final: X - Y" for clarity
                const isFinal = gameState === 'Final';
                const isInProgress = gameState === 'In Progress';
                const isPreview = gameState === 'Preview';
                const scoreDisplay = isFinal ? `Final: ${awayScore} - ${homeScore}` : `${awayScore} - ${homeScore}`;
                const statusDisplay = isFinal ? '' : statusDetail;

                // Status background color to match MLB styling
                let statusColor = 'bg-gray-200';
                if (isFinal) {
                  statusColor = 'bg-gray-300';
                } else if (isInProgress) {
                  statusColor = 'bg-green-200';
                } else if (isPreview) {
                  statusColor = 'bg-blue-200';
                }

                // Get logo URLs (fixed to use team.logo)
                const awayLogo = away.team?.logo || '';
                const homeLogo = home.team?.logo || '';

                const awayName = away.team?.name || away.displayName;
                const homeName = home.team?.name || home.displayName;

                return (
                  <div
                    key={game.id}
                    className={`flex items-center justify-between py-2 px-3 border-b border-gray-200 ${statusColor} rounded hover:bg-opacity-80 cursor-pointer transition-colors`}
                    onClick={() => fetchGameDetails(game.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <img
                        src={awayLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='}
                        alt={`${awayName} logo`}
                        className="w-6 h-6 object-contain flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-sm font-semibold text-gray-900 truncate flex-shrink-0 min-w-0">{awayName}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">@</span>
                      <span className="text-sm font-semibold text-gray-900 truncate flex-1 text-right min-w-0">{homeName}</span>
                      <img
                        src={homeLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=='}
                        alt={`${homeName} logo`}
                        className="w-6 h-6 object-contain flex-shrink-0 ml-2"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex flex-col items-end space-y-0.5 text-right flex-shrink-0">
                      <span className={`text-lg font-bold ${isFinal ? 'text-gray-900' : isInProgress ? 'text-green-900' : 'text-gray-600'}`}>
                        {scoreDisplay}
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
      <GameModal selectedGame={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
};

export default NflScores;
