import * as React from 'react';
import { connect } from 'react-redux';
import { useEffect } from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Select from '@material-ui/core/Select';

import { DashboardState } from '../reducer';
import {
  fetchDashboard,
  changeDashboardSize,
  changeDashboardUnit
} from '../actions';
import { RootState } from '../../../app';

import { DashboardUnit } from '../../../../shared/dashboard';

import { Totals } from './Totals'
import { GraphOverTime } from './GraphOverTime'

const css = require('./Home.css');

function sizesForUnit(unit: DashboardUnit) {
  if (unit === DashboardUnit.day) {
    return [7, 14, 30, 60, 90, 180, 365];
  } else if (unit === DashboardUnit.month) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 48];
  } else {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
}

const Dashboard = (props: DashboardState & typeof mapDispatchToProps) => {

  const { query } = props;

  const sizes = sizesForUnit(query.unit).map(value => (
    <MenuItem value={value}>{value}</MenuItem>
  ));

  // useEffect(() => {
  //   props.fetchDashboard(query);
  // }, [query]);

  return (
    <Grid item xs={12} >
      <Card>
        <CardHeader title='Total Flights' />
        <CardContent><Totals></Totals></CardContent>
      </Card>
      <Card>
        <CardHeader title='Flights Over Time' />
        <CardContent>
          <span>Compare: </span>
          <Select value={query.size || sizes[2]} onChange={props.handleSizeChange}>
            {sizes}
          </Select>
          <Select value={query.unit} onChange={props.handleUnitChange}>
            <MenuItem value={DashboardUnit.day}>Days</MenuItem>
            <MenuItem value={DashboardUnit.month}>Months</MenuItem>
            <MenuItem value={DashboardUnit.year}>Years</MenuItem>
          </Select>
          <GraphOverTime query={query} />
        </CardContent>
      </Card>
    </Grid >
  );
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
