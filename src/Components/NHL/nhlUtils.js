// components/nhlUtils.js

export const teamColors = {
  ANA: { dark: "#000000", light: "#F47A38" },
  ARI: { dark: "#8C2633", light: "#E2D6B5" },
  BOS: { dark: "#000000", light: "#FFB81C" },
  BUF: { dark: "#002654", light: "#FCB514" },
  CGY: { dark: "#C8102E", light: "#F1BE48" },
  CAR: { dark: "#CC0000", light: "#000000" },
  CHI: { dark: "#CF0A2C", light: "#000000" },
  COL: { dark: "#6F263D", light: "#236192" },
  CBJ: { dark: "#002654", light: "#CE1126" },
  DAL: { dark: "#006847", light: "#8F8F8C" },
  DET: { dark: "#CE1126", light: "#FFFFFF" },
  EDM: { dark: "#041E42", light: "#FF4C00" },
  FLA: { dark: "#041E42", light: "#C8102E" },
  LAK: { dark: "#111111", light: "#A2AAAD" },
  MIN: { dark: "#154734", light: "#A6192E" },
  MTL: { dark: "#AF1E2D", light: "#192168" },
  NSH: { dark: "#FFB81C", light: "#041E42" },
  NJD: { dark: "#CE1126", light: "#000000" },
  NYI: { dark: "#00539B", light: "#F47D30" },
  NYR: { dark: "#0038A8", light: "#CE1126" },
  OTT: { dark: "#C52032", light: "#000000" },
  PHI: { dark: "#F74902", light: "#000000" },
  PIT: { dark: "#000000", light: "#FCB514" },
  SJS: { dark: "#006D75", light: "#EA7200" },
  SEA: { dark: "#001628", light: "#99D9D9" },
  STL: { dark: "#002F87", light: "#FCB514" },
  TBL: { dark: "#002868", light: "#FFFFFF" },
  TOR: { dark: "#00205B", light: "#FFFFFF" },
  VAN: { dark: "#00205B", light: "##00843D" },
  VGK: { dark: "#B4975A", light: "#333F42" },
  WSH: { dark: "#041E42", light: "#C8102E" },
  WPG: { dark: "#041E42", light: "#AC162C" },
};

export const getGradient = (teamAbbr, alpha = 0.7) => {
  const abbr = teamAbbr?.toUpperCase();
  const colors = teamColors[abbr];
  if (!colors) {
    return "linear-gradient(to right, rgba(107, 114, 128, 0.7), rgba(156, 163, 175, 0.9))";
  }
  const darkRgba = hexToRgba(colors.dark, alpha);
  const lightRgba = hexToRgba(colors.light, alpha);
  return `linear-gradient(to right, ${darkRgba}, ${lightRgba})`;
};

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
