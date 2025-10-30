// Updated App.jsx
import { Routes, Route, Link, Navigate } from "react-router-dom";
import MlbPage from "./Components/MLB/MlbPage";
import NflPage from "./Components/NFL/NflPage";
import NhlPage from "./Components/NHL/NhlPage";
import NbaPage from "./Components/NBA/NbaPage";

import HomePage from "./Components/HomePage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <header className="bg-sky-800 text-white py-4 px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          ckstats
        </Link>
        <nav className="flex space-x-4">
          <Link to="/mlb" className="text-sm hover:underline">
            MLB
          </Link>
          <Link to="/nfl" className="text-sm hover:underline">
            NFL
          </Link>
          <Link to="/nhl" className="text-sm hover:underline">
            NHL
          </Link>
          <Link to="/nba" className="text-sm hover:underline">
            NBA
          </Link>
          {/* <Link to="/ncaa" className="text-sm hover:underline">NCAA FB</Link> */}
        </nav>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mlb/:view?" element={<MlbPage />} />
          <Route path="/nfl/:view?" element={<NflPage />} />
          <Route path="/nhl/:view?" element={<NhlPage />} />
          <Route path="/nba/:view?" element={<NbaPage />} />
          {/* <Route path="/ncaa" element={<NcaaPage />} /> */}
        </Routes>
      </main>
      <footer className="bg-sky-800 text-white py-2 px-6 text-center text-sm">
        Stats courtesy of{" "}
        <a
          href="https://statsapi.mlb.com/"
          className="underline hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          MLB Stats API
        </a>{" "}
        | Scores courtesy of{" "}
        <a
          href="https://site.api.espn.com/"
          className="underline hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ESPN API
        </a>
         {" "}| Non-commercial use only.
      </footer>
    </div>
  );
}

export default App;
