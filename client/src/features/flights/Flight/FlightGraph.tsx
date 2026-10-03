import { Line } from "react-chartjs-2";
import * as React from "react";
import {
  SegmentItem,
  Segment,
  FlightStats,
} from "../../../shared/flights/types";
import { Plane, Telemetry } from "../../../shared/planes/types";
import { SegmentType } from "../../../shared/flights";
import { chartColors } from "../../../utils/charts";
import {
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

// chart.js v4 requires explicit registration. This line chart uses a time
// x-axis and linear y-axes, so register them here instead of relying on
// another chart module having been loaded first. register() is idempotent.
ChartJS.register(
  Tooltip,
  Legend,
  Filler,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale
);

const segmentTypeToYAxis = {
  [SegmentType.flying]: 1024,
  [SegmentType.armed]: 512,
  [SegmentType.stopped]: 0,
};

export interface ITotalRows {
  date: Date;
  plane: string;
  flights: number;
  totalTime: number;
}

interface IProps {
  plane: Plane;
  segments: Segment[];
  stats?: FlightStats;
}

const chartOptions = (
  plane: Plane
): ChartOptions<"line"> => {
  return {
    //offset: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const data = context.dataset;
            const label = data.label || "";
            const yValue = context.parsed.y ?? 0;
            if (label === "Timer") {
              const currentType = Object.keys(segmentTypeToYAxis).find(
                (type) => {
                  return (
                    segmentTypeToYAxis[type as SegmentType] === yValue
                  );
                }
              );
              return `${label}: ${currentType}`;
            } else if (
              label === "FM" &&
              plane.flightModes &&
              plane.flightModes.length > yValue
            ) {
              return `${label}: ${plane.flightModes[yValue]}`;
            } else {
              return `${label}: ${yValue}`;
            }
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
          unit: "second",
          //unitStepSize: 1,
          round: "second",
          tooltipFormat: "H:mm:ss",
          displayFormats: {
            second: "H:mm:ss",
          },
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
      stick: {
        position: "left",
        title: {
          display: true,
        },
        ticks: {
          stepSize: 128,
        },
        suggestedMax: 1024,
        suggestedMin: -1024,
      },
      default: {
        position: "right",
        title: {
          display: true,
        },
        suggestedMin: 0,
      },
      binary: {
        position: "right",
        title: {
          display: true,
        },
        suggestedMin: -1,
        suggestedMax: 1,
      },
    },
  };
};

const axisMappings: Record<string, string> = {
  Ail: "stick",
  Ele: "stick",
  LS: "stick",
  RS: "stick",
  Rud: "stick",
  S1: "stick",
  S2: "stick",
  SA: "binary",
  SB: "binary",
  SC: "binary",
  SD: "binary",
  SE: "binary",
  SF: "binary",
  SG: "binary",
  SH: "binary",
  Thr: "stick",
  "AccX(g)": "binary",
  "AccY(g)": "binary",
  "AccZ(g)": "binary",
  "Hdg(@)": "stick",
};

export const FlightGraph = ({ plane, segments, stats }: IProps) => {
  const telemetries: Telemetry[] = plane.telemetries || [];

  const defaultTelemetries = telemetries
    .filter((telemetry) => telemetry.default)
    .map((telemetry) => telemetry.id);

  const ignoreTelemetries = telemetries
    .filter((telemetry) => telemetry.ignore)
    .map((telemetry) => telemetry.id);

  const items = segments.reduce<SegmentItem[]>(
    (prev, cur) => [...prev, ...cur.rows],
    []
  );

  const fields = Object.keys(items[0] || {}).filter(
    (field) => ignoreTelemetries.indexOf(field) === -1
  );

  const labels = items.map((row) => row.Date + " " + row.Time);

  const flightTimeSet: ChartDataset<"line"> = {
    label: "Timer",
    type: "line",
    yAxisID: "stick",
    fill: "start",
    data: items.map((i) => {
      const now = new Date(`${i.Date} ${i.Time}`);
      const current = segments.find(
        (seg) => new Date(seg.startDate) <= now && new Date(seg.endDate) >= now
      );
      return (
        (current && segmentTypeToYAxis[current.type]) ||
        segmentTypeToYAxis[SegmentType.stopped]
      );
    }),
    backgroundColor: "rgba(129,199,132,0.1)",
    borderWidth: 0,
    pointStyle: "dash",
  };

  const datasets: ChartDataset<"line">[] = fields.map((field, index) => {
    const hidden = defaultTelemetries.indexOf(field) === -1;

    const calibrateAltitude = field.indexOf("(m)") !== -1;

    return {
      label: field,
      type: "line",
      fill: false,
      hidden,
      yAxisID: axisMappings[field] || "default",
      data: items.map((i) => {
        const zeroHeight = stats?.zeroHeight ?? 0;
        const value = Number(i[field]);
        if (calibrateAltitude && zeroHeight > 0) {
          return Math.round((value - zeroHeight) * 10) / 10;
        }
        return value;
      }),
      pointRadius: 0,
      borderColor: chartColors(index, 1),
      backgroundColor: chartColors(index, 0.5),
      borderWidth: 1,
    };
  });

  const graph: ChartData<"line"> = {
    labels,
    datasets: [flightTimeSet, ...datasets],
  };

  // Memoize options so its identity is stable across renders. react-chartjs-2
  // reacts to a new options reference by destroying and re-creating the chart
  // via a deferred setTimeout(renderChart); under React StrictMode's
  // double-invoke this races and throws "Canvas is already in use".
  const options = React.useMemo(() => chartOptions(plane), [plane]);

  // Nothing valid to plot - render nothing rather than mounting a chart with
  // an empty/invalid time axis.
  if (items.length === 0) {
    return null;
  }

  // A stable key tied to the dataset forces react-chartjs-2 to mount a fresh
  // canvas when the flight/segments change, avoiding Chart.js "Canvas is
  // already in use" errors caused by React reusing the canvas DOM node before
  // the previous Chart instance is destroyed.
  const chartKey = `${labels[0] ?? ""}-${labels.length}-${fields.length}`;

  return <Line key={chartKey} data={graph} options={options} />;
};
