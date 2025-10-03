// Updated MlbPage.jsx (now passing league prop to preserve existing sub-component functionality)
// Place this in ./components/MlbPage.jsx
import { useState } from 'react';
import Standings from './Standings'; // Existing MLB-compatible component
import Leaders from './Leaders'; // Existing MLB-compatible component
import Scores from './Scores'; // Existing MLB-compatible component
import PlayerComparison from './PlayerComparison';
import TeamComparison from './TeamComparison';


const MlbPage = () => {
  const [view, setView] = useState('standings');
  const title = 'MLB';
  const league = 'mlb'; // Hardcode for MLB

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView('standings')}
          className={`px-4 py-2 rounded ${view === 'standings' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
        >
          Standings
        </button>
        <button
          onClick={() => setView('scores')}
          className={`px-4 py-2 rounded ${view === 'scores' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
        >
          Scores
        </button>
        <button
          onClick={() => setView('leaders')}
          className={`px-4 py-2 rounded ${view === 'leaders' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
        >
          Leaders
        </button>
        <button
          onClick={() => setView('comparison')}
          className={`px-4 py-2 rounded ${view === 'leaders' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
        >
          Player Comparison
        </button>
        <button
          onClick={() => setView('teamcomparison')}
          className={`px-4 py-2 rounded ${view === 'leaders' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
        >
          Team Comparison
        </button>
      </div>
      {view === 'standings' && <Standings league={league} />}
      {view === 'scores' && <Scores league={league} />}
      {view === 'leaders' && <Leaders league={league} />}
      {view === 'comparison' && <PlayerComparison league={league} />}
      {view === 'teamcomparison' && <TeamComparison league={league} />}
    </div>
  );
};

export default MlbPage;
