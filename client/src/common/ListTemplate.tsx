import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import * as React from "react";
import { Link, LinkProps } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";

interface IProps {
  type?: string;
  title: string;
  path?: string;
  createNewAction?: (
    _: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  search?: React.ReactNode;
  children: React.ReactElement | React.ReactElement[];
}

const NEWID = "add";

export const ListTemplate = ({
  type,
  title,
  path,
  createNewAction,
  children,
}: IProps) => {
  const AddLink = React.forwardRef<any, Omit<LinkProps, "to">>((props, ref) => (
    <Link ref={ref} to={`${path}/${NEWID}`} {...props} />
  ));

  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader
          title={title}
          action={
            (createNewAction || path) && (
              <Tooltip title={`Add new ${type}`}>
                {createNewAction ? (
                  <IconButton onClick={createNewAction} size="large">
                    <AddIcon />
                  </IconButton>
                ) : (
                  <IconButton component={AddLink} size="large">
                    <AddIcon />
                  </IconButton>
                )}
              </Tooltip>
            )
          }
        />
        <CardContent>{children}</CardContent>
      </Card>
    </Grid>
  );
};
