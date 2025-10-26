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
  const url = new URL(`${MLB_STATS_BASE_URL}/people/${playerId}/stats`);
  const params = {
    stats: useDateRange ? "byDateRange" : "season",
    gameType,
    sportId: 1,
  };

  if (useDateRange) {
    params.startDate = formatForApi(startDate);
    params.endDate = formatForApi(endDate);
  } else {
    params.season = year;
  }

  if (selectedLeague === "AL") {
    params.leagueId = 103;
  } else if (selectedLeague === "NL") {
    params.leagueId = 104;
  }

  const baseUrl = `${url.toString()}?${new URLSearchParams(params).toString()}`;
  const [hittingRes, pitchingRes] = await Promise.all([
    axios.get(`${baseUrl}&group=hitting`),
    axios.get(`${baseUrl}&group=pitching`),
  ]);
  return {
    hitting: hittingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
    pitching: pitchingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
  };
};

export const fetchMlbLeaders = async ({
  statType, // 'season' or 'byDateRange'
  group,
  sortStat,
  order,
  season,
  limit,
  offset,
  gameType,
  playerPool, // Now used as league filter ('qualified' for MLB, 'AL', 'NL')
  useDateRange,
  startDate,
  endDate,
}) => {
  const url = new URL("https://statsapi.mlb.com/api/v1/stats");
  const params = {
    stats: statType,
    group,
    sortStat,
    order,
    limit,
    offset,
    gameType,
    sportId: 1,
    playerPool: 'qualified', // Standardize to qualified for proper leaders
  };

  // League filtering
  if (playerPool === "AL") {
    params.leagueId = 103;
  } else if (playerPool === "NL") {
    params.leagueId = 104;
  }

  if (useDateRange) {
    params.startDate = formatForApi(startDate);
    params.endDate = formatForApi(endDate);
  } else {
    params.season = season;
  }

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });

  const response = await axios.get(url.toString());
  return response.data?.stats?.[0]?.splits || [];
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
  const url = new URL(`${MLB_STATS_BASE_URL}/teams/${teamId}/stats`);
  const params = {
    stats: useDateRange ? "byDateRange" : "season",
    gameType,
    sportId: 1,
  };

  if (useDateRange) {
    params.startDate = formatForApi(startDate);
    params.endDate = formatForApi(endDate);
  } else {
    params.season = year;
  }

  if (selectedLeague === "AL") {
    params.leagueId = 103;
  } else if (selectedLeague === "NL") {
    params.leagueId = 104;
  }

  const baseUrl = `${url.toString()}?${new URLSearchParams(params).toString()}`;
  const [hittingRes, pitchingRes] = await Promise.all([
    axios.get(`${baseUrl}&group=hitting`),
    axios.get(`${baseUrl}&group=pitching`),
  ]);
  return {
    hitting: hittingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
    pitching: pitchingRes.data.stats?.[0]?.splits?.[0]?.stat || {},
  };
};
