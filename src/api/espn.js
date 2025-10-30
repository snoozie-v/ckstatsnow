import axios from "axios";

const ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_FANTASY_BASE_URL =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

const pad = (n) => String(n).padStart(2, "0");

const formatDateForESPN = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${year}${pad(month)}${pad(day)}`;
};

export const fetchScoresByDate = async (sport, date) => {
  let url;
  if (sport === "football/nfl") {
    // NFL needs a week-long date range (e.g., Thursday to next Tuesday)
    const startDate = new Date(date);
    const thursStr = formatDateForESPN(date);
    const tue = new Date(startDate);
    tue.setDate(startDate.getDate() + 5); // Tuesday to capture Monday night UTC
    const tueStr = `${tue.getFullYear()}${pad(tue.getMonth() + 1)}${pad(
      tue.getDate()
    )}`;
    url = `${ESPN_BASE_URL}/${sport}/scoreboard?dates=${thursStr}-${tueStr}`;
  } else {
    // Other sports use a single date
    const espnDate = formatDateForESPN(date);
    url = `${ESPN_BASE_URL}/${sport}/scoreboard?dates=${espnDate}-${espnDate}`;
  }
  const response = await axios.get(url);
  return response.data.events || [];
};

export const fetchGameSummary = async (sport, eventId) => {
  const url = `${ESPN_BASE_URL}/${sport}/summary?event=${eventId}`;
  const response = await axios.get(url);
  return response.data;
};

export const fetchNflFantasyLeaders = async (year) => {
  const url = `${ESPN_FANTASY_BASE_URL}/${year}/players?view=kona_player_info`;
  const headers = {
    "X-Fantasy-Filter": JSON.stringify({
      players: { limit: 2000, filterActive: { value: true } },
    }),
  };
  const response = await axios.get(url, { headers });
  return response.data || [];
};

export const fetchNflStandings = async (season) => {
  const url = `https://cdn.espn.com/core/nfl/standings/_/season/${season}?xhr=1`;
  const response = await axios.get(url);
  // Flatten the nested structure to get a simple array of all team entries
  return (
    response.data?.content?.standings?.groups?.flatMap((conf) =>
      conf.groups.flatMap((div) => div.standings.entries)
    ) || []
  );
};

export const fetchNbaStandings = async (season) => {
  const url = `https://cdn.espn.com/core/nba/standings/_/season/${season}?xhr=1`;
  const response = await axios.get(url);
  // Flatten the nested structure to get a simple array of all team entries
  return (
    response.data?.content?.standings?.groups?.flatMap((conf) =>
      conf.standings.entries.map((entry) => ({
        ...entry,
        conference: conf.name,
      }))
    ) || []
  );
};

export const fetchNflTeamStats = async (year) => {
  const response = await fetch(
    `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byteam?season=${year}&seasontype=2`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch team stats");
  }
  const data = await response.json();
  return data.teams; // Array of { team: {id, ...}, categories: [...] }
};
