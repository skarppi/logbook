import React = require("react");
import { connect } from "react-redux";
import { CircularProgress, IconButton } from "@material-ui/core";
import { RootState } from "../../../app";

import { isLoading } from "../selector";
import { AsyncActionBuilder } from "typesafe-actions/dist/create-async-action";

const css = require("./Loading.css");

interface OwnProps {
  actions: AsyncActionBuilder<any, any, any, any, any, any>[];
  overlay: boolean;
}

interface LoadingProps {
  spinning: boolean;
  overlay: boolean;
}

class Loading extends React.Component<LoadingProps> {
  render() {
    const { spinning, overlay } = this.props;
    if (spinning && overlay) {
      return (
        <div className={css.overlayContainer}>
          <CircularProgress className={css.progress} />
        </div>
      );
    } else if (spinning) {
      return (
        <IconButton>
          <CircularProgress className={css.progress} size={20} />
        </IconButton>
      );
    } else {
      return <></>;
    }
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  spinning: isLoading(state, ownProps.actions),
  overlay: ownProps.overlay
});

export default connect(mapStateToProps)(Loading);
