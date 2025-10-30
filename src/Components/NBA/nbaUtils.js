export const nbaTeamColors = {
  ATL: { primary: "#E03A3E", secondary: "#C1D32F" },
  BOS: { primary: "#008348", secondary: "#BA9653" },
  BKN: { primary: "#000000", secondary: "#FFFFFF" },
  CHA: { primary: "#1D1160", secondary: "#00788C" },
  CHI: { primary: "#CE1141", secondary: "#000000" },
  CLE: { primary: "#860038", secondary: "#041E42" },
  DAL: { primary: "#00538C", secondary: "#002B5e" },
  DEN: { primary: "#0E2240", secondary: "#FEC524" },
  DET: { primary: "#C8102E", secondary: "#1d428a" },
  GSW: { primary: "#1D428A", secondary: "#ffc72c" },
  HOU: { primary: "#CE1141", secondary: "#000000" },
  IND: { primary: "#002D62", secondary: "#FDBB30" },
  LAC: { primary: "#C8102E", secondary: "#1D428A" },
  LAL: { primary: "#552583", secondary: "#FDB927" },
  MEM: { primary: "#5D76A9", secondary: "#12173F" },
  MIA: { primary: "#98002E", secondary: "#F9A01B" },
  MIL: { primary: "#00471B", secondary: "#EEE1C6" },
  MIN: { primary: "#0C2340", secondary: "#236192" },
  NOP: { primary: "#0C2340", secondary: "#C8102E" },
  NYK: { primary: "#006BB6", secondary: "#F58426" },
  OKC: { primary: "#007AC1", secondary: "#EF3B24" },
  ORL: { primary: "#0077C0", secondary: "#C4CED4" },
  PHI: { primary: "#006BB6", secondary: "#ED174C" },
  PHX: { primary: "#1D1160", secondary: "#E56020" },
  POR: { primary: "#E03A3E", secondary: "#000000" },
  SAC: { primary: "#5A2D81", secondary: "#63727A" },
  SAS: { primary: "#C4CED4", secondary: "#000000" },
  TOR: { primary: "#CE1141", secondary: "#000000" },
  UTA: { primary: "#002B5C", secondary: "#00471B" },
  WAS: { primary: "#002B5C", secondary: "#E31837" },
};

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getNbaGradient = (teamAbbr, alpha = 0.7) => {
  const abbr = teamAbbr?.toUpperCase();
  const colors = nbaTeamColors[abbr];
  if (!colors) {
    return "linear-gradient(to right, rgba(107, 114, 128, 0.7), rgba(156, 163, 175, 0.9))";
  }
  const primaryRgba = hexToRgba(colors.primary, alpha);
  const secondaryRgba = hexToRgba(colors.secondary, alpha);
  return `linear-gradient(to right, ${primaryRgba}, ${secondaryRgba})`;
};
