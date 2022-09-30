import * as React from "react";

import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { chartColors } from "../../../utils/charts";
import { BatteryCycle } from "../../../../../shared/batteries/types";
import { formatDuration } from "../../../../../shared/utils/date";

interface IProps {
  cycles: BatteryCycle[];
}

const chartOptions = (): ChartOptions<"bar"> => {
  return {
    offset: true,
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          let label = data.datasets[tooltipItem.datasetIndex].label || "";

          return `${label}: ${formatDuration(tooltipItem.yLabel)}`;
        },
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        top: 50,
        bottom: 50,
        right: 0,
      },
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "D MMMM YYYY",
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20,
          },
          stacked: true,
        },
      ],
      yAxes: [
        {
          id: "time",
          ticks: {
            callback: (value: number) => formatDuration(value),
            stepSize: 60,
            min: 0,
          },
          stacked: true,
        },
      ],
    },
  };
};

export const BatteryGraph = ({ cycles }: IProps) => {
  const flights = cycles.filter((c) => c.flight);

  if (flights.length === 0) {
    return <></>;
  }

  const labels = flights.map((row) => row.date.substring(0, 10));

  const datasets: ChartDataset<"bar">[] = [
    {
      label: "Flight time",
      type: "bar",
      yAxisID: "time",
      data: flights.map((c) => c.flight?.flightTime),
      borderColor: chartColors(0, 1),
      backgroundColor: chartColors(0, 0.5),
      barThickness: 6,
      maxBarThickness: 8,
    },
    {
      label: "Armed time",
      type: "bar",
      yAxisID: "time",
      data: flights.map(
        (c) => (c.flight?.armedTime ?? 0) - (c.flight?.flightTime ?? 0)
      ),
      borderColor: chartColors(1, 1),
      backgroundColor: chartColors(1, 0.5),
      barThickness: 6,
      maxBarThickness: 8,
    },
  ];

  const graph: ChartData<"bar"> = {
    labels,
    datasets,
  };

  const options = chartOptions();

  return <Bar data={graph} options={options} />;
};
