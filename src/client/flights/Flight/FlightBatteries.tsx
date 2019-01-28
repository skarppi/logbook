import * as React from "react";
import { IconButton } from "@material-ui/core";
import { Flight } from "../../../shared/flights/types";
import { FlightBattery } from "./FlightBattery";
import AddIcon from "@material-ui/icons/Add";
import { RootState } from "../../store";
import { changeFlightFields } from "../actions";
import { BatteryCycleState } from "../../batteries/reducer";
import { parseDurationIntoSeconds } from "../../../shared/utils/date";
import { connect } from "react-redux";
import {
  insertBatteryCycle,
  deleteBatteryCycle,
  updateBatteryCycle
} from "../../batteries/actions";
import { BatteryState } from "../../../shared/batteries";
const css = require("./Flight.css");

interface BatteryProps {
  flight: Flight;
}

type AllProps = BatteryCycleState & typeof mapDispatchToProps & BatteryProps;

class FlightBatteries extends React.Component<AllProps> {
  addBattery = _ => {
    const { flight } = this.props;
    this.props.insertBatteryCycle({
      id: -1,
      date: flight.startDate,
      batteryId: "",
      flightId: flight.id,
      state: BatteryState.discharged,
      voltage: null,
      discharged: null,
      charged: null
    });
  };

  render() {
    const { batteries, flight } = this.props;
    const rows = Object.keys(batteries).map(id => {
      return (
        <FlightBattery
          key={id}
          flight={flight}
          battery={batteries[id]}
          update={this.props.updateBatteryCycle}
          delete={this.props.deleteBatteryCycle}
        />
      );
    });

    return (
      <>
        {rows}
        <div className={css.formControl}>
          <span>Add cycle</span>
          <IconButton onClick={this.addBattery}>
            <AddIcon />
          </IconButton>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  flight: state.flights.flight,
  batteries: state.batteries.batteries,
  isLoadingBatteries: state.batteries.isLoadingBatteries
});

const mapDispatchToProps = {
  insertBatteryCycle: insertBatteryCycle.request,
  updateBatteryCycle: updateBatteryCycle.request,
  deleteBatteryCycle: deleteBatteryCycle.request,
  updateFlightTimes: event =>
    changeFlightFields({
      [event.target.name]: parseDurationIntoSeconds(event.target.value)
    })
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlightBatteries);
