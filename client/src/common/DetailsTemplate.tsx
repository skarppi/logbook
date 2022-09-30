import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import * as React from "react";

import { CombinedError, UseQueryState } from "urql";

import DeleteIcon from "@mui/icons-material/Delete";

import { LoadingIcon } from "../features/loading/Loading";
import { NavigatePreviousNext } from "./NavigatePreviousNext";

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

export const DetailsTemplate = ({
  type,
  path,
  nextLink,
  previousLink,
  title,
  action,
  menu,
  queries,
  hidden,
  children,
  deleteAction,
}: IProps) => {
  return (
    <Card style={{ boxShadow: "none" }}>
      <CardHeader
        title={title}
        action={
          <>
            <LoadingIcon
              spinning={queries.find((q) => q.fetching)?.fetching}
              error={queries.find((q) => q.error !== undefined)?.error}
            />

            {action}

            <NavigatePreviousNext
              nextLink={nextLink && `${path}/${nextLink.id}`}
              previousLink={previousLink && `${path}/${previousLink.id}`}
            />

            {deleteAction && (
              <Tooltip title={`Delete ${type}`}>
                <IconButton onClick={deleteAction} size="large">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}

            {menu}
          </>
        }
      />
      <CardContent hidden={hidden}>{children}</CardContent>
    </Card>
  );
};
