import * as React from "react";
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { Flight } from "../../../../shared/flights/types";
const css = require("../../../common/Form.css");

interface FlightLocationProps {
  flight: Flight;
  locations: string[];
  saveNotes: (id, object) => {};
}

interface LocalState {
  location: string;
  createNew: boolean;
}

export class FlightLocation extends React.Component<
  FlightLocationProps,
  LocalState
> {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      createNew: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      location: nextProps.flight.notes && nextProps.flight.notes.location
    });
  }

  changeFlightLocation = event => {
    if (event.target.value === "new") {
      this.setState({ createNew: true });
    } else {
      this.setState({
        [event.target.name]: event.target.value
      } as any);
    }
  };

  storeFlightLocation = event => {
    this.setState({ createNew: false });
    this.props.saveNotes(this.props.flight.id, event);
  };

  renderExistingLocations() {
    const { locations } = this.props;
    const { location } = this.state;
    return (
      <FormControl className={css.formControl} margin="normal">
        <InputLabel htmlFor="select-multiple-checkbox" shrink>
          Location
        </InputLabel>
        <Select
          value={location}
          name={"location"}
          onChange={this.changeFlightLocation}
          onBlur={this.storeFlightLocation}
          input={<Input id="select-multiple-checkbox" />}
        >
          <MenuItem key="new" value="new">
            Other...
          </MenuItem>

          {locations.map(location => (
            <MenuItem key={location} value={location}>
              {location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  renderNewLocation() {
    const { location } = this.state;
    return (
      <TextField
        id="location"
        label="Location"
        placeholder="Location"
        className={css.textField}
        value={location}
        name="location"
        onChange={this.changeFlightLocation}
        onBlur={this.storeFlightLocation}
        margin="normal"
      />
    );
  }

  render() {
    const { createNew } = this.state;
    if (createNew) {
      return this.renderNewLocation();
    } else {
      return this.renderExistingLocations();
    }
  }
}
