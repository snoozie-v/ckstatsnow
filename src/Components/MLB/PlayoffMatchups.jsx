import { useState, useEffect } from 'react';
import axios from 'axios';

const PlayoffMatchups = () => {
  const [playoffData, setPlayoffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const leagueMap = {
    103: 'AL',
    104: 'NL'
  };

  const teamAbbrevMap = {
    108: 'laa',
    109: 'ari',
    110: 'bal',
    111: 'bos',
    112: 'chc',
    113: 'cin',
    114: 'cle',
    115: 'col',
    116: 'det',
    117: 'hou',
    118: 'kc',
    119: 'lad',
    120: 'wsh',
    121: 'nym',
    133: 'oak',
    134: 'pit',
    135: 'sd',
    136: 'sea',
    137: 'sf',
    138: 'stl',
    139: 'tb',
    140: 'tex',
    141: 'tor',
    142: 'min',
    143: 'phi',
    144: 'atl',
    145: 'cws',
    146: 'mia',
    147: 'nyy',
    158: 'mil'
  };

  const roundMap = {
    'F': 'Wild Card Series',
    'D': 'Division Series',
    'L': 'League Championship Series',
    'W': 'World Series'
  };

  const winsNeededMap = {
    'F': 2,
    'D': 3,
    'L': 4,
    'W': 4
  };

  const fetchPlayoffData = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const playoffUrl = `https://statsapi.mlb.com/api/v1/schedule/postseason/series?season=${year}&sportId=1&hydrate=team,game(boxscore)`;
      const response = await axios.get(playoffUrl);
      setPlayoffData(response.data.series || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch playoff data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayoffData();
    const interval = setInterval(fetchPlayoffData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading playoff matchups...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!playoffData || playoffData.length === 0) return <p className="text-center text-gray-600">No playoff data available.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold my-4">Playoff Matchups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
        {playoffData.map((seriesItem, index) => {
          if (seriesItem.games.length === 0) return null;
          const series = seriesItem.series;
          const gameType = series.gameType;
          const roundName = roundMap[gameType] || 'Unknown Series';
          const winsNeeded = winsNeededMap[gameType] || 0;
          const firstGame = seriesItem.games[0];
          const homeTeam = firstGame.teams.home.team;
          const awayTeam = firstGame.teams.away.team;
          if (homeTeam.name === 'TBD' && awayTeam.name === 'TBD') return null;
          let homeWins = 0;
          let awayWins = 0;
          seriesItem.games.forEach(game => {
            if (game.status.abstractGameState === 'Final') {
              const winnerId = game.teams.home.isWinner ? game.teams.home.team.id : game.teams.away.team.id;
              if (winnerId === homeTeam.id) {
                homeWins++;
              } else {
                awayWins++;
              }
            }
          });
          const isOver = Math.max(homeWins, awayWins) >= winsNeeded;
          const totalWins = homeWins + awayWins;
          let statusText = ' (Ongoing)';
          if (totalWins === 0) statusText = ' (Upcoming)';
          else if (isOver) statusText = ' (Completed)';
          let leagueId = homeTeam.league ? homeTeam.league.id : (awayTeam.league ? awayTeam.league.id : null);
          const leagueName = gameType === 'W' ? '' : (leagueId ? leagueMap[leagueId] : '');
          const homeAbbrev = homeTeam.name !== 'TBD' ? teamAbbrevMap[homeTeam.id] : null;
          const awayAbbrev = awayTeam.name !== 'TBD' ? teamAbbrevMap[awayTeam.id] : null;
          let winnerMessage = null;
          if (isOver) {
            const winner = homeWins >= winsNeeded ? homeTeam : awayTeam;
            const loser = homeWins >= winsNeeded ? awayTeam : homeTeam;
            const seriesScore = `${Math.max(homeWins, awayWins)}-${Math.min(homeWins, awayWins)}`;
            winnerMessage = `${winner.name} win the series ${seriesScore}`;
          }
          return (
            <div
              key={index}
              className={`${isOver ? 'bg-green-200' : 'bg-white'} shadow-md rounded-lg overflow-hidden p-4 ${gameType === 'W' ? 'sm:col-span-2' : ''}`}
            >
              <h2 className="text-lg font-semibold mb-2">{leagueName ? leagueName + ' ' : ''}{roundName}{statusText}</h2>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {homeAbbrev && <img src={`https://a.espncdn.com/i/teamlogos/mlb/500/${homeAbbrev}.png`} alt={homeTeam.name} className="w-8 h-8 mr-2" />}
                  {!homeAbbrev && <span className="w-8 h-8 mr-2"></span>}
                  <span className={homeWins > awayWins ? 'font-bold' : ''}>{homeTeam.name} ({homeWins})</span>
                </div>
                <span className="mx-4">vs</span>
                <div className="flex items-center">
                  <span className={awayWins > homeWins ? 'font-bold' : ''}>{awayTeam.name} ({awayWins})</span>
                  {awayAbbrev && <img src={`https://a.espncdn.com/i/teamlogos/mlb/500/${awayAbbrev}.png`} alt={awayTeam.name} className="w-8 h-8 ml-2" />}
                </div>
              </div>
              {winnerMessage && <p className="mt-2 text-center font-bold p4">{winnerMessage}</p>}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PlayoffMatchups;
