import React = require("react");
import { CircularProgress } from "@material-ui/core";

const css = require("./Loading.css");

interface LoadingProps {
  spinning: boolean;
}

export const Loading: React.SFC<LoadingProps> = ({ spinning }) => {
  if (spinning) {
    return (
      <div className={css.container}>
        <CircularProgress className={css.progress} />
      </div>
    );
  } else {
    return <></>;
  }
};
