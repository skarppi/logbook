import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CombinedError, UseQueryState } from 'urql';

import DeleteIcon from '@material-ui/icons/Delete';

import { LoadingIcon } from '../features/loading/Loading';
import { NavigatePreviousNext } from './NavigatePreviousNext';

interface IProps {
  type: string;
  path: string;
  previousLink?: { id?: number };
  nextLink?: { id?: number };
  title?: React.ReactNode;
  deleteAction?: (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  action?: React.ReactNode;
  menu?: React.ReactNode;
  queries: UseQueryState<any>[];
  error?: CombinedError;
  hidden: boolean;
  children: React.ReactElement | React.ReactElement[];
}

export const DetailsTemplate = ({ type, path, nextLink, previousLink, title, action, menu, queries, hidden, children, deleteAction }: IProps) => {

  const history = useHistory();

  const plural = type.endsWith('y') ? `${type.slice(0, -1)}ies` : `${type}s`

  return (
    <Card style={{ boxShadow: 'none' }}>
      <CardHeader
        title={title}
        action={
          <>
            <LoadingIcon
              spinning={queries.find(q => q.fetching)?.fetching}
              error={queries.find(q => q.error !== undefined)?.error}
            />

            {action}

            <NavigatePreviousNext
              nextLink={nextLink && `${path}/${nextLink.id}`}
              previousLink={previousLink && `${path}/${previousLink.id}`} />

            <Tooltip title={`Delete ${type}`}>
              <IconButton onClick={deleteAction}>
                <DeleteIcon />
              </IconButton>
            </Tooltip >

            {menu}
          </>
        }
      />
      < CardContent hidden={hidden} >
        {children}
      </CardContent >
    </Card >
  );
};