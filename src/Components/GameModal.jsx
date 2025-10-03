const GameModal = ({ selectedGame, onClose }) => {
  if (!selectedGame) return null;

  const competition = selectedGame.header.competitions[0];
  const away = competition.competitors.find(c => c.homeAway === 'away');
  const home = competition.competitors.find(c => c.homeAway === 'home');

  // Debugging logs
  console.log('Full selectedGame:', selectedGame);
  console.log('Boxscore:', selectedGame.boxscore);
  console.log('Boxscore Players:', selectedGame.boxscore?.players);
  console.log('atBats:', selectedGame.atBats);

  // Define stat indices based on labels
  const statIndices = {
    hits: 3, // Index of 'H'
    rbi: 4,  // Index of 'RBI'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Logos */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={`https://a.espncdn.com/i/teamlogos/mlb/500/${away.team.abbreviation.toLowerCase()}.png`}
              alt={`${away.team.displayName} logo`}
              className="w-12 h-12 mr-2 rounded-full"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
            />
            <span className="text-lg font-bold" style={{ display: 'none' }}>⚾</span>
            <span className="text-xl font-semibold">{away.team.displayName}</span>
          </div>
          <span className="text-2xl font-bold">@</span>
          <div className="flex items-center">
            <img
              src={`https://a.espncdn.com/i/teamlogos/mlb/500/${home.team.abbreviation.toLowerCase()}.png`}
              alt={`${home.team.displayName} logo`}
              className="w-12 h-12 mr-2 rounded-full"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
            />
            <span className="text-lg font-bold" style={{ display: 'none' }}>⚾</span>
            <span className="text-xl font-semibold">{home.team.displayName}</span>
          </div>
        </div>

        {/* Game Status */}
        <p><strong>Status:</strong> {competition.status?.type?.name || 'N/A'}</p>
        <p><strong>Score:</strong> {away.score ?? '0'} - {home.score ?? '0'}</p>

        {/* Venue and Weather */}
        {selectedGame.gameInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p><strong>Venue:</strong> {selectedGame.gameInfo.venue?.fullName || 'N/A'} ({selectedGame.gameInfo.venue?.address?.city || 'N/A'})</p>
            <p><strong>Weather:</strong> {selectedGame.gameInfo.weather?.temperature || 'N/A'}°F, {selectedGame.gameInfo.weather?.condition || 'N/A'}</p>
          </div>
        )}

        {/* Current Situation */}
        {selectedGame.situation && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p><strong>Current Situation:</strong></p>
            <p>Inning: {selectedGame.situation?.period?.number || competition.status?.period || 'N/A'} ({selectedGame.situation?.period?.type || 'N/A'})</p>
            <p>Outs: {selectedGame.situation.outs ?? 'N/A'}, Balls: {selectedGame.situation.balls ?? 'N/A'}, Strikes: {selectedGame.situation.strikes ?? 'N/A'}</p>
            <p>Pitcher: {selectedGame.situation.pitcher?.athlete?.displayName || 'N/A'}</p>
            <p>Batter: {selectedGame.situation.batter?.athlete?.displayName || 'N/A'}</p>
          </div>
        )}

        {/* Top Performers */}
        {selectedGame.boxscore && selectedGame.boxscore.players && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">Top Performers</h4>
            <div className="grid grid-cols-2 gap-4">
              {selectedGame.boxscore.players.map((teamPlayers, index) => {
                const team = selectedGame.boxscore.teams[index]?.team || { displayName: 'Team' };
                console.log(`Team ${team.displayName} Statistics:`, teamPlayers.statistics);
                const battingStats = teamPlayers.statistics
                  ?.find(stat => ['batting', 'hitting'].includes(stat.type))
                  ?.athletes.filter(a => a.athlete?.displayName) || [];
                console.log(`Team ${team.displayName} Raw Batting Stats:`, battingStats);
                const processedStats = battingStats.map(athlete => {
                  const stats = athlete.stats || [];
                  console.log(`Player ${athlete.athlete.displayName} Stats:`, stats);
                  return {
                    ...athlete,
                    hits: parseInt(stats[statIndices.hits] || '0'), // Index 3 for 'H'
                    rbi: parseInt(stats[statIndices.rbi] || '0'),   // Index 4 for 'RBI'
                  };
                });
                console.log(`Team ${team.displayName} Processed Stats:`, processedStats);
                const finalStats = processedStats.filter(a => a.stats?.length >= 12).sort((a, b) => (b.hits + b.rbi) - (a.hits + a.rbi)).slice(0, 3);
                console.log(`Team ${team.displayName} Final Stats for Display:`, finalStats);
                return (
                  <div key={team.id} className="p-2 bg-gray-50 rounded-md">
                    <h5 className="font-semibold">{team.displayName}</h5>
                    {finalStats.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th>H</th>
                            <th>RBI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {finalStats.map((athlete, idx) => (
                            <tr key={idx}>
                              <td>{athlete.athlete.displayName}</td>
                              <td>{athlete.hits}</td>
                              <td>{athlete.rbi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-gray-500">No player stats available yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Plays */}
        {selectedGame.plays && selectedGame.plays.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">Recent Plays</h4>
            <ul className="space-y-2">
              {selectedGame.plays
                .slice(-3)
                .reverse()
                .map((play, idx) => (
                  <li key={idx} className="text-sm p-2 bg-gray-50 rounded-md">
                    {play.text} (Inning: {play.period?.number || 'N/A'} {play.period?.type || ''})
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {selectedGame.notes && selectedGame.notes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">Notes</h4>
            <p>{selectedGame.notes.map(n => n.headline).join(', ')}</p>
          </div>
        )}

        <button onClick={onClose} className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-md">Close</button>
      </div>
    </div>
  );
};

export default GameModal;
