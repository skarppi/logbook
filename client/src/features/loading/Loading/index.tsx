import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import WarningIcon from "@mui/icons-material/Warning";
import { CombinedError } from "urql";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import css from "./Loading.module.css";

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
      <WarningIcon color="error" fontSize="large" />
      <span>{error?.toString()}</span>
    </div>
  );

  return <div className={css.overlayContainer}>{content}</div>;
};

export const LoadingTable = ({
  spinning,
  error,
  colSpan,
}: {
  spinning?: boolean;
  error?: CombinedError;
  colSpan: number;
}) => {
  if (!spinning && !error) {
    return <></>;
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} style={{ height: 50, position: "relative" }}>
        <LoadingOverlay spinning={spinning} error={error} />
      </TableCell>
    </TableRow>
  );
};

export const LoadingIcon = ({ spinning, error }: ILoadingProps) => {
  if (spinning) {
    return (
      <IconButton size="large">
        <CircularProgress size={20} />
      </IconButton>
    );
  } else if (error) {
    return (
      <Tooltip title={error.message}>
        <IconButton size="large">
          <WarningIcon color="error" />
        </IconButton>
      </Tooltip>
    );
  } else {
    return <></>;
  }
};
