import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Select,
  MenuItem
} from "@material-ui/core";
import * as React from "react";

import { DashboardState } from "../reducer";
import {
  fetchDashboard,
  changeDashboardSize,
  changeDashboardUnit
} from "../actions";
import { RootState } from "../../store";
import { connect } from "react-redux";

import { defaults, Bar } from "react-chartjs-2";
import * as Color from "color";
import { formatDuration } from "../../../shared/utils/date";
import { DashboardUnit } from "../../../shared/dashboard";
import { cloneDeep } from "lodash";
import { Dataset } from "../../../shared/dashboard/types";

const css = require("./Home.css");
const logoImg = require("../../../../assets/images/logo.png");

const chartColors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f"
].map(color => {
  return [
    color,
    Color(color)
      .alpha(0.5)
      .rgbString()
  ];
});

defaults["global"].elements.line.fill = false;

function yAxisStepSize(max: number) {
  if (max < 1440) {
    if (max <= 60) {
      // sale in minutes
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

    dataset["borderColor"] = chartColors[colorIndex][0];
    dataset["backgroundColor"] = chartColors[colorIndex][1];
    dataset["borderWidth"] = 1;

    return dataset;
  });
}

function sizesForUnit(unit: DashboardUnit) {
  if (unit === DashboardUnit.day) {
    return [7, 14, 30];
  } else if (unit === DashboardUnit.month) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  } else {
    return [1, 2, 3, 4, 5, 6];
  }
}

class Dashboard extends React.Component<
  DashboardState & typeof mapDispatchToProps
> {
  private chartOptions() {
    const { graph, query } = this.props;

    return {
      offset: true,
      tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || "";

            if (label) {
              label += ": ";
            }
            if (label.toLowerCase().indexOf("time") !== -1) {
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
                const trimPoint = dataset.label.indexOf(" ");
                if (trimPoint > 0) {
                  dataset.label = dataset.label.substring(0, trimPoint);
                }

                return dataset;
              });
            }

            return defaults["global"].legend.labels.generateLabels(item);
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
            type: "time",
            time: {
              unit: query.unit,
              unitStepSize: 1,
              round: query.unit,
              tooltipFormat: "D MMMM YYYY",
              displayFormats: {}
            },
            ticks: {
              source: "labels"
            },
            stacked: true
          }
        ],
        yAxes: [
          {
            id: "time",
            position: "left",
            scaleLabel: {
              display: true,
              labelString: "Flight time"
            },
            ticks: {
              callback: value => formatDuration(value * 60),
              stepSize: yAxisStepSize(graph.max),
              min: 0
            },
            stacked: true
          },
          {
            id: "count",
            position: "right",
            scaleLabel: {
              display: true,
              labelString: "Flights"
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

  public render() {
    const { graph, query } = this.props;

    const options = this.chartOptions();

    // TODO: modify somewhere else
    graph.datasets = colorize(graph.datasets);

    const sizes = sizesForUnit(DashboardUnit.month).map(value => (
      <MenuItem value={value}>{value}</MenuItem>
    ));

    return (
      <Grid item xs={12}>
        <Card>
          <CardHeader title="OpenTX Logbook" />
          <CardContent>
            <Typography variant="subheading">Overview of flights </Typography>
            <Typography variant="subheading">
              <Select value={query.size} onChange={this.props.handleSizeChange}>
                {sizes}
              </Select>
              <Select value={query.unit} onChange={this.props.handleUnitChange}>
                <MenuItem value={DashboardUnit.day}>Day</MenuItem>
                <MenuItem value={DashboardUnit.month}>Month</MenuItem>
                <MenuItem value={DashboardUnit.year}>Year</MenuItem>
              </Select>
              <Bar data={graph} options={options} />
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  public async componentDidMount() {
    this.props.fetchDashboard(this.props.query);
  }
}

const mapStateToProps = (state: RootState) => ({
  graph: state.dashboard.graph,
  query: state.dashboard.query,
  isLoading: state.dashboard.isLoading
});

const mapDispatchToProps = {
  fetchDashboard: fetchDashboard.request,
  handleUnitChange: event => changeDashboardUnit(event.target.value),
  handleSizeChange: event => changeDashboardSize(event.target.value)
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
