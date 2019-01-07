import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from "@material-ui/core";
import * as React from "react";

import { DashboardState } from "../reducer";
import { fetchDashboard } from "../actions";
import { RootState } from "../../store";
import { connect } from "react-redux";

import { defaults, Bar } from "react-chartjs-2";
import * as Color from "color";
import { formatDuration } from "../../../shared/utils/date";

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
    const data = this.props.graph;

    data.datasets.map((dataset, index) => {
      dataset["borderColor"] = chartColors[index][0];
      dataset["backgroundColor"] = chartColors[index][1];
      dataset["borderWidth"] = 1;

      return dataset;
    });

    const options = {
      offset: true,
      title: {
        display: true,
        text: "Flight time by month"
      },
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
          left: 50,
          top: 50,
          bottom: 0
        }
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "month",
              unitStepSize: 1,
              round: "month",
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
            scaleLabel: {
              display: true,
              labelString: "Flight time in minutes"
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
            <Typography variant="subheading">
              Flight logbook from OpenTX logs
              <Bar data={data} options={options} />
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  public async componentDidMount() {
    this.props.fetchDashboard();
  }
}

const mapStateToProps = (state: RootState) => ({
  graph: state.dashboard.graph,
  isLoading: state.dashboard.isLoading
});

const mapDispatchToProps = {
  fetchDashboard: fetchDashboard.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
