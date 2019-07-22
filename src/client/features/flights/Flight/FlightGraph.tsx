import * as React from 'react';

import { defaults, Bar } from 'react-chartjs-2';
import * as Color from 'color';
import { Segment, SegmentItem } from '../../../../shared/flights/types';
import { Plane, Telemetry } from '../../../../shared/planes/types';
import { SegmentType } from '../../../../shared/flights';
import { chartColors } from '../../../utils/charts';

const segmentTypeToYAxis = {
  [SegmentType.flying]: 1024,
  [SegmentType.armed]: 512,
  [SegmentType.stopped]: 0
}

export interface ITotalRows {
  date: Date;
  plane: string;
  flights: number;
  totalTime: number;
}

interface IProps {
  segments: Segment[];
  plane: Plane;
}

const chartOptions = (plane: Plane) => {

  return {
    offset: true,
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (tooltipItem, data) => {
          const label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label === 'Timer') {
            const currentType = Object.keys(segmentTypeToYAxis).find(type => {
              return segmentTypeToYAxis[type] === tooltipItem.yLabel;
            });
            return `${label}: ${currentType}`;
          } else if (label === 'FM' && plane.flightModes.length > tooltipItem.yLabel) {
            return `${label}: ${plane.flightModes[tooltipItem.yLabel]}`;
          } else {
            return `${label}: ${tooltipItem.yLabel}`;
          }
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
            unit: 'second',
            unitStepSize: 1,
            round: 'second',
            tooltipFormat: 'H:mm:ss',
            displayFormats: {
              second: 'H:mm:ss'
            }
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
          id: 'stick',
          position: 'left',
          scaleLabel: {
            display: true,
          },
          ticks: {
            // callback: value => formatDuration(value * 60),
            stepSize: 128,
            suggestedMax: 1024,
            suggestedMin: -1024
          }
        },
        {
          id: 'default',
          position: 'right',
          scaleLabel: {
            display: true,
          },
          ticks: {
            suggestedMin: 0
          }
        },
        {
          id: 'binary',
          position: 'right',
          scaleLabel: {
            display: true,
          },
          ticks: {
            suggestedMin: -1,
            suggestedMax: 1
          }
        }
      ]
    }
  };
};

// const alwaysIgnoreTelemetries = ['Date', 'Time', 'LSW'];

const axisMappings = {
  Ail: 'stick',
  Ele: 'stick',
  LS: 'stick',
  RS: 'stick',
  Rud: 'stick',
  S1: 'stick',
  S2: 'stick',
  SA: 'binary',
  SB: 'binary',
  SC: 'binary',
  SD: 'binary',
  SE: 'binary',
  SF: 'binary',
  SG: 'binary',
  SH: 'binary',
  Thr: 'stick',
  'AccX(g)': 'binary',
  'AccY(g)': 'binary',
  'AccZ(g)': 'binary',
  'Hdg(@)': 'stick'
}

// const enabledTelemetries = ['Thr', 'Fuel(mAh)', 'Alt(m)']

export const FlightGraph = ({ segments, plane }: IProps) => {

  const telemetries: Map<string, Telemetry> = plane && plane.telemetries || new Map();

  // const ignoreTelemetries = [...alwaysIgnoreTelemetries, ...(plane && plane.ignoreTelemetries || [])];

  const items = segments.reduce<SegmentItem[]>((prev, cur) => [...prev, ...cur.rows], []);

  const fields = Object.keys(items[0] || {}).filter(field => !telemetries.has(field) || !telemetries.get(field).ignore);

  const labels = items.map(row => row.Date + ' ' + row.Time);

  const flightTimeSet = {
    label: 'Timer',
    type: 'line',
    yAxisID: 'stick',
    fill: 'start',
    data: items.map(i => {
      const now = new Date(`${i.Date} ${i.Time}`)
      const current = segments.find(seg => new Date(seg.startDate) <= now && new Date(seg.endDate) >= now);
      return current && segmentTypeToYAxis[current.type] || segmentTypeToYAxis[SegmentType.stopped];
    }),
    backgroundColor: Color('#81c784').alpha(0.1).rgbString(),
    borderWidth: 0,
    pointStyle: 'dash'
  };

  const datasets = fields.map((field, index) => {
    const colorIndex = index % chartColors.length;
    const hidden = !telemetries.has(field) || !telemetries.get(field).default;
    return {
      label: field,
      type: 'line',
      fill: false,
      hidden,
      yAxisID: axisMappings[field] || 'default',
      data: items.map(i => i[field]),
      pointRadius: 0,
      borderColor: chartColors[colorIndex][0],
      backgroundColor: chartColors[colorIndex][1],
      borderWidth: 1,
    };
  });

  const graph = {
    labels,
    datasets: [flightTimeSet, ...datasets]
  };

  const options = chartOptions(plane);

  return <Bar data={graph} options={options} />;
};