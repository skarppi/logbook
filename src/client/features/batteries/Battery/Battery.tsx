import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Input,
  MenuItem,
  InputAdornment
} from "@material-ui/core";
import * as React from "react";
import { Battery } from "../../../../shared/batteries/types";
import { RootState } from "../../../app";
import {
  fetchBatteries,
  insertBattery,
  updateBattery,
  deleteBattery,
  insertBatteryCycle,
  updateBatteryCycle,
  deleteBatteryCycle
} from "../actions";
import { connect } from "react-redux";

const css = require("../../../common/Form.css");
import DeleteIcon from "@material-ui/icons/Delete";
import { getBattery } from "../selectors";
import Loading from "../../loading/Loading/Loading";
import { formatDate } from "../../../../shared/utils/date";

const batteryTypes = ["LiPo", "LiHV"];
const cellCounts = [1, 2, 3, 4, 5, 6];

export interface OwnProps {
  id: number;
}

export interface BatteryDetailsProps {
  battery: Battery;
}

interface LocalState {
  battery: Battery;
}

type AllProps = BatteryDetailsProps & typeof mapDispatchToProps & OwnProps;

class BatteryDetails extends React.Component<AllProps, LocalState> {
  private onTop = React.createRef<HTMLSpanElement>();

  constructor(props) {
    super(props);
    this.state = {
      battery: this.props.battery
    };
  }

  componentDidMount() {
    this.onTop.current.scrollIntoView();
  }

  public render() {
    const { battery } = this.state;

    return (
      <Card className={css.card}>
        <CardHeader
          title={
            <>
              <span ref={this.onTop}>Battery: </span>
              <TextField
                id="name"
                placeholder="Name"
                className={css.textField}
                value={battery.name || ""}
                name="name"
                onChange={this.changeBattery}
                onBlur={this.save}
                margin="none"
              />
            </>
          }
          action={
            <>
              <Loading
                actions={[
                  fetchBatteries,
                  insertBattery,
                  updateBattery,
                  deleteBattery,
                  insertBatteryCycle,
                  updateBatteryCycle,
                  deleteBatteryCycle
                ]}
                overlay={false}
              />

              <Tooltip title="Delete battery">
                <IconButton onClick={_ => this.props.deleteBattery(battery)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        <CardContent hidden={battery.name === ""}>
          <div className={css.container}>
            <FormControl className={css.formControl} margin="normal">
              <InputLabel htmlFor="select-multiple-checkbox">Type</InputLabel>
              <Select
                value={battery.type || ""}
                name={"type"}
                onChange={this.changeBattery}
                onBlur={this.save}
                input={<Input id="select-multiple-checkbox" />}
              >
                {batteryTypes.map(name => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl className={css.formControl} margin="normal">
              <InputLabel htmlFor="select-multiple-checkbox">Cells</InputLabel>
              <Select
                value={battery.cells || ""}
                name={"cells"}
                onChange={this.changeBattery}
                onBlur={this.save}
                input={<Input id="select-multiple-checkbox" />}
              >
                {cellCounts.map(count => (
                  <MenuItem key={count} value={count}>
                    {count}s
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              id="capacity"
              label="Capacity"
              placeholder="Capacity"
              className={css.textField}
              value={battery.capacity || ""}
              name="capacity"
              onChange={this.changeBattery}
              onBlur={this.save}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">mAh</InputAdornment>
                )
              }}
            />

            <TextField
              id="purchaseDate"
              type="date"
              label="Purchase Date"
              value={formatDate(battery.purchaseDate)}
              onChange={this.changePurchaseDate}
              onBlur={this.save}
              className={css.textField}
              margin="normal"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        battery: nextProps.battery
      });
    }
  }

  changeBattery = event => {
    this.setState({
      battery: {
        ...this.state.battery,
        [event.target.name]: event.target.value
      }
    });
  };

  changePurchaseDate = event => {
    this.changeBattery({
      target: { name: "purchaseDate", value: new Date(event.target.value) }
    });
  };

  save = _ => {
    if (this.state.battery.id < 0) {
      this.props.insertBattery(this.state.battery);
    } else {
      this.props.updateBattery(this.state.battery);
    }
  };
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  battery: getBattery(state, ownProps.id) || {
    id: -1,
    name: "",
    purchaseDate: new Date(),
    type: "",
    cells: 0,
    capacity: 0
  }
});

const mapDispatchToProps = {
  fetchBattery: fetchBatteries.request,
  insertBattery: insertBattery.request,
  updateBattery: updateBattery.request,
  deleteBattery: deleteBattery.request
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BatteryDetails);
