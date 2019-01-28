import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody
} from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { fetchBatteries } from "../actions";
import { connect } from "react-redux";
import { RootState } from "../../store";
import { formatDuration, formatDate } from "../../../shared/utils/date";
import { Battery } from "../../../shared/batteries/types";

interface BatteryProps {
  batteries: { [key: string]: Battery };
  isLoadingBatteries: boolean;
}

class BatteriesList extends React.Component<
  BatteryProps & typeof mapDispatchToProps
> {
  public render() {
    const { batteries, isLoadingBatteries } = this.props;

    if (isLoadingBatteries) {
      return <div>Loading...</div>;
    }

    const rows = Object.keys(batteries).map(id => {
      const battery = batteries[id];
      return (
        <TableRow key={String(id)}>
          <TableCell>
            <NavLink to={`/batteries/${id}`}>{id}</NavLink>
          </TableCell>
          <TableCell>{battery.type}</TableCell>
          <TableCell>{battery.cells}</TableCell>
          <TableCell>{battery.capacity}</TableCell>
          <TableCell>{formatDate(battery.purchaseDate)}</TableCell>
        </TableRow>
      );
    });

    return (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Batteries" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Cells</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Purchase date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{rows}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  public async componentWillMount() {
    this.props.fetchBatteries();
  }
}

const mapStateToProps = (state: RootState) => ({
  batteries: state.batteries.batteries,
  isLoadingBatteries: state.batteries.isLoadingBatteries
});

const mapDispatchToProps = {
  fetchBatteries: fetchBatteries.request
};

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(BatteriesList);
