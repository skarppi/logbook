import React = require("react");
import { connect } from "react-redux";
import { CircularProgress, IconButton, Tooltip } from "@material-ui/core";
import { RootState } from "../../../app";

import { getError, isLoading } from "../selector";
import { AsyncActionBuilder } from "typesafe-actions/dist/create-async-action";

import WarningIcon from "@material-ui/icons/Warning";
const css = require("./Loading.css");

interface OwnProps {
  actions: AsyncActionBuilder<any, any, any, any, any, any>[];
  overlay: boolean;
}

interface LoadingProps {
  spinning: boolean;
  error: string;
  overlay: boolean;
}

class Loading extends React.Component<LoadingProps> {
  render() {
    const { spinning, error, overlay } = this.props;
    if (!spinning && !error) {
      return <></>;
    }

    if (overlay) {
      const content = spinning ? (
        <CircularProgress />
      ) : (
        <div className={css.overlayError}>
          <WarningIcon color="error" fontSize="large" />
          <span>{error}</span>
        </div>
      );

      return <div className={css.overlayContainer}>{content}</div>;
    } else if (spinning) {
      return (
        <IconButton>
          <CircularProgress size={20} />
        </IconButton>
      );
    } else if (error) {
      return (
        <Tooltip title={error}>
          <IconButton>
            <WarningIcon color="error" />
          </IconButton>
        </Tooltip>
      );
    }
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  spinning: isLoading(state, ownProps.actions.map(a => a.request)),
  error: getError(state, ownProps.actions.map(a => a.failure)),
  overlay: ownProps.overlay
});

export default connect(mapStateToProps)(Loading);
