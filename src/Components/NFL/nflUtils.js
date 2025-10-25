// components/NFL/nflUtils.js

export const nflTeamColors = {
  ARI: { primary: "#97233F", secondary: "#000000" },
  ATL: { primary: "#A71930", secondary: "#000000" },
  BAL: { primary: "#241773", secondary: "#9E7C0C" },
  BUF: { primary: "#00338D", secondary: "#C60C30" },
  CAR: { primary: "#0085CA", secondary: "#101820" },
  CHI: { primary: "#0B162A", secondary: "#C83803" },
  CIN: { primary: "#FB4F14", secondary: "#000000" },
  CLE: { primary: "#311D00", secondary: "#FF3C00" },
  DAL: { primary: "#041E42", secondary: "#869397" },
  DEN: { primary: "#FB4F14", secondary: "#002244" },
  DET: { primary: "#0076B6", secondary: "#B0B7BC" },
  GB: { primary: "#203731", secondary: "#FFB612" },
  HOU: { primary: "#03202F", secondary: "#A71930" },
  IND: { primary: "#002C5F", secondary: "#A2AAAD" },
  JAX: { primary: "#101820", secondary: "#006778" },
  KC: { primary: "#E31837", secondary: "#FFB81C" },
  LV: { primary: "#000000", secondary: "#A5ACAF" },
  LAC: { primary: "#0080C6", secondary: "#FFC20E" },
  LAR: { primary: "#003594", secondary: "#FFA300" },
  MIA: { primary: "#008E97", secondary: "#FC4C02" },
  MIN: { primary: "#4F2683", secondary: "#FFC62F" },
  NE: { primary: "#002244", secondary: "#C60C30" },
  NO: { primary: "#D3BC8D", secondary: "#101820" },
  NYG: { primary: "#0B2265", secondary: "#A71930" },
  NYJ: { primary: "#125740", secondary: "#FFFFFF" },
  PHI: { primary: "#004C54", secondary: "#A5ACAF" },
  PIT: { primary: "#FFB612", secondary: "#101820" },
  SF: { primary: "#AA0000", secondary: "#B3995D" },
  SEA: { primary: "#002244", secondary: "#69BE28" },
  TB: { primary: "#D50A0A", secondary: "#34302B" },
  TEN: { primary: "#0C2340", secondary: "#4B92DB" },
  WAS: { primary: "#5A1414", secondary: "#FFB612" },
};

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getNflGradient = (teamAbbr, alpha = 0.7) => {
  const abbr = teamAbbr?.toUpperCase();
  const colors = nflTeamColors[abbr];
  if (!colors) {
    return "linear-gradient(to right, rgba(107, 114, 128, 0.7), rgba(156, 163, 175, 0.9))";
  }
  const primaryRgba = hexToRgba(colors.primary, alpha);
  const secondaryRgba = hexToRgba(colors.secondary, alpha);
  return `linear-gradient(to right, ${primaryRgba}, ${secondaryRgba})`;
};
