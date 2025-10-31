import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-2xl space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-900 mb-6">
          Welcome to CKStats
        </h1>
        <p className="text-lg text-gray-600 font-medium mb-8 max-w-3xl mx-auto">
          Your ultimate hub for real-time sports insights. Dive into detailed standings, live scores, player leaderboards, team comparisons, and playoff matchups across MLB, NFL, NHL, and NBA. Powered by official APIs for accurate, up-to-date data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/mlb"
            className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition duration-150 ease-in-out hover:scale-105"
          >
            <div className="p-6 text-center">
              <img
                src="https://a.espncdn.com/i/teamlogos/mlb/500/lad.png"
                alt="MLB"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">MLB Stats</h2>
              <p className="text-sm text-gray-600">Standings, scores, team comparisons, and playoff brackets</p>
            </div>
          </Link>
          <Link
            to="/nfl"
            className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition duration-150 ease-in-out hover:scale-105"
          >
            <div className="p-6 text-center">
              <img
                src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
                alt="NFL"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">NFL Stats</h2>
              <p className="text-sm text-gray-600">Standings, live scores, division breakdowns, and playoff pictures</p>
            </div>
          </Link>
          <Link
            to="/nhl"
            className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition duration-150 ease-in-out hover:scale-105"
          >
            <div className="p-6 text-center">
              <img
                src="https://a.espncdn.com/i/teamlogos/nhl/500/tb.png"
                alt="NHL"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">NHL Stats</h2>
              <p className="text-sm text-gray-600">Conference standings, division leaders, and real-time updates</p>
            </div>
          </Link>
          <Link
            to="/nba"
            className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition duration-150 ease-in-out hover:scale-105"
          >
            <div className="p-6 text-center">
              <img
                src="https://a.espncdn.com/i/teamlogos/nba/500/bos.png"
                alt="NBA"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">NBA Stats</h2>
              <p className="text-sm text-gray-600">Standings, scores, leaderboards, and team analytics</p>
            </div>
          </Link>
        </div>
        <p className="text-center text-xs text-gray-500 py-4 mt-8">
          Data powered by official APIs • Updated in real-time
        </p>
      </div>
    </div>
  );
};

export default HomePage;
