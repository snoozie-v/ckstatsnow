import axios from "axios";

const MLB_STATS_BASE_URL = "https://statsapi.mlb.com/api/v1";
const MLB_STITCH_BASE_URL = "https://bdfed.stitch.mlbinfra.com/bdfed/stats";

const formatForApi = (isoDate) => {
  const [y, m, d] = isoDate.split("-");
  return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
};

export const fetchMlbTeams = async (season) => {
  const response = await axios.get(
    `${MLB_STATS_BASE_URL}/teams?sportId=1&season=${season}`
  );
  return response.data.teams || [];
};

export const searchMlbPlayers = async (term, season) => {
  if (term.length < 2) return [];
  const response = await axios.get(
    `${MLB_STATS_BASE_URL}/people/search?names=${encodeURIComponent(
      term
    )}&season=${season}&hydrate=currentTeam`
  );
  return response.data.people || [];
};

export const fetchMlbPlayerDetails = async (playerId) => {
  if (!playerId) return null;
  const response = await axios.get(
    `${MLB_STATS_BASE_URL}/people/${playerId}?hydrate=currentTeam`
  );
  return response.data.people?.[0] || null;
};

export const fetchMlbPlayerStats = async ({
  playerId,
  year,
  gameType,
  useDateRange,
  startDate,
  endDate,
  selectedLeague,
}) => {
  let statsParam = "season";
  let dateParams = "";
  if (useDateRange) {
    statsParam = "byDateRange";
    dateParams = `&startDate=${formatForApi(startDate)}&endDate=${formatForApi(
      endDate
    )}`;
  }
  let leagueParam =
    selectedLeague === "AL"
      ? "&leagueIds=103"
      : selectedLeague === "NL"
      ? "&leagueIds=104"
      : "";
  const baseUrl = `${MLB_STATS_BASE_URL}/people/${playerId}/stats?stats=${statsParam}&gameType=${gameType}&season=${year}${dateParams}${leagueParam}`;
  const [hittingRes, pitchingRes] = await Promise.all([
    axios.get(`${baseUrl}&group=hitting`),
    axios.get(`${baseUrl}&group=pitching`),
  ]);
  return {
    hitting: hittingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
    pitching: pitchingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
  };
};

export const fetchMlbLeaders = async (params) => {
  const {
    group,
    sortStat,
    order,
    year,
    limit,
    offset,
    stats,
    playerPool,
    dates,
    league,
  } = params;
  const url = `${MLB_STITCH_BASE_URL}/player?env=prod&sportId=1&gameType=${params.gameType}&group=${group}&sortStat=${sortStat}&order=${order}&season=${year}&limit=${limit}&offset=${offset}&stats=${stats}&playerPool=${playerPool}${dates}${league}`;
  const response = await axios.get(url);
  return response.data.stats || [];
};

export const fetchMlbPlayoffData = async (year) => {
  const url = `${MLB_STATS_BASE_URL}/schedule/postseason/series?season=${year}&sportId=1&hydrate=team,game(boxscore)`;
  const response = await axios.get(url);
  return response.data.series || [];
};

export const fetchMlbTeamStats = async ({
  teamId,
  year,
  gameType,
  useDateRange,
  startDate,
  endDate,
  selectedLeague,
}) => {
  let statsParam = "season";
  let dateParams = "";
  if (useDateRange) {
    statsParam = "byDateRange";
    dateParams = `&startDate=${formatForApi(startDate)}&endDate=${formatForApi(
      endDate
    )}`;
  }
  let leagueParam =
    selectedLeague === "AL"
      ? "&leagueIds=103"
      : selectedLeague === "NL"
      ? "&leagueIds=104"
      : "";
  const baseUrl = `${MLB_STATS_BASE_URL}/teams/${teamId}/stats?stats=${statsParam}&gameType=${gameType}&season=${year}${dateParams}${leagueParam}`;
  const [hittingRes, pitchingRes] = await Promise.all([
    axios.get(`${baseUrl}&group=hitting`),
    axios.get(`${baseUrl}&group=pitching`),
  ]);
  return {
    hitting: hittingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
    pitching: pitchingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
  };
};
