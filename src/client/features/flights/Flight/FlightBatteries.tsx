import * as React from "react";
import { Button, FormControl } from "@material-ui/core";
import { Flight } from "../../../../shared/flights/types";
import FlightBattery from "./FlightBattery";
import AddIcon from "@material-ui/icons/Add";
import { RootState } from "../../../app";
import { connect } from "react-redux";
import {
  fetchBatteries,
  insertBatteryCycle,
  deleteBatteryCycle,
  updateBatteryCycle
} from "../../batteries/actions";
import { planes } from "./Flight";
import { BatteryState } from "../../../../shared/batteries";
import { Battery, BatteryCycle } from "../../../../shared/batteries/types";
import { getFlight } from "../selectors";
const css = require("../../../common/Form.css");

export interface OwnProps {
  id: string;
}

interface BatteryProps {
  flight: Flight;
  cycles: { [key: string]: BatteryCycle };
  batteries: { [key: string]: Battery };
}

type AllProps = BatteryProps & typeof mapDispatchToProps;

class FlightBatteries extends React.Component<AllProps> {
  public async componentWillMount() {
    this.props.fetchBatteries();
  }

  addBattery = _ => {
    const { cycles, flight } = this.props;

    const lastSegment = flight.segments.slice(-1)[0];
    const lastTelemetry = lastSegment.rows.slice(-1)[0];

    const usedBatteries = Object.keys(cycles).map(
      key => cycles[key].batteryName
    );

    this.props.insertBatteryCycle({
      id: -1,
      date: flight.startDate,
      batteryName: planes[flight.plane].batteries.find(
        name => usedBatteries.indexOf(name) === -1
      ),
      flightId: flight.id,
      state: BatteryState.discharged,
      voltage: lastTelemetry && lastTelemetry["VFAS(V)"],
      discharged: lastTelemetry && lastTelemetry["Fuel(mAh)"],
      charged: null,
      resistance: null
    });
  };

  batteryByName(name: string) {
    const { batteries } = this.props;
    const id = Object.keys(batteries).find(
      batteryId => batteries[batteryId].name === name
    );
    return batteries[id];
  }

  render() {
    const { cycles, flight } = this.props;

    const rows = Object.keys(cycles).map(id => {
      return (
        <FlightBattery
          key={id}
          flight={flight}
          cycle={cycles[id]}
          battery={this.batteryByName(cycles[id].batteryName)}
          update={this.props.updateBatteryCycle}
          delete={this.props.deleteBatteryCycle}
        />
      );
    });

    return (
      <>
        {rows}
        <FormControl className={css.formControl} margin="normal">
          {rows.length < planes[flight.plane].batterySlots && (
            <Button onClick={this.addBattery}>
              Add battery
              <AddIcon />
            </Button>
          )}
        </FormControl>
      </>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  flight: getFlight(state, ownProps.id),
  cycles: state.batteries.cycles,
  batteries: state.batteries.batteries
});

const mapDispatchToProps = {
  insertBatteryCycle: insertBatteryCycle.request,
  updateBatteryCycle: updateBatteryCycle.request,
  deleteBatteryCycle: deleteBatteryCycle.request,
  fetchBatteries: fetchBatteries.request
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlightBatteries);
