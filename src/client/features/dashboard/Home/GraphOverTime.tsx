import * as React from 'react';

import { defaults, Bar } from 'react-chartjs-2';
import { formatDuration } from '../../../../shared/utils/date';
import { cloneDeep } from 'lodash';
import { Dataset } from '../../../../shared/dashboard/types';
import { DashboardUnit } from '../../../../shared/dashboard';
import { chartColors } from '../../../utils/charts';

const css = require('./Home.css');

defaults['global'].elements.line.fill = false;

function yAxisStepSize(max: number) {
  if (max < 1440) {
    if (max <= 60) {
      // scale in minutes
      return max <= 10 ? 1 : 10;
    } else {
      // scale in hours
      return 60;
    }
  } else {
    // scale in days
    return 60 * 24;
  }
}

// every plane contains two set of datasets, use same color for both
function colorize(datasets: Dataset[]) {
  return datasets.map((dataset, index) => {
    const colorIndex = Math.floor(index / 2);

    dataset['borderColor'] = chartColors[colorIndex][0];
    dataset['backgroundColor'] = chartColors[colorIndex][1];
    dataset['borderWidth'] = 1;

    return dataset;
  });
}

const chartOptions = (max: number, unit: DashboardUnit) => {

  return {
    offset: true,
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || '';

          if (label) {
            label += ': ';
          }
          if (label.toLowerCase().indexOf('time') !== -1) {
            label += formatDuration(tooltipItem.yLabel * 60);
          } else {
            label += tooltipItem.yLabel;
          }
          return label;
        }
      }
    },
    legend: {
      labels: {
        // show legend only once per plane
        filter: item => item.datasetIndex % 2 === 0,
        generateLabels: item2 => {
          // show only plane name
          const item = cloneDeep(item2);
          if (item2.data) {
            item.data = cloneDeep(item2.data);
            item.data.datasets = item.data.datasets.map(dataset => {
              const trimPoint = dataset.label.indexOf(' ');
              if (trimPoint > 0) {
                dataset.label = dataset.label.substring(0, trimPoint);
              }

              return dataset;
            });
          }

          return defaults['global'].legend.labels.generateLabels(item);
        }
      }
    },
    responsive: true,
    layout: {
      padding: {
        left: 0,
        top: 50,
        bottom: 0
      }
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit,
            unitStepSize: 1,
            round: unit,
            tooltipFormat: 'D MMMM YYYY',
            displayFormats: {}
          },
          ticks: {
            source: 'labels',
            autoSkip: true,
            maxTicksLimit: 20
          },
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
        }
      ],
      yAxes: [
        {
          id: 'time',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'Flight time'
          },
          ticks: {
            callback: value => formatDuration(value * 60),
            stepSize: yAxisStepSize(max),
            min: 0
          },
          stacked: true
        },
        {
          id: 'count',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Flights'
          },
          ticks: {
            min: 0
          },
          stacked: true
        }
      ]
    }
  };
};

export interface ITotalRows {
  date: Date;
  plane: string;
  flights: number;
  totalTime: number;
}

interface IProps {
  rows: ITotalRows[];
  unit: DashboardUnit;
}

export const GraphOverTime = ({ rows, unit }: IProps) => {

  const labels = rows.reduce((uniqueDates, row) => {
    if (uniqueDates.indexOf(row.date) === -1) {
      uniqueDates.push(row.date);
    }
    return uniqueDates;
  }, []);

  const flightTimesPerGroup = labels.map(label =>
    rows.reduce((total, row) => {
      if (row.date === label) {
        total += row.totalTime;
      }
      return total;
    }, 0)
  );

  const planes = rows.reduce((groups, row) => {
    const values = groups[row.plane] || [];
    values.push(row);
    groups[row.plane] = values;
    return groups;
  }, {});

  const datasets = [];

  Object.keys(planes).sort().forEach((plane, index) => {
    const values = planes[plane];

    datasets.push(
      {
        label: `${plane} FlightTime`,
        type: 'bar',
        yAxisID: 'time',
        data: labels.map(label => {
          const current = values.find(v => v.date === label);
          return current ? current.totalTime / 60 : 0;
        })
      }
    );
    datasets.push(
      {
        label: `${plane} Flights`,
        type: 'line',
        yAxisID: 'count',
        data: labels.map(label => {
          const current = values.find(v => v.date === label);
          return current ? current.flights : 0;
        })
      }
    );
  });

  const maxFlightTime = Math.max(...flightTimesPerGroup) / 60;

  const graph = {
    labels,
    datasets: colorize(datasets)
  };

  const options = chartOptions(maxFlightTime, unit);

  return <Bar data={graph} options={options} />;
};