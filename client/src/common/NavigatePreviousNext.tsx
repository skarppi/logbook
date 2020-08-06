import * as React from 'react';
import { useHistory } from 'react-router-dom';
import NavigateBeforeIcon from '@material-ui/icons/ExpandMore';
import NavigateNextIcon from '@material-ui/icons/ExpandLess';
import { IconButton } from '@material-ui/core';

export const NavigatePreviousNext = ({ nextLink, previousLink }) => {

  const history = useHistory();

  return <>
    <IconButton
      onClick={_ => history.push(nextLink)}
      disabled={!nextLink}>
      <NavigateNextIcon />
    </IconButton>

    <IconButton
      onClick={_ => history.push(previousLink)}
      disabled={!previousLink}>
      <NavigateBeforeIcon />
    </IconButton>
  </>;
};