import React = require('react');
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import WarningIcon from '@material-ui/icons/Warning';
import { CombinedError } from 'urql';
const css = require('./Loading.css');

interface LoadingProps {
  spinning?: boolean;
  error?: CombinedError;
  overlay: boolean;
}

export const Loading = ({ spinning, error, overlay }: LoadingProps) => {
  if (!spinning && !error) {
    return <></>;
  }

  if (overlay) {
    const content = spinning ? (
      <CircularProgress />
    ) : (
        <div className={css.overlayError}>
          <WarningIcon color='error' fontSize='large' />
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
          <WarningIcon color='error' />
        </IconButton>
      </Tooltip>
    );
  }
}