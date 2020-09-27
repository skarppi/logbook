import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import { LinkProps } from '@material-ui/core/Link';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import AddIcon from '@material-ui/icons/Add';

interface IProps {
  type?: string;
  title: string;
  path?: string;
  createNewAction?: (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  search?: React.ReactNode;
  children: React.ReactElement | React.ReactElement[];
}

const NEWID = 'add';

const useStyles = makeStyles({
  action: {
    marginRight: 0
  },
  selectedRow: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

export const ListTemplate = ({ type, title, path, createNewAction, children }: IProps) => {

  const history = useHistory();
  const css = useStyles();

  const AddLink =
    React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>((props, ref) =>
      <Link to={`${path}/${NEWID}`} {...props} ref={ref} />)

  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader
          title={title}
          classes={{ action: css.action }}
          action={
            (createNewAction || path) &&
            <Tooltip title={`Add new ${type}`}>
              {createNewAction ?
                <IconButton onClick={createNewAction}>
                  <AddIcon />
                </IconButton> :
                <IconButton component={AddLink}>
                  <AddIcon />
                </IconButton>}
            </Tooltip>
          }
        />
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </Grid >
  );
};