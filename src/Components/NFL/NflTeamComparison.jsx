import { useState, useEffect } from "react";
import { fetchNflStandings, fetchNflTeamStats } from "../../api/espn";
import { getNflGradient } from "./nflUtils";

const offenseCategories = [
  { displayName: "Points For", valueKey: "PF", order: "desc", usePerGame: false, catName: "general" },
  { displayName: "Total YPG", valueKey: "netYardsPerGame", order: "desc", usePerGame: true },
  { displayName: "Passing YPG", valueKey: "YDS/G", order: "desc", usePerGame: true, catName: "passing" },
  { displayName: "Rushing YPG", valueKey: "YDS/G", order: "desc", usePerGame: true, catName: "rushing" },
  { displayName: "Turnover Differential", valueKey: "DIFF", order: "desc", usePerGame: false, catName: "miscellaneous" },
];

const defenseCategories = [
  { displayName: "Points Against", valueKey: "PA", order: "asc", usePerGame: false, catName: "general" },
  { displayName: "YPG Allowed", valueKey: "yardsAllowed", order: "asc", usePerGame: true },
  { displayName: "Passing Yards Allowed", valueKey: "YDS/G", order: "asc", usePerGame: true, catName: "passing" },
  { displayName: "Rushing Yards Allowed", valueKey: "YDS/G", order: "asc", usePerGame: true, catName: "rushing" },
];

const parseStat = (value) => {
  if (value === "-" || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const isLeading = (myNum, oppNum, order) => {
  if (myNum === null || oppNum === null) return false;
  return order === "desc" ? myNum > oppNum : myNum < oppNum;
};

const TeamSelector = ({
  label,
  search,
  setSearch,
  suggestions,
  selectTeam,
  team,
  clearTeam,
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search for a team..."
      className="w-full p-2 border rounded mb-1"
    />
    {suggestions.length > 0 && (
      <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded z-10 absolute w-full md:w-1/2">
        {suggestions.slice(0, 5).map((t) => (
          <li
            key={t.team.id}
            onClick={() => selectTeam(t)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            {t.team.displayName}
          </li>
        ))}
      </ul>
    )}
    {team.name && (
      <p className="mt-2 text-sm text-gray-600">
        Selected: {team.name}
        <button
          onClick={clearTeam}
          className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
        >
          Clear
        </button>
      </p>
    )}
  </div>
);

const TeamHeader = ({ team }) => (
  <div className="text-center bg-gray-100 p-4 rounded">
    <h3 className="text-xl font-semibold">{team.name}</h3>
    {team.logo && (
      <img
        src={team.logo}
        alt={`${team.name} logo`}
        className="w-24 h-24 mx-auto"
      />
    )}
  </div>
);

const StatsTable = ({ title, categories, stats1, stats2, team1, team2, isDefense, categoryDefinitions }) => {
  const findStat = (categoriesData, key, usePerGame = true, isDefenseLocal = false, catName) => {
    let targetSplit = isDefenseLocal ? "900" : "0";
    if (key === "PF" || key === "PA" || key === "DIFF") {
      targetSplit = "0";
    }

    const getIndex = (categoryName, keyLabel) => {
      const def = categoryDefinitions.find((d) => d.name === categoryName);
      return def ? def.labels.findIndex((l) => l === keyLabel) : -1;
    };

    if (key === "netYardsPerGame" || key === "yardsAllowed") {
      const passSplit = categoriesData.find((c) => c.name === "passing" && c.splitId === targetSplit);
      const rushSplit = categoriesData.find((c) => c.name === "rushing" && c.splitId === targetSplit);
      if (!passSplit || !rushSplit) return "-";

      const passIndex = getIndex("passing", "YDS/G");
      const rushIndex = getIndex("rushing", "YDS/G");

      if (passIndex === -1 || rushIndex === -1) return "-";

      const passValue = usePerGame ? passSplit.values[passIndex] : passSplit.totals[passIndex];
      const rushValue = usePerGame ? rushSplit.values[rushIndex] : rushSplit.totals[rushIndex];

      const sum = parseFloat(passValue) + parseFloat(rushValue);
      return isNaN(sum) ? "-" : sum.toFixed(1);
    } else {
      const targetCat = categoriesData.find((c) => c.name === catName && c.splitId === targetSplit);
      if (!targetCat) return "-";

      const index = getIndex(catName, key);
      if (index === -1) return "-";

      return usePerGame ? targetCat.values[index] : targetCat.totals[index];
    }
  };

  return (
    <div className="my-4">
      <h4 className="text-lg font-bold text-center mb-2">{title}</h4>
      <table className="w-full table-fixed divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((cat) => {
            const val1 = findStat(stats1, cat.valueKey, cat.usePerGame, isDefense, cat.catName);
            const val2 = findStat(stats2, cat.valueKey, cat.usePerGame, isDefense, cat.catName);
            const num1 = parseStat(val1);
            const num2 = parseStat(val2);
            const leads1 = isLeading(num1, num2, cat.order);
            const leads2 = isLeading(num2, num1, cat.order);
            return (
              <tr key={cat.valueKey}>
                <td className="px-6 py-4 text-base font-medium text-gray-900 w-1/3 text-center text-[24px]">
                  {cat.displayName}
                </td>
                <td
                  className={`text-[32px] px-6 py-4 text-base w-1/3 text-center ${
                    leads1 ? "text-white" : "text-gray-500"
                  }`}
                  style={{
                    background: leads1
                      ? getNflGradient(team1.abbrev)
                      : "transparent",
                  }}
                >
                  {val1}
                </td>
                <td
                  className={`text-[32px] px-6 py-4 text-base w-1/3 text-center ${
                    leads2 ? "text-white" : "text-gray-500"
                  }`}
                  style={{
                    background: leads2
                      ? getNflGradient(team2.abbrev)
                      : "transparent",
                  }}
                >
                  {val2}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const NflTeamComparison = () => {
  const [team1, setTeam1] = useState({
    id: null,
    name: "",
    abbrev: "",
    logo: "",
    stats: [],
  });
  const [team2, setTeam2] = useState({
    id: null,
    name: "",
    abbrev: "",
    logo: "",
    stats: [],
  });
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allStats, setAllStats] = useState([]);
  const [categoryDefinitions, setCategoryDefinitions] = useState([]);

  useEffect(() => {
    const fetchAllTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const teamsData = await fetchNflStandings(year);
        setAllTeams(teamsData);
        const statsData = await fetchNflTeamStats(year);
        setAllStats(statsData.teams || []);
        setCategoryDefinitions(statsData.categories || []);
      } catch (err) {
        setError("Failed to fetch team data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTeams();
  }, [year]);

  useEffect(() => {
    if (search1.length >= 2) {
      setSuggestions1(
        allTeams.filter((t) =>
          t.team.displayName.toLowerCase().includes(search1.toLowerCase())
        )
      );
    } else {
      setSuggestions1([]);
    }
  }, [search1, allTeams]);

  useEffect(() => {
    if (search2.length >= 2) {
      setSuggestions2(
        allTeams.filter((t) =>
          t.team.displayName.toLowerCase().includes(search2.toLowerCase())
        )
      );
    } else {
      setSuggestions2([]);
    }
  }, [search2, allTeams]);

  const selectTeam = (teamEntry, teamNumber) => {
    const setter = teamNumber === 1 ? setTeam1 : setTeam2;
    const searchSetter = teamNumber === 1 ? setSearch1 : setSearch2;
    const setSuggestions = teamNumber === 1 ? setSuggestions1 : setSuggestions2;

    const found = allStats.find((s) => s.team.id === teamEntry.team.id);
    let detailedStats = found ? found.categories : teamEntry.stats; // Fallback to basic stats

    setter({
      id: teamEntry.team.id,
      name: teamEntry.team.displayName,
      abbrev: teamEntry.team.abbreviation,
      logo: teamEntry.team.logos?.[0]?.href,
      stats: detailedStats,
    });
    searchSetter("");
    setSuggestions([]);
  };

  const clearTeam = (teamNumber) => {
    const setter = teamNumber === 1 ? setTeam1 : setTeam2;
    const searchSetter = teamNumber === 1 ? setSearch1 : setSearch2;
    setter({ id: null, name: "", abbrev: "", logo: "", stats: [] });
    searchSetter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-blue-900">
          NFL Team Comparison
        </div>
        <div className="flex items-center space-x-2">
          <label>Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-1 border rounded"
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamSelector
          label="Team 1:"
          search={search1}
          setSearch={setSearch1}
          suggestions={suggestions1}
          selectTeam={(t) => selectTeam(t, 1)}
          team={team1}
          clearTeam={() => clearTeam(1)}
        />
        <TeamSelector
          label="Team 2:"
          search={search2}
          setSearch={setSearch2}
          suggestions={suggestions2}
          selectTeam={(t) => selectTeam(t, 2)}
          team={team2}
          clearTeam={() => clearTeam(2)}
        />
      </div>

      {loading && (
        <p className="text-center text-gray-600">Loading team data...</p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}

      {team1.id && team2.id ? (
        <div className="border-4 border-sky-800">
          <div className="grid grid-cols-3">
            <div className="bg-sky-800 text-white py-4 px-6 flex items-center justify-center">
              ckstats
            </div>
            <TeamHeader team={team1} />
            <TeamHeader team={team2} />
          </div>

          <StatsTable
            title="Offense"
            categories={offenseCategories}
            stats1={team1.stats}
            stats2={team2.stats}
            team1={team1}
            team2={team2}
            isDefense={false}
            categoryDefinitions={categoryDefinitions}
          />

          <StatsTable
            title="Defense"
            categories={defenseCategories}
            stats1={team1.stats}
            stats2={team2.stats}
            team1={team1}
            team2={team2}
            isDefense={true}
            categoryDefinitions={categoryDefinitions}
          />
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Select two teams to compare their stats.
        </p>
      )}
    </div>
  );
};

export default NflTeamComparison;
