import { Card, CardContent, CardHeader } from "@material-ui/core";
import * as React from "react";
import { uploadFlightsAPI } from "../../utils/api-facade";
import classNames from "classnames";
import Dropzone from "react-dropzone";

const css = require("./FlightsUpload.css");

interface IState {
  files: File[];
  loaded: number;
}

export class FlightsUpload extends React.Component<any, IState> {
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
      console.log(res.statusText);
    });
  }
}
