import { Line } from "react-chartjs-2";
import {
  SegmentItem,
  Segment,
  FlightStats,
} from "../../../shared/flights/types";
import { Plane, Telemetry } from "../../../shared/planes/types";
import { SegmentType } from "../../../shared/flights";
import { chartColors } from "../../../utils/charts";
import { _DeepPartialObject } from "chart.js/types/utils";
import {
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Tooltip,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(Tooltip, Filler);

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
): _DeepPartialObject<ChartOptions<"line">> => {
  return {
    //offset: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const data = context.dataset;
            const label = data.label || "";
            if (label === "Timer") {
              const currentType = Object.keys(segmentTypeToYAxis).find(
                (type) => {
                  return (
                    segmentTypeToYAxis[type as SegmentType] === context.parsed.y
                  );
                }
              );
              return `${label}: ${currentType}`;
            } else if (
              label === "FM" &&
              plane.flightModes &&
              plane.flightModes.length > context.parsed.y
            ) {
              return `${label}: ${plane.flightModes[context.parsed.y]}`;
            } else {
              return `${label}: ${context.parsed.y}`;
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

  const options = chartOptions(plane);

  return <Line data={graph} options={options} />;
};
