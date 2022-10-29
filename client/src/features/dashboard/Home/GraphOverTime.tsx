import * as React from "react";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Tooltip,
} from "chart.js";
import { formatDuration } from "../../../../../shared/utils/date";
import { DashboardUnit } from "../../../../../shared/dashboard";
import { chartColors } from "../../../utils/charts";
import { _DeepPartialObject } from "chart.js/types/utils";

ChartJS.defaults.elements.line.fill = false;
ChartJS.register(Tooltip);

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
function colorize(datasets: ChartDataset<"bar">[]): ChartDataset<"bar">[] {
  return datasets.map((dataset, index) => {
    const colorIndex = Math.floor(index / 2);

    dataset["borderColor"] = chartColors(colorIndex, 1);
    dataset["backgroundColor"] = chartColors(colorIndex, 0.5);
    dataset["borderWidth"] = 1;

    return dataset;
  });
}

const chartOptions = (
  max: number,
  unit: DashboardUnit
): _DeepPartialObject<ChartOptions<"bar">> => {
  return {
    //offset: true,
    plugins: {
      tooltip: {
        mode: "point",
        intersect: false,
        callbacks: {
          label: function (context) {
            const data = context.dataset;

            var label = data.label || "";

            if (label) {
              label += ": ";
            }
            if (label.toLowerCase().indexOf("time") !== -1) {
              label += formatDuration(context.parsed.y * 60);
            } else {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
      legend: {
        labels: {
          // show legend only once per plane
          filter: (item) => (item.datasetIndex ?? 0) % 2 === 0,
          generateLabels: (chart) => {
            // show only plane name
            // const item = cloneDeep(item2);
            if (chart.data) {
              const originalDatasets = chart.data.datasets;
              chart.data.datasets = chart.data.datasets.map((ds) => {
                const dataset = Object.assign({}, ds);
                const trimPoint = dataset.label?.indexOf(" ");
                if (trimPoint && trimPoint > 0) {
                  dataset.label = dataset.label?.substring(0, trimPoint);
                }
                return dataset;
              });

              const labels =
                ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
              chart.data.datasets = originalDatasets;
              return labels;
            } else {
              return ChartJS.defaults.plugins.legend.labels.generateLabels(
                chart
              );
            }
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        top: 50,
        bottom: 0,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit,
          stepSize: 1,
          round: unit,
          tooltipFormat: "D MMMM YYYY",
          displayFormats: {},
        },
        ticks: {
          source: "labels",
          autoSkip: true,
          maxTicksLimit: 20,
        },
        stacked: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      time: {
        position: "left",
        title: {
          display: true,
          text: "Flight time",
        },
        ticks: {
          callback: (value) =>
            formatDuration(
              (typeof value === "string" ? parseInt(value) : value) * 60
            ),
          stepSize: yAxisStepSize(max),
        },
        min: 0,
        stacked: true,
      },
      count: {
        position: "right",
        title: {
          display: true,
          text: "Flights",
        },
        min: 0,
        stacked: true,
      },
    },
  };
};

export interface ITotalRows {
  date: Date;
  planeId: string;
  flights: number;
  totalTime: number;
  favorites: number;
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
  }, [] as Date[]);

  const flightTimesPerGroup = labels.map((label) =>
    rows.reduce((total, row) => {
      if (row.date === label) {
        total += row.totalTime;
      }
      return total;
    }, 0)
  );

  const planes = rows.reduce((groups, row) => {
    const values = groups[row.planeId] || [];
    values.push(row);
    groups[row.planeId] = values;
    return groups;
  }, {} as { [key: string]: ITotalRows[] });

  const datasets: ChartDataset<"bar">[] = [];

  Object.keys(planes)
    .sort()
    .forEach((plane, index) => {
      const values = planes[plane];

      datasets.push({
        label: `${plane} FlightTime`,
        type: "bar",
        yAxisID: "time",
        data: labels.map((label) => {
          const current = values.find((v) => v.date === label);
          return current ? current.totalTime / 60 : 0;
        }),
      });
      datasets.push({
        label: `${plane} Flights`,
        type: "line" as any,
        yAxisID: "count",
        data: labels.map((label) => {
          const current = values.find((v) => v.date === label);
          return current ? current.flights : 0;
        }),
      });
    });

  const maxFlightTime = Math.max(...flightTimesPerGroup) / 60;

  const graph: ChartData<"bar"> = {
    labels,
    datasets: colorize(datasets),
  };

  const options = chartOptions(maxFlightTime, unit);

  return <Bar data={graph} options={options} />;
};
