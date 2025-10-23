const GameModal = ({ selectedGame, onClose, getTeamInfo, children }) => {
  if (!selectedGame) return null;

  // A default getTeamInfo to prevent crashes if it's not passed.
  const finalGetTeamInfo =
    getTeamInfo ||
    ((competitor) => ({
      name: competitor.team?.displayName || "TBD",
      logo: competitor.team?.logo || "",
    }));

  const competition = selectedGame.header.competitions[0];
  const away = competition.competitors.find((c) => c.homeAway === "away");
  const home = competition.competitors.find((c) => c.homeAway === "home");
  const { name: awayName, logo: awayLogo } = finalGetTeamInfo(away);
  const { name: homeName, logo: homeLogo } = finalGetTeamInfo(home);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Logos (reusable part) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-center flex-col">
            <img
              src={awayLogo}
              alt={`${awayName} logo`}
              className="w-16 h-16 mb-2 object-contain"
            />
            <span className="text-xl font-semibold">{awayName}</span>
            <span className="text-3xl font-bold">{away.score ?? "0"}</span>
          </div>
          <span className="text-2xl font-bold self-start pt-8">@</span>
          <div className="flex items-center text-center flex-col">
            <img
              src={homeLogo}
              alt={`${homeName} logo`}
              className="w-16 h-16 mb-2 object-contain"
            />
            <span className="text-xl font-semibold">{homeName}</span>
            <span className="text-3xl font-bold">{home.score ?? "0"}</span>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-4 border-b pb-4">
          <p>
            <strong>{competition.status?.type?.detail || "N/A"}</strong>
          </p>
        </div>

        {/* Sport-specific details rendered here */}
        {children}

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-md w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GameModal;
