import * as React from "react";
import { useNavigate } from "react-router-dom";
import NavigateBeforeIcon from "@mui/icons-material/ExpandMore";
import NavigateNextIcon from "@mui/icons-material/ExpandLess";
import { IconButton } from "@mui/material";

export const NavigatePreviousNext = ({
  nextLink,
  previousLink,
}: {
  nextLink?: string;
  previousLink?: string;
}) => {
  const navigate = useNavigate();

  return (
    <>
      <IconButton
        onClick={(_) => nextLink && navigate(nextLink)}
        disabled={!nextLink}
        size="large"
      >
        <NavigateNextIcon />
      </IconButton>

      <IconButton
        onClick={(_) => previousLink && navigate(previousLink)}
        disabled={!previousLink}
        size="large"
      >
        <NavigateBeforeIcon />
      </IconButton>
    </>
  );
};
