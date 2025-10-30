const NhlGameDetails = ({ game }) => {
  const scoringPlays = game?.scoringPlays || [];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center text-indigo-800">
        Scoring Summary
      </h3>
      {scoringPlays.length > 0 ? (
        <div className="space-y-4">
          {scoringPlays.map((play) => (
            <div key={play.id} className="p-3 bg-gray-100 rounded-lg shadow-sm">
              <div className="flex justify-between items-center font-semibold text-gray-800">
                <div className="flex items-center">
                  <img
                    src={play.team.logo}
                    alt={play.team.abbreviation}
                    className="w-8 h-8 mr-3"
                  />
                  <span>{play.scoreValue}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {play.period.displayValue} - {play.clock.displayValue}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1 pl-11">{play.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No scoring plays available.</p>
      )}
    </div>
  );
};

export default NhlGameDetails;
