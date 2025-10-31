import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="text-center p-8 mt-10">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to ckstats
      </h2>
      <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
        Your one-stop destination for the latest standings, scores, and
        leaderboards for your favorite sports leagues. Select a sport to get
        started.
      </p>
      <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-center md:space-y-0 md:space-x-6">
        <Link
          to="/mlb"
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition duration-300 text-xl shadow-lg"
        >
          MLB Stats
        </Link>
        <Link
          to="/nfl"
          className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition duration-300 text-xl shadow-lg"
        >
          NFL Stats
        </Link>
        <Link
          to="/nhl"
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition duration-300 text-xl shadow-lg"
        >
          NHL Stats
        </Link>
        <Link
          to="/nba"
          className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition duration-300 text-xl shadow-lg"
        >
          NBA Stats
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
