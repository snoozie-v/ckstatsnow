const NbaGameDetails = ({ game }) => {
  const { boxscore } = game || {};
  const competitions = game?.header?.competitions || [];
  const homeTeam = competitions[0]?.competitors?.find(
    (c) => c.homeAway === "home"
  ) || {};
  const awayTeam = competitions[0]?.competitors?.find(
    (c) => c.homeAway === "away"
  ) || {};

  if (!boxscore || !boxscore.players || boxscore.players.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4 text-center text-indigo-800">
          Team Leaders
        </h3>
        <p className="text-center text-gray-500">
          Boxscore data is not available for this game yet.
        </p>
      </div>
    );
  }

  const getLeaders = (teamId) => {
    const teamBoxscore = boxscore.players.find((p) => p.team.id === teamId);
    if (
      !teamBoxscore ||
      !teamBoxscore.statistics ||
      teamBoxscore.statistics.length === 0
    ) {
      return { points: null, rebounds: null, assists: null };
    }

    const statsSection = teamBoxscore.statistics[0];
    const names = statsSection.names || [];
    const teamPlayers = statsSection.athletes || [];

    // Filter active players with stats
    const activePlayers = teamPlayers.filter(
      (p) => !p.didNotPlay && p.stats && p.stats.length > 0
    );
    if (activePlayers.length === 0) {
      return { points: null, rebounds: null, assists: null };
    }

    const getStatValue = (statsArray, statAbbrev) => {
      const index = names.indexOf(statAbbrev);
      if (index === -1) return 0;
      return parseFloat(statsArray[index]) || 0;
    };

    const pointsLeader = activePlayers.reduce((max, p) =>
      getStatValue(p.stats, 'PTS') > getStatValue(max.stats, 'PTS') ? p : max
    , activePlayers[0]);
    const reboundsLeader = activePlayers.reduce((max, p) =>
      getStatValue(p.stats, 'REB') > getStatValue(max.stats, 'REB') ? p : max
    , activePlayers[0]);
    const assistsLeader = activePlayers.reduce((max, p) =>
      getStatValue(p.stats, 'AST') > getStatValue(max.stats, 'AST') ? p : max
    , activePlayers[0]);

    return {
      points: {
        athlete: pointsLeader.athlete,
        displayValue: pointsLeader.stats[names.indexOf('PTS')] || '-'
      },
      rebounds: {
        athlete: reboundsLeader.athlete,
        displayValue: reboundsLeader.stats[names.indexOf('REB')] || '-'
      },
      assists: {
        athlete: assistsLeader.athlete,
        displayValue: assistsLeader.stats[names.indexOf('AST')] || '-'
      },
    };
  };

  const homeLeaders = getLeaders(homeTeam.id);
  const awayLeaders = getLeaders(awayTeam.id);

  const getHeadshotUrl = (athleteId) => {
    if (!athleteId) return '';
    return `https://a.espncdn.com/i/headshots/nba/players/full/${athleteId}.png`;
  };

  const LeaderRow = ({ category, awayPlayer, homePlayer }) => {
    const awayHeadshot = getHeadshotUrl(awayPlayer?.athlete?.id);
    const homeHeadshot = getHeadshotUrl(homePlayer?.athlete?.id);

    return (
      <div className="grid grid-cols-3 items-center text-center py-2 border-b">
        <div className="flex flex-col items-center">
          {awayHeadshot && (
            <img
              src={awayHeadshot}
              alt={awayPlayer?.athlete?.displayName || 'Player'}
              className="w-8 h-8 rounded-full object-contain mb-1"
            />
          )}
          <p className="font-semibold">
            {awayPlayer?.athlete?.displayName || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            {awayPlayer?.displayValue || "-"} {category}
          </p>
        </div>
        <div className="font-bold text-indigo-700">{category}</div>
        <div className="flex flex-col items-center">
          {homeHeadshot && (
            <img
              src={homeHeadshot}
              alt={homePlayer?.athlete?.displayName || 'Player'}
              className="w-8 h-8 rounded-full object-contain mb-1"
            />
          )}
          <p className="font-semibold">
            {homePlayer?.athlete?.displayName || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            {homePlayer?.displayValue || "-"} {category}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center text-indigo-800">
        Team Leaders
      </h3>
      <div className="bg-gray-50 rounded-lg p-2">
        <LeaderRow
          category="Points"
          awayPlayer={awayLeaders.points}
          homePlayer={homeLeaders.points}
        />
        <LeaderRow
          category="Rebounds"
          awayPlayer={awayLeaders.rebounds}
          homePlayer={homeLeaders.rebounds}
        />
        <LeaderRow
          category="Assists"
          awayPlayer={awayLeaders.assists}
          homePlayer={homeLeaders.assists}
        />
      </div>
      {!homeLeaders.points && !awayLeaders.points && (
        <p className="text-center text-gray-500 mt-4">
          Detailed stats are not yet available for this game.
        </p>
      )}
    </div>
  );
};

export default NbaGameDetails;
