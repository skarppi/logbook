import React = require('react');
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import WarningIcon from '@material-ui/icons/Warning';
import { CombinedError } from 'urql';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
const css = require('./Loading.css');

interface ILoadingProps {
  spinning?: boolean;
  error?: CombinedError;
}

export const LoadingOverlay = ({ spinning, error }: ILoadingProps) => {
  if (!spinning && !error) {
    return <></>;
  }

  const content = spinning ? (
    <CircularProgress />
  ) : (
      <div className={css.overlayError}>
        <WarningIcon color='error' fontSize='large' />
        <span>{error.toString()}</span>
      </div>
    );

  return <div className={css.overlayContainer}>{content}</div>;
};

export const LoadingTable = ({ spinning, error, colSpan }: {
  spinning?: boolean;
  error?: CombinedError;
  colSpan: number
}) => {
  if (!spinning && !error) {
    return <></>;
  }

  return (<TableRow>
    <TableCell colSpan={colSpan} style={{ height: 50, position: 'relative' }}>
      <LoadingOverlay spinning={spinning} error={error} />
    </TableCell>
  </TableRow>);
};

export const LoadingIcon = ({ spinning, error }: ILoadingProps) => {
  if (!spinning && !error) {
    return <></>;
  }

  if (spinning) {
    return (
      <IconButton>
        <CircularProgress size={20} />
      </IconButton>
    );
  } else if (error) {
    return (
      <Tooltip title={error.message}>
        <IconButton>
          <WarningIcon color='error' />
        </IconButton>
      </Tooltip>
    );
  }
};