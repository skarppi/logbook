import * as React from 'react';

import { defaults, Bar } from 'react-chartjs-2';
import * as Color from 'color';
import { formatDuration } from '../../../../shared/utils/date';
import { cloneDeep } from 'lodash';
import { Dataset, DashboardQuery } from '../../../../shared/dashboard/types';
import { FC } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'urql';
import { DashboardUnit } from '../../../../shared/dashboard';
import { startOfYear, addYears, startOfMonth, addMonths, startOfDay, addDays } from 'date-fns';

const css = require('./Home.css');

const chartColors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f'
].map(color => {
  return [
    color,
    Color(color)
      .alpha(0.5)
      .rgbString()
  ];
});

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

const chartOptions = (max: number, query: DashboardQuery) => {

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
            unit: query.unit,
            unitStepSize: 1,
            round: query.unit,
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
}

interface IProps { query: DashboardQuery; }

function startDateFrom(query: DashboardQuery) {
  let now = new Date();
  if (query.unit === DashboardUnit.year) {
    return startOfYear(addYears(now, -query.size + 1));
  } else if (query.unit === DashboardUnit.month) {
    return startOfMonth(addMonths(now, -query.size + 1));
  } else {
    return startOfDay(addDays(now, -query.size + 1));
  }
}

const currentResource = (query: DashboardQuery) => {
  return `allFlightsBy${query.unit[0].toUpperCase() + query.unit.substring(1)}s`
}

const Query = (query: DashboardQuery) => {
  const from = query.size;
  return gql`
  query {
    ${currentResource(query)}(filter:
      {date: {
        greaterThanOrEqualTo: "${startDateFrom(query).toISOString()}"
      }}) {
      nodes {
        date
        plane
        flights
        totalTime
      }
    }
  }
`};

interface IRowsTotals {
  date: Date;
  plane: string;
  flights: number;
  totalTime: number;
}

interface IQueryResponse {
  allFlightsByMonths: {
    nodes: IRowsTotals[]
  };
}


export const GraphOverTime = (props: IProps) => {

  const { query } = props;

  if (!query.unit) {
    return (<b>Loading</b>);
  }

  const [res] = useQuery<IQueryResponse>({ query: Query(query) });

  if (res.fetching || !res.data || !res.data[currentResource(query)]) {
    return (<b>Loading</b>);
  }

  if (res.error) {
    return (<b>{res.error.message}</b>)
  }

  const rows = res.data[currentResource(query)].nodes

  const labels = rows.reduce((uniqueDates, row) => {
    if (uniqueDates.indexOf(row.date) === -1) {
      uniqueDates.push(row.date);
    }
    return uniqueDates;
  }, [])

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
    values.push(row)
    groups[row.plane] = values;
    return groups;
  }, {});

  console.log(planes);

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
    labels: labels,
    datasets: colorize(datasets)
  }

  console.log(graph);

  const options = chartOptions(maxFlightTime, query);

  return <Bar data={graph} options={options} />
}