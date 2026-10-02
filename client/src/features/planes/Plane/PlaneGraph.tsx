import {
  BarElement,
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  LinearScale,
  TimeScale,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { chartColors } from "../../../utils/charts";
import { BatteryCycle } from "../../../shared/batteries/types";
import { formatDuration } from "../../../shared/utils/date";
import "chartjs-adapter-date-fns";

// chart.js v4 requires explicit registration. PlaneGraph renders a bar chart
// with a time x-axis and linear y-axis, so it must register these itself -
// otherwise rendering throws ("time"/"linear" scale or bar element not
// registered) whenever this chart is shown on a page that hasn't already
// loaded another chart (e.g. /planes/add). register() is idempotent.
ChartJS.register(Tooltip, LinearScale, TimeScale, BarElement);
interface IProps {
  cycles: BatteryCycle[];
}

const chartOptions = (): ChartOptions<"bar"> => {
  return {
    //offset: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            const data = context.dataset;
            let label = data.label || "";

            return `${label}: ${formatDuration(context.parsed.y ?? 0)}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
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
          unit: "day",
          // unitStepSize: 1,
          round: "day",
          tooltipFormat: "d MMMM yyyy",
        },
        ticks: {
          source: "labels",
          autoSkip: true,
          maxTicksLimit: 20,
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      time: {
        position: "left",
        title: {
          display: true,
        },
        ticks: {
          callback: (value: string | number) =>
            formatDuration(typeof value === "string" ? parseInt(value) : value),
          stepSize: 60,
        },
        suggestedMax: 100,
        min: 0,
        stacked: true,
      },
    },
  };
};

export const PlaneGraph = ({ cycles }: IProps) => {
  const flights = cycles.filter((c) => c.flight);

  const labels = flights.map((row) => row.date);

  const datasets: ChartDataset<"bar">[] = [
    {
      label: "Flight time",
      type: "bar",
      yAxisID: "time",
      data: flights.map((c) => c.flight?.flightTime ?? 0),
      borderColor: chartColors(0, 1),
      backgroundColor: chartColors(0, 0.5),
    },
    {
      label: "Armed time",
      type: "bar",
      yAxisID: "time",
      data: flights.map(
        (c) => (c.flight && c.flight.armedTime - c.flight.flightTime) ?? 0
      ),
      borderColor: chartColors(1, 1),
      backgroundColor: chartColors(0, 0.5),
    },
  ];

  const graph: ChartData<"bar"> = {
    labels,
    datasets,
  };

  const options = chartOptions();

  return <Bar data={graph} options={options} />;
};
