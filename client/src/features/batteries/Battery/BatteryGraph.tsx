import * as React from "react";

import type {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartTypeRegistry,
  ScaleOptionsByType,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { chartColors } from "../../../utils/charts";
import { BatteryCycle } from "../../../shared/batteries/types";
import { formatDuration } from "../../../shared/utils/date";
import { fi } from "date-fns/locale";
import { _DeepPartialObject } from "chart.js/types/utils";

interface IProps {
  cycles: BatteryCycle[];
}

const xAxes: _DeepPartialObject<
  ScaleOptionsByType<ChartTypeRegistry["bar"]["scales"]>
> = {
  type: "time",
  adapters: {
    date: {
      locale: fi,
    },
  },
  time: {
    unit: "day",
    tooltipFormat: "D MMMM YYYY",
  },
  ticks: {
    autoSkip: true,
    maxTicksLimit: 20,
  },
  stacked: true,
};

const yAxes: _DeepPartialObject<
  ScaleOptionsByType<ChartTypeRegistry["bar"]["scales"]>
> = {
  ticks: {
    callback: (value: string | number) =>
      formatDuration(typeof value === "string" ? parseInt(value) : value),
    stepSize: 60,
  },
  min: 0,
  stacked: true,
};

const chartOptions = (): _DeepPartialObject<ChartOptions<"bar">> => {
  return {
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const data = context.dataset;
            let label = data.label || "";

            return `${label}: ${formatDuration(context.parsed.y)}`;
          },
        },
      },
    },
    //offset: true,
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
      x: xAxes,
      time: yAxes,
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
      data: flights
        .map((c) => c.flight?.flightTime)
        .filter((item): item is number => !!item),
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
