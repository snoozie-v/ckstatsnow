const MlbGameDetails = ({ details }) => {
  if (!details) return null;

  const { boxscore, situation, gameInfo, plays } = details;

  const statIndices = {
    hits: 3, // Index of 'H'
    rbi: 4, // Index of 'RBI'
  };

  return (
    <>
      {/* Venue and Weather */}
      {gameInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
          <p>
            <strong>Venue:</strong> {gameInfo.venue?.fullName || "N/A"} (
            {gameInfo.venue?.address?.city || "N/A"})
          </p>
          <p>
            <strong>Weather:</strong> {gameInfo.weather?.temperature || "N/A"}
            °F, {gameInfo.weather?.condition || "N/A"}
          </p>
        </div>
      )}

      {/* Current Situation */}
      {situation && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm">
          <h4 className="font-bold mb-2">Current Situation</h4>
          <p>
            Inning: {situation.period?.number || "N/A"} (
            {situation.period?.type || "N/A"})
          </p>
          <p>
            Outs: {situation.outs ?? "N/A"}, Balls: {situation.balls ?? "N/A"},
            Strikes: {situation.strikes ?? "N/A"}
          </p>
          <p>Pitcher: {situation.pitcher?.athlete?.displayName || "N/A"}</p>
          <p>Batter: {situation.batter?.athlete?.displayName || "N/A"}</p>
        </div>
      )}

      {/* Top Performers */}
      {boxscore?.players && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Top Performers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boxscore.players.map((teamPlayers, index) => {
              const team = boxscore.teams[index]?.team || {
                displayName: "Team",
              };
              const battingStats =
                teamPlayers.statistics
                  ?.find((stat) => ["batting", "hitting"].includes(stat.type))
                  ?.athletes.filter((a) => a.athlete?.displayName) || [];
              const finalStats = battingStats
                .map((athlete) => ({
                  ...athlete,
                  hits: parseInt(athlete.stats?.[statIndices.hits] || "0"),
                  rbi: parseInt(athlete.stats?.[statIndices.rbi] || "0"),
                }))
                .filter((a) => a.stats?.length >= 12)
                .sort((a, b) => b.hits + b.rbi - (a.hits + a.rbi))
                .slice(0, 3);

              return (
                <div key={team.id} className="p-2 bg-gray-50 rounded-md">
                  <h5 className="font-semibold">{team.displayName}</h5>
                  {finalStats.length > 0 ? (
                    <table className="w-full text-sm text-center">
                      <thead>
                        <tr className="font-bold">
                          <td className="text-left">Player</td>
                          <td>H</td>
                          <td>RBI</td>
                        </tr>
                      </thead>
                      <tbody>
                        {finalStats.map((athlete, idx) => (
                          <tr key={idx}>
                            <td className="text-left">
                              {athlete.athlete.displayName}
                            </td>
                            <td>{athlete.hits}</td>
                            <td>{athlete.rbi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No player stats available yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Plays */}
      {plays?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Recent Plays</h4>
          <ul className="space-y-2">
            {plays
              .slice(-3)
              .reverse()
              .map((play, idx) => (
                <li key={idx} className="text-sm p-2 bg-gray-50 rounded-md">
                  {play.text} (Inning: {play.period?.number || "N/A"}{" "}
                  {play.period?.type || ""})
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default MlbGameDetails;
