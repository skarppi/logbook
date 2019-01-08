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
import { fetchDashboard } from "../actions";
import { RootState } from "../../store";
import { connect } from "react-redux";

import { defaults, Bar } from "react-chartjs-2";
import * as Color from "color";
import { formatDuration } from "../../../shared/utils/date";
import { DashboardUnit } from "../../../shared/Dashboard";

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

class Dashboard extends React.Component<
  DashboardState & typeof mapDispatchToProps
> {
  public render() {
    const { graph, unit } = this.props;

    graph.datasets.map((dataset, index) => {
      dataset["borderColor"] = chartColors[index][0];
      dataset["backgroundColor"] = chartColors[index][1];
      dataset["borderWidth"] = 1;

      return dataset;
    });

    const stepSize =
      graph.max < 1440
        ? graph.max <= 60
          ? graph.max <= 10
            ? 1
            : 10
          : 60
        : 60 * 24;

    const options = {
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
              unit: unit,
              unitStepSize: 1,
              round: unit,
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
              stepSize: stepSize
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
            stacked: true
          }
        ]
      }
    };

    return (
      <Grid item xs={12}>
        <Card>
          <CardHeader title="OpenTX Logbook" />
          <CardContent>
            <Typography variant="subheading">Overview of flights </Typography>
            <Typography variant="subheading">
              <Select value={unit} onChange={this.props.handleUnitChange}>
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
    this.props.fetchDashboard(this.props.unit);
  }
}

const mapStateToProps = (state: RootState) => ({
  graph: state.dashboard.graph,
  unit: state.dashboard.unit,
  isLoading: state.dashboard.isLoading
});

const mapDispatchToProps = {
  fetchDashboard: fetchDashboard.request,
  handleUnitChange: event => fetchDashboard.request(event.target.value)
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
