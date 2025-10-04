import { useState, useEffect } from 'react';
import axios from 'axios';
import DateSelector from './DateSelector';
import GameList from './GameList';
import GameModal from './GameModal';

const Scores = () => {
  const pad = (n) => String(n).padStart(2, '0');
  const getLocalDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  };

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [selectedGame, setSelectedGame] = useState(null);
  const [isWideScreen, setIsWideScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  const formatDateForESPN = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${year}${pad(month)}${pad(day)}`;
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);
      const espnDate = formatDateForESPN(selectedDate);
      const url = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${espnDate}-${espnDate}`;
      const response = await axios.get(url);
      setGames(response.data.events || []);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid date format or no data available. Try a past date like 2024-09-24.');
      } else {
        setError('Failed to fetch scores');
      }
      setLoading(false);
    }
  };

  const fetchGameDetails = async (eventId) => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`;
      const response = await axios.get(url);
      setSelectedGame(response.data);
    } catch (err) {
      setError('Failed to fetch game details.');
      setSelectedGame(null);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 300000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading scores...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">MLB Scores</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Data courtesy of ESPN API © ESPN Enterprises, Inc.
      </p>
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <GameList
        games={games}
        onGameClick={fetchGameDetails}
        getStatusColor={(game) => {
          const status = game.status.type.name;
          if (status === 'STATUS_FINAL' || status === 'STATUS_CANCELED') return 'bg-gray-300';
          if (status === 'STATUS_IN_PROGRESS') return 'bg-green-200';
          if (status === 'STATUS_SCHEDULED' || status === 'STATUS_PRE') return 'bg-blue-200';
          return 'bg-gray-200';
        }}
        getStatusContent={(game) => {
          const competition = game.competitions[0];
          const away = competition.competitors.find(c => c.homeAway === 'away');
          const home = competition.competitors.find(c => c.homeAway === 'home');
          const status = game.status.type.name;
          if (status === 'STATUS_FINAL' || status === 'STATUS_CANCELED') {
            return `Final: ${away.score ?? '0'} - ${home.score ?? '0'}`;
          }
          if (status === 'STATUS_IN_PROGRESS') {
            return `${away.score ?? '0'} - ${home.score ?? '0'}`;
          }
          if (status === 'STATUS_SCHEDULED' || status === 'STATUS_PRE') {
            const startTime = new Date(game.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/Chicago',
              hour12: true,
            });
            return `Starts at ${startTime} CDT`;
          }
          return 'Unknown Status';
        }}
        gridLayout={isWideScreen}
      />
      <GameModal selectedGame={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
};

export default Scores;
