import * as React from 'react';

import { defaults, Bar } from 'react-chartjs-2';
import * as Color from 'color';
import { chartColors } from '../../../utils/charts';
import { BatteryCycle } from '../../../../shared/batteries/types';
import { formatDuration } from '../../../../shared/utils/date';

interface IProps {
  cycles: BatteryCycle[];
}

const chartOptions = () => {

  return {
    offset: true,
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (tooltipItem, data) => {
          let label = data.datasets[tooltipItem.datasetIndex].label || '';

          return `${label}: ${formatDuration(tooltipItem.yLabel)}`;
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
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
            unit: 'day',
            // unitStepSize: 1,
            // round: 'day',
            tooltipFormat: 'D MMMM YYYY',
          },
          ticks: {
            //   source: 'labels',
            autoSkip: true,
            maxTicksLimit: 20
          },
          // scaleLabel: {
          //   display: true,
          //   labelString: 'Date'
          // }
        }
      ],
      yAxes: [
        {
          id: 'time',
          // position: 'left',
          // scaleLabel: {
          //   display: true,
          // },
          ticks: {
            callback: value => formatDuration(value),
            stepSize: 60,
            //   // suggestedMax: 100,
            min: 0
          },
          stacked: true
        }
      ]
    }
  };
};

export const PlaneGraph = ({ cycles }: IProps) => {

  const flights = cycles.filter(c => c.flightByFlightId);

  const labels = flights.map(row => row.date);

  const datasets = [
    {
      label: 'Flight time',
      type: 'bar',
      yAxisID: 'time',
      data: flights.map(c => c.flightByFlightId.flightTime),
      borderColor: chartColors[0][0],
      backgroundColor: chartColors[0][1],
    },
    {
      label: 'Armed time',
      type: 'bar',
      yAxisID: 'time',
      data: flights.map(c => c.flightByFlightId.armedTime - c.flightByFlightId.flightTime),
      borderColor: chartColors[1][0],
      backgroundColor: chartColors[1][1],
    }
  ]

  const graph = {
    labels,
    datasets
  };

  console.log(graph);

  const options = chartOptions();

  return <Bar data={graph} options={options} />;
};