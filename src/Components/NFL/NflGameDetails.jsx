const NflGameDetails = ({ details }) => {
  if (!details) return null;

  const { boxscore, gameInfo, drives, situation } = details;
  const lastPlay = drives?.current?.plays?.slice(-1)[0];

  const renderPlayerStats = (teamPlayers, statType, statName) => {
    const stats =
      teamPlayers.statistics
        ?.find((s) => s.name === statType)
        ?.athletes.filter(
          (a) => a.stats.length > 0 && parseFloat(a.stats[0]) > 0
        )
        .sort((a, b) => parseFloat(b.stats[0]) - parseFloat(a.stats[0]))
        .slice(0, 3) || [];

    if (stats.length === 0) return null;

    return (
      <div className="mt-2">
        <h6 className="font-bold text-xs uppercase">{statName}</h6>
        <table className="w-full text-sm">
          <tbody>
            {stats.map((player) => (
              <tr key={player.athlete.id}>
                <td>{player.athlete.displayName}</td>
                <td className="text-right">{player.stat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Venue */}
      {gameInfo?.venue?.fullName && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
          <p>
            <strong>Venue:</strong> {gameInfo.venue.fullName}
          </p>
        </div>
      )}

      {/* Current Situation */}
      {situation?.lastPlay && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
          <h4 className="font-bold mb-2">Last Play</h4>
          <p>{situation.lastPlay.text}</p>
          {situation.downDistanceText && (
            <p>Situation: {situation.downDistanceText}</p>
          )}
        </div>
      )}

      {/* Team Stats */}
      {boxscore?.players && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Player Stats</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boxscore.players.map((teamPlayers) => (
              <div
                key={teamPlayers.team.id}
                className="p-2 bg-gray-50 rounded-md"
              >
                <h5 className="font-semibold">
                  {teamPlayers.team.displayName}
                </h5>
                {renderPlayerStats(teamPlayers, "passing", "Passing")}
                {renderPlayerStats(teamPlayers, "rushing", "Rushing")}
                {renderPlayerStats(teamPlayers, "receiving", "Receiving")}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NflGameDetails;
