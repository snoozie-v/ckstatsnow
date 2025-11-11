import axios from "axios";

const NFL_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const NFL_CORE_URL = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";

const formatForApi = (isoDate) => isoDate.replace(/-/g, '');

export const fetchNflTeams = async (season) => {
  const response = await axios.get(`${NFL_CORE_URL}/seasons/${season}/teams?limit=40`);
  const teamRefs = response.data.items;
  const teams = await Promise.all(
    teamRefs.map(async (item) => {
      const secureRef = item.$ref.replace(/^http:/, 'https:');
      const teamRes = await axios.get(secureRef);
      return teamRes.data;
    })
  );
  return teams || [];
};

export const searchNflPlayers = async (term, season) => {
  if (term.length < 2) return [];
  const termLower = term.toLowerCase();
  const teamResponse = await axios.get(`${NFL_BASE_URL}/teams`);
  const teams = teamResponse.data.leagues[0].teams;
  const rosters = await Promise.all(
    teams.map(async (team) => {
      const rosterRes = await axios.get(`${NFL_BASE_URL}/teams/${team.team.id}/roster`);
      return rosterRes.data.athletes.flatMap(group =>
        group.items.map(player => ({ ...player, currentTeam: team.team }))
      );
    })
  );
  const allPlayers = rosters.flat();
  return allPlayers.filter(player => player.fullName.toLowerCase().includes(termLower));
};

export const fetchNflPlayerDetails = async (playerId) => {
  if (!playerId) return null;
  const response = await axios.get(`${NFL_CORE_URL}/athletes/${playerId}`);
  const player = response.data;
  if (player.team && player.team.$ref) {
    const secureRef = player.team.$ref.replace(/^http:/, 'https:');
    const teamRes = await axios.get(secureRef);
    player.currentTeam = teamRes.data;
  }
  return player || null;
};

export const fetchNflPlayerStats = async ({
  playerId,
  year,
  gameType,
  useDateRange,
  startDate,
  endDate,
  selectedLeague,
}) => {
  let seasontype = '2'; // regular
  if (gameType === 'P') seasontype = '1'; // preseason
  if (gameType === 'O') seasontype = '3'; // postseason

  if (useDateRange) {
    // TODO: Implement sum of stats from individual games in the date range
    console.warn('Date range stats not yet implemented for NFL');
    return {};
  } else {
    const url = `${NFL_CORE_URL}/seasons/${year}/types/${seasontype}/athletes/${playerId}/statistics`;
    const response = await axios.get(url);
    return response.data || {};
  }
};

export const fetchNflLeaders = async ({
  statType, // 'season' or 'byDateRange'
  group,
  sortStat,
  order,
  season,
  limit,
  offset,
  gameType,
  playerPool, // 'qualified', 'AFC', 'NFC'
  useDateRange,
  startDate,
  endDate,
}) => {
  let seasontype = '2'; // regular
  if (gameType === 'P') seasontype = '1';
  if (gameType === 'O') seasontype = '3';

  const params = {
    season,
    seasontype,
    limit,
    offset,
  };

  if (statType === 'byDateRange' || useDateRange) {
    // TODO: Check if API supports date range for leaders
    console.warn('Date range for leaders not yet implemented for NFL');
  }

  if (sortStat) {
    params.stat = sortStat;
  }

  if (order === 'descending') {
    params.order = 'desc'; // assume
  } else {
    params.order = 'asc';
  }

  if (playerPool === 'qualified') {
    params.qualified = true;
  } else if (playerPool === 'AFC') {
    params.conference = 'AFC';
  } else if (playerPool === 'NFC') {
    params.conference = 'NFC';
  }

  const url = new URL(`${NFL_BASE_URL}/leaders`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });

  const response = await axios.get(url.toString());
  return response.data.leaders || [];
};

export const fetchNflPlayoffData = async (year) => {
  const response = await axios.get(`${NFL_CORE_URL}/seasons/${year}/types/3/events?limit=20`);
  const eventRefs = response.data.items;
  const series = await Promise.all(
    eventRefs.map(async (item) => {
      const secureRef = item.$ref.replace(/^http:/, 'https:');
      const eventRes = await axios.get(secureRef);
      // Optionally hydrate with boxscore if needed
      return eventRes.data;
    })
  );
  return series || [];
};

export const fetchNflTeamStats = async ({
  teamId,
  year,
  gameType,
  selectedLeague,
  week, // New param for single week
}) => {
  let seasontype = '2'; // regular
  if (gameType === 'P') seasontype = '1';
  if (gameType === 'O') seasontype = '3';

  if (week) {
    // Fetch stats for a single week (game box score)
    const scheduleRes = await axios.get(`${NFL_BASE_URL}/teams/${teamId}/schedule?season=${year}`);
    const game = scheduleRes.data.events.find(e => e.week.number === parseInt(week) && e.seasonType.type === parseInt(seasontype));
    if (!game) {
      console.warn(`No game found for team ${teamId} in week ${week}`);
      return {};
    }
    const eventId = game.id;
    const summaryRes = await axios.get(`${NFL_BASE_URL}/summary?event=${eventId}`);
    const summary = summaryRes.data;
    const competitors = summary.header.competitions[0].competitors;
    const teamCompetitor = competitors.find(c => c.id === teamId.toString());
    const oppCompetitor = competitors.find(c => c.id !== teamId.toString());
    const teamScore = teamCompetitor ? teamCompetitor.score.value : '0';
    const oppScore = oppCompetitor ? oppCompetitor.score.value : '0';
    const boxTeams = summary.boxscore ? summary.boxscore.teams : [];
    const teamBox = boxTeams.find(t => t.team.id === teamId.toString());
    const oppBox = boxTeams.find(t => t.team.id !== teamId.toString());
    const teamStatsArr = teamBox ? teamBox.statistics : [];
    const oppStatsArr = oppBox ? oppBox.statistics : [];
    const findStat = (stats, name) => {
      const stat = stats.find(s => s.name === name);
      return stat ? stat.displayValue : '0';
    };

    const compAtt = findStat(teamStatsArr, 'completionAttempts');
    const completions = compAtt.split('/')[0] || '0';
    const attempts = compAtt.split('/')[1] || '0';
    const cmpPct = attempts !== '0' ? (parseFloat(completions) / parseFloat(attempts) * 100).toFixed(1) : '0.0';
    const passerRating = findStat(teamStatsArr, 'QB Rating') || '0.0'; // May need correct name
    const passingTD = findStat(teamStatsArr, 'passingTouchdowns') || '0';
    const sacks = findStat(oppStatsArr, 'sacksYardsLost').split('-')[0] || '0';
    const interceptions = findStat(oppStatsArr, 'interceptions') || '0';
    const totalTackles = findStat(teamStatsArr, 'totalTackles') || '0';
    const tfl = findStat(teamStatsArr, 'tacklesForLoss') || '0';
    const safeties = findStat(teamStatsArr, 'safeties') || '0';

    // Construct categories to match cumulative structure
    const categories = [
      {
        abbreviation: 'pass',
        name: 'passing',
        stats: [
          { abbreviation: 'PTS', displayValue: teamScore, value: parseFloat(teamScore) },
          { abbreviation: 'TYDS', displayValue: findStat(teamStatsArr, 'totalYards'), value: parseFloat(findStat(teamStatsArr, 'totalYards').replace(/,/g, '')) || 0 },
          { abbreviation: 'YDS', displayValue: findStat(teamStatsArr, 'netPassingYards'), value: parseFloat(findStat(teamStatsArr, 'netPassingYards').replace(/,/g, '')) || 0 },
          { abbreviation: 'TD', displayValue: passingTD, value: parseFloat(passingTD) },
          { abbreviation: 'CMP', displayValue: completions, value: parseFloat(completions) },
          { abbreviation: 'CMP%', displayValue: cmpPct, value: parseFloat(cmpPct) },
          { abbreviation: 'RTG', displayValue: passerRating, value: parseFloat(passerRating) },
        ],
      },
      {
        abbreviation: 'rush',
        name: 'rushing',
        stats: [
          { abbreviation: 'YDS', displayValue: findStat(teamStatsArr, 'rushingYards'), value: parseFloat(findStat(teamStatsArr, 'rushingYards').replace(/,/g, '')) || 0 },
        ],
      },
      {
        abbreviation: 'rec',
        name: 'receiving',
        stats: [
          { abbreviation: 'YDS', displayValue: findStat(teamStatsArr, 'netPassingYards'), value: parseFloat(findStat(teamStatsArr, 'netPassingYards').replace(/,/g, '')) || 0 },
        ],
      },
      {
        abbreviation: 'def',
        name: 'defensive',
        stats: [
          { abbreviation: 'PA', displayValue: oppScore, value: parseFloat(oppScore) },
          { abbreviation: 'YA', displayValue: findStat(oppStatsArr, 'totalYards'), value: parseFloat(findStat(oppStatsArr, 'totalYards').replace(/,/g, '')) || 0 },
          { abbreviation: 'SACK', displayValue: sacks, value: parseFloat(sacks) },
          { abbreviation: 'TOT', displayValue: totalTackles, value: parseFloat(totalTackles) },
          { abbreviation: 'TFL', displayValue: tfl, value: parseFloat(tfl) },
          { abbreviation: 'SAFE', displayValue: safeties, value: parseFloat(safeties) },
        ],
      },
      {
        abbreviation: 'defint',
        name: 'defensiveInterceptions',
        stats: [
          { abbreviation: 'INT', displayValue: interceptions, value: parseFloat(interceptions) },
        ],
      },
    ];
    return { splits: { categories } };
  } else {
    const url = `${NFL_CORE_URL}/seasons/${year}/types/${seasontype}/teams/${teamId}/statistics`;
    const response = await axios.get(url);
    return response.data || {};
  }
};
