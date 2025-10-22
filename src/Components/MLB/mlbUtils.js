// components/mlbUtils.js

export const teamColors = {
  AZ: { dark: '#A71930', light: '#E3D4AD' },
  ATL: { dark: '#13274F', light: '#CE1141' },
  BAL: { dark: '#000000', light: '#DF4601' },
  BOS: { dark: '#0C2340', light: '#BD3039' },
  CHC: { dark: '#0E3386', light: '#CC3433' },
  CWS: { dark: '#27251F', light: '#C4CED4' },
  CIN: { dark: '#000000', light: '#C6011F' },
  CLE: { dark: '#00385D', light: '#E50022' },
  COL: { dark: '#333366', light: '#C4CED4' },
  DET: { dark: '#0C2340', light: '#FA4616' },
  HOU: { dark: '#002D62', light: '#EB6E1F' },
  KC: { dark: '#004687', light: '#BD9B60' },
  LAA: { dark: '#003263', light: '#BA0021' },
  LAD: { dark: '#005A9C', light: '#A5ACAF' },
  MIA: { dark: '#EF3340', light: '#00A3E0' },
  MIL: { dark: '#12284B', light: '#FFC52F' },
  MIN: { dark: '#002B5C', light: '#D31145' },
  NYM: { dark: '#002D72', light: '#FF5910' },
  NYY: { dark: '#003087', light: '#C4CED3' },
  OAK: { dark: '#003831', light: '#EFB21E' },
  PHI: { dark: '#002D72', light: '#E81828' },
  PIT: { dark: '#27251F', light: '#FDB827' },
  SD: { dark: '#2F241D', light: '#FFC425' },
  SF: { dark: '#27251F', light: '#FD5A1E' },
  SEA: { dark: '#0C2C56', light: '#005C5C' },
  STL: { dark: '#0C2340', light: '#C41E3A' },
  TB: { dark: '#092C5C', light: '#8FBCE6' },
  TEX: { dark: '#003278', light: '#C0111F' },
  TOR: { dark: '#1D2D5C', light: '#134A8E' },
  WSH: { dark: '#14225A', light: '#AB0003' },
};

export const getGradient = (teamAbbr, alpha = 0.7) => {
  const abbr = teamAbbr.toUpperCase();
  const colors = teamColors[abbr];
  if (!colors) {
    return 'linear-gradient(to right, rgba(107, 114, 128, 0.7), rgba(156, 163, 175, 0.9))'; // Converted your default grays to RGBA
  }
  const darkRgba = hexToRgba(colors.dark, alpha);
  const lightRgba = hexToRgba(colors.light, alpha);
  return `linear-gradient(to right, ${darkRgba}, ${lightRgba})`;
};

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
