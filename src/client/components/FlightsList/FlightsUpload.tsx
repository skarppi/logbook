import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem
} from "@material-ui/core";
import * as React from "react";
import { NavLink, Route } from "react-router-dom";
import { IFlight } from "../../../shared/IFlight";
import { uploadFlightsAPI } from "../../utils/api-facade";
import { Flight } from "../Flight/Flight";

interface IState {
  file: File | null;
  loaded: number;
}

export class FlightsUpload extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      loaded: 0
    };
    this.handleselectedFile = this.handleselectedFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  public render() {
    return (
      <Card>
        <CardHeader title="Upload New Flight" />
        <CardContent>
          <input
            type="file"
            name="flight"
            onChange={this.handleselectedFile}
            multiple
          />
          <button onClick={this.handleUpload}>Upload</button>
          <div> {this.state.loaded} %</div>
        </CardContent>
      </Card>
    );
  }

  private handleselectedFile(event) {
    if (event.target.files) {
      this.setState({ file: event.target.files[0], loaded: 0 });
    }
  }

  private handleUpload() {
    const data = new FormData();
    data.append("flight", this.state.file, this.state.file.name);

    uploadFlightsAPI(data, (progressEvent: any) => {
      this.setState({
        loaded: (progressEvent.loaded / progressEvent.total) * 100
      });
    }).then(res => {
      console.log(res.statusText);
    });
  }
}
