const NhlGameDetails = ({ game }) => {
  const competitions = game?.header?.competitions || [];
  const homeTeam = competitions[0]?.competitors?.find(
    (c) => c.homeAway === "home"
  ) || {};
  const awayTeam = competitions[0]?.competitors?.find(
    (c) => c.homeAway === "away"
  ) || {};

  const teamMap = {
    [homeTeam.id]: homeTeam.team || {},
    [awayTeam.id]: awayTeam.team || {},
  };

  const scoringPlays = (game?.plays || []).filter((play) => play.scoringPlay);

  const getLogoUrl = (abbrev) => {
    if (!abbrev) return '';
    return `https://a.espncdn.com/i/teamlogos/nhl/500/${abbrev.toLowerCase()}.png`;
  };

  const getHeadshotUrl = (athlete) => {
    if (!athlete?.id) return '';
    return `https://a.espncdn.com/i/headshots/nhl/players/full/${athlete.id}.png`;
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center text-indigo-800">
        Scoring Summary
      </h3>
      {scoringPlays.length > 0 ? (
        <div className="space-y-4">
          {scoringPlays.map((play) => {
            const teamInfo = teamMap[play.team?.id] || {};
            const logoUrl = getLogoUrl(teamInfo.abbreviation);
            const scorer = play.participants?.find((p) => p.type === 'goal')?.athlete || // Prefer 'goal' type if present
                          play.participants?.[0]?.athlete; // Fallback to first participant
            const headshotUrl = getHeadshotUrl(scorer);
            return (
              <div key={play.id} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                <div className="flex justify-between items-center font-semibold text-gray-800">
                  <div className="flex items-center">
                    <img
                      src={logoUrl}
                      alt={teamInfo.abbreviation || 'Team'}
                      className="w-8 h-8 mr-3 object-contain"
                    />
                    {headshotUrl && (
                      <img
                        src={headshotUrl}
                        alt={scorer?.displayName || 'Scorer'}
                        className="w-8 h-8 mr-3 object-contain rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {play.period?.displayValue} - {play.clock?.displayValue}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1 pl-11">{play.text}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No scoring plays available.</p>
      )}
    </div>
  );
};

export default NhlGameDetails;
