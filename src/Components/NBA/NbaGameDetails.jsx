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

    const teamPlayers = teamBoxscore.statistics[0].athletes;
    if (!teamPlayers || teamPlayers.length === 0) {
      return { points: null, rebounds: null, assists: null };
    }

    const getStat = (player, statName) => {
      const stat = player.stats.find((s) => s.name === statName);
      return stat ? parseFloat(stat.displayValue) : 0;
    };

    const leaders = {
      points: teamPlayers.reduce(
        (max, p) => (getStat(p, "points") > getStat(max, "points") ? p : max),
        teamPlayers[0]
      ),
      rebounds: teamPlayers.reduce(
        (max, p) =>
          getStat(p, "rebounds") > getStat(max, "rebounds") ? p : max,
        teamPlayers[0]
      ),
      assists: teamPlayers.reduce(
        (max, p) => (getStat(p, "assists") > getStat(max, "assists") ? p : max),
        teamPlayers[0]
      ),
    };

    return leaders;
  };

  const homeLeaders = getLeaders(homeTeam.id);
  const awayLeaders = getLeaders(awayTeam.id);

  const LeaderRow = ({ category, awayPlayer, homePlayer }) => {
    const getStatValue = (player, statName) => {
      if (!player) return "-";
      const stat = player.stats.find((s) => s.name === statName);
      return stat ? stat.displayValue : "-";
    };

    return (
      <div className="grid grid-cols-3 items-center text-center py-2 border-b">
        <div>
          <p className="font-semibold">
            {awayPlayer?.athlete.displayName || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            {getStatValue(awayPlayer, category.toLowerCase())} {category}
          </p>
        </div>
        <div className="font-bold text-indigo-700">{category}</div>
        <div>
          <p className="font-semibold">
            {homePlayer?.athlete.displayName || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            {getStatValue(homePlayer, category.toLowerCase())} {category}
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
      <div className="grid grid-cols-3 items-center text-center font-bold mb-2">
        <div className="flex items-center justify-center">
          <img
            src={awayTeam.team?.logo}
            alt={awayTeam.team?.displayName}
            className="w-8 h-8 mr-2"
          />
          <span>{awayTeam.team?.abbreviation || "Away"}</span>
        </div>
        <div></div>
        <div className="flex items-center justify-center">
          <img
            src={homeTeam.team?.logo}
            alt={homeTeam.team?.displayName}
            className="w-8 h-8 mr-2"
          />
          <span>{homeTeam.team?.abbreviation || "Home"}</span>
        </div>
      </div>
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
