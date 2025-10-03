import { useState } from 'react';
import Standings from './Standings';
import Leaders from './Leaders';
import Scores from './Scores';


const LeaguePage = ({ league }) => {
  const [view, setView] = useState('standings');

  const title = league.toUpperCase();

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
      </div>
      {view === 'standings' && <Standings league={league} />}
      {view === 'scores' && <Scores league={league} />}
      {view === 'leaders' && <Leaders league={league} />}
    </div>
  );
};

export default LeaguePage;
