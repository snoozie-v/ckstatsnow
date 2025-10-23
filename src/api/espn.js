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
