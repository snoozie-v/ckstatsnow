const GameList = ({
  games,
  onGameClick,
  getStatusColor,
  getStatusContent,
  gridLayout, // Can keep this prop for compatibility, but it's unused now
  getTeamInfo,
}) => {
  const groupedGames = games.reduce((acc, game) => {
    const gameDate = new Date(game.date);
    const dateStr = gameDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(game);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedGames).sort(
    (a, b) => Date.parse(a) - Date.parse(b)
  );

  if (games.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No games scheduled on this date. Try a past date for real MLB games.
      </p>
    );
  }

  return sortedDates.map((date) => (
    <div key={date}>
      <h3 className="text-lg font-medium mt-4 mb-2">{date}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupedGames[date].map((game) => {
          const competition = game.competitions[0];
          const away = competition.competitors.find(
            (c) => c.homeAway === "away"
          );
          const home = competition.competitors.find(
            (c) => c.homeAway === "home"
          );
          const { name: awayName, logo: awayLogo } = getTeamInfo(away);
          const { name: homeName, logo: homeLogo } = getTeamInfo(home);

          return (
            <div
              key={game.id}
              className={`border-b pb-2 hover:bg-gray-200 cursor-pointer rounded-md ${getStatusColor(
                game
              )} h-32 flex items-center justify-center`}
              onClick={() => onGameClick(game.id)}
            >
              <div className="flex flex-col items-center text-center p-2 pt-4 text-gray-800">
                <div className="flex items-center mb-2">
                  <img
                    src={awayLogo}
                    alt={`${awayName} logo`}
                    className="w-10 h-10 mr-2 rounded-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span
                    className="text-xl font-bold"
                    style={{ display: "none" }}
                  >
                    ⚾
                  </span>
                  <span className="mx-1 text-lg">@</span>
                  <img
                    src={homeLogo}
                    alt={`${homeName} logo`}
                    className="w-10 h-10 ml-2 rounded-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span
                    className="text-xl font-bold"
                    style={{ display: "none" }}
                  >
                    ⚾
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  {away.team.shortDisplayName} @{" "}
                  {home.team.shortDisplayName}
                </div>
                <div className="text-xl mt-2">{getStatusContent(game)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ));
};

export default GameList;
