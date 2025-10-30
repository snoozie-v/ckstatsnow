import axios from "axios";

const NHL_STATS_BASE_URL = "https://statsapi.web.nhl.com/api/v1";

// Placeholder for date formatting if needed by the NHL API
const formatForApi = (isoDate) => {
  return isoDate; // NHL API uses 'YYYY-MM-DD'
};

export const fetchNhlTeams = async (season) => {
  // Example: '20232024' for the 2023-24 season
  const response = await axios.get(
    `${NHL_STATS_BASE_URL}/teams?season=${season}`
  );
  return response.data.teams || [];
};

export const searchNhlPlayers = async (term) => {
  if (term.length < 2) return [];
  // This is a simplified search. A real implementation might need a local player list or a different endpoint.
  const response = await axios.get(
    `${NHL_STATS_BASE_URL}/teams?expand=team.roster`
  );
  const allPlayers = response.data.teams.flatMap((team) =>
    team.roster.roster.map((p) => ({ ...p.person, team: team.abbreviation }))
  );
  return allPlayers.filter((p) =>
    p.fullName.toLowerCase().includes(term.toLowerCase())
  );
};

export const fetchNhlPlayerDetails = async (playerId) => {
  if (!playerId) return null;
  const response = await axios.get(`${NHL_STATS_BASE_URL}/people/${playerId}`);
  return response.data.people?.[0] || null;
};

export const fetchNhlPlayerStats = async ({
  playerId,
  year, // e.g., '20232024'
}) => {
  // This is a simplified example. The NHL API for stats can be complex.
  const response = await axios.get(
    `${NHL_STATS_BASE_URL}/people/${playerId}/stats?stats=statsSingleSeason&season=${year}`
  );
  const stats = response.data.stats?.[0]?.splits?.[0]?.stat || {};
  // The NHL API returns skater and goalie stats in the same object, so we'll just return it.
  // The component will need to determine if the player is a goalie or skater.
  return {
    skating: stats,
    goaltending: stats,
  };
};

export const fetchNhlLeaders = async ({
  group, // 'skater' or 'goalie'
  sortStat,
  season,
}) => {
  // NHL API for leaders is structured differently. This is a placeholder.
  // A real implementation would likely hit /stats/leaders and specify skater or goalie stats.
  console.log("Fetching NHL Leaders:", { group, sortStat, season });
  return [];
};

export const fetchNhlTeamStats = async ({ teamId, year }) => {
  const response = await axios.get(
    `${NHL_STATS_BASE_URL}/teams/${teamId}/stats?stats=statsSingleSeason&season=${year}`
  );

  const teamStats = response.data.stats?.[0]?.splits?.[0]?.stat || {};
  const teamRankings = response.data.stats?.[1]?.splits?.[0]?.stat || {};

  // The NHL API provides stats and rankings separately. We can combine them.
  // For simplicity, we'll just return the main stats for now.
  // A full implementation would need to parse and structure this more carefully.
  return {
    hitting: teamStats, // Repurposing 'hitting' for skaters
    pitching: {}, // 'pitching' for goalies, may need a separate call or parsing
  };
};

// NHL API does not have a direct equivalent for Chadwick to Baseball-Reference.
// This will be a no-op for now.
export const fetchNhlReferenceId = async (nhlId) => {
  console.log("NHL reference ID lookup not implemented for ID:", nhlId);
  return null;
};
