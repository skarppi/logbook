import { Card, CardContent, CardHeader } from "@material-ui/core";
import * as React from "react";
import { uploadFlightsAPI } from "../../utils/api-facade";
import { addFlight } from "../actions";
import classNames from "classnames";
import Dropzone from "react-dropzone";
import { RootState } from "../../store";
import { connect } from "react-redux";
import { FlightsState } from "../reducer";
import Flight from "../../../shared/IFlight";

const css = require("./FlightsUpload.css");

interface LocalState {
  files: File[];
  loaded: number;
}

class FlightsUpload extends React.Component<
  typeof mapDispatchToProps,
  LocalState
> {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      loaded: 0
    };
    this.handleUpload = this.handleUpload.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  public render() {
    const files = this.state.files.map((file, index) => (
      <li key={file.name}>
        {file.name} - {file.size} bytes
      </li>
    ));

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
                      <p>
                        Drag and drop log files or <u>click</u>
                      </p>
                    </div>
                  )}
                  <h4 hidden={this.state.files.length === 0}>Files</h4>
                  <ul>{files}</ul>
                </div>
              );
            }}
          </Dropzone>

          <div hidden={this.state.files.length === 0}>
            <button onClick={this.handleUpload}>Upload</button>
            {this.state.loaded} %
          </div>
        </CardContent>
      </Card>
    );
  }

  private handleDrop(files) {
    console.log("handleDrop!", files);
    this.setState({ files: files, loaded: 0 });
  }

  private handleUpload() {
    const data = new FormData();
    this.state.files.forEach(file => data.append("flight", file, file.name));

    uploadFlightsAPI(data, (progressEvent: any) => {
      this.setState({
        loaded: (progressEvent.loaded / progressEvent.total) * 100
      });
    }).then(res => {
      this.props.addFlight(res.data as Flight[]);
    });
  }
}

const mapDispatchToProps = {
  addFlight: addFlight
};

export default connect<any, any, any>(
  null,
  mapDispatchToProps
)(FlightsUpload);
