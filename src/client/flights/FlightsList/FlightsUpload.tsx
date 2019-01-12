import { Card, CardContent, CardHeader } from "@material-ui/core";
import * as React from "react";
import { addFlights } from "../actions";
import classNames from "classnames";
import Dropzone from "react-dropzone";
import { connect } from "react-redux";
import { Flight } from "../../../shared/flights/types";
import { uploadFlightsAPI } from "../../utils/api-facade";

const css = require("./FlightsUpload.css");

interface LocalState {
  loaded: number;
  error?: string;
}

class FlightsUpload extends React.Component<
  typeof mapDispatchToProps,
  LocalState
> {
  constructor(props) {
    super(props);
    this.state = {
      loaded: 0,
      error: undefined
    };
    this.handleDrop = this.handleDrop.bind(this);
  }

  public render() {
    return (
      <Card>
        <CardHeader title="Upload New Flight" />
        <CardContent>
          <Dropzone onDrop={this.handleDrop}>
            {({ getRootProps, getInputProps, isDragActive }) => {
              return (
                <div
                  {...getRootProps()}
                  className={classNames(css.dropzone, {
                    "dropzone--isActive": isDragActive
                  })}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop files here...</p>
                  ) : (
                    <div>
                      <p
                        hidden={
                          this.state.loaded > 0 ||
                          this.state.error !== undefined
                        }
                      >
                        Drag and drop log files or <u>click</u>
                      </p>
                      <p
                        hidden={
                          this.state.loaded === 0 ||
                          this.state.error !== undefined
                        }
                      >
                        Uploaded {this.state.loaded} %. Drag and drop more.
                      </p>
                      <p hidden={this.state.error === undefined}>
                        Failed with message "{this.state.error}". Try again.
                      </p>
                    </div>
                  )}
                </div>
              );
            }}
          </Dropzone>
        </CardContent>
      </Card>
    );
  }

  private handleDrop(files: File[]) {
    this.setState({ loaded: 0, error: undefined });

    const data = new FormData();
    files.forEach(file => data.append("flight", file, file.name));

    uploadFlightsAPI(data, (progressEvent: any) => {
      this.setState({
        loaded: (progressEvent.loaded / progressEvent.total) * 100
      });
    })
      .then(res => {
        const flights = res.data as Flight[];
        this.props.addFlights(
          flights.map(f => {
            f.status = res.statusText;
            return f;
          })
        );
      })
      .catch(err => {
        console.log(err);
        this.setState({ error: err.response.data });
      });
  }
}

const mapDispatchToProps = {
  addFlights: addFlights
};

export default connect<any, any, any>(
  null,
  mapDispatchToProps
)(FlightsUpload);
