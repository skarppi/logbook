import * as Color from 'color';

export const chartColors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#98df8a',

].map(color => {
  return [
    color,
    Color(color)
      .alpha(0.5)
      .rgbString()
  ];
});
