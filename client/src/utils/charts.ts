const colors = [
  "31,119,180",
  "255,127,14",
  "44,160,44",
  "214,39,40",
  "148,103,189",
  "140,86,75",
  "227,119,194",
  "127,127,127",
  "152,223,138",
];

export const chartColors = (index: number, alpha: number) => {
  const colorIndex = index % colors.length;
  return `rgba(${colors[colorIndex]},${alpha})`;
};
