import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import * as React from "react";
import { Battery, BatteryCycle } from "../../../shared/batteries/types";

interface IResistanceProps {
  editing: boolean;
  cells: number;
  cycle: BatteryCycle;
  setCycle: React.Dispatch<React.SetStateAction<BatteryCycle | undefined>>;
}

export const BatteryCycleResistance = ({
  editing,
  cells,
  cycle,
  setCycle,
}: IResistanceProps) => {
  const changeCycleResistance = (index: number, value: number) => {
    const resistances =
      (cycle.resistance && [...cycle.resistance]) || Array(cells).fill("");

    if (resistances.length < cells) {
      resistances.push(Array(cells - resistances.length).fill(""));
    }

    resistances.splice(index, 1, value);

    setCycle({ ...cycle, resistance: resistances as [number] });
  };

  const renderResistance = (index: number) => {
    const value =
      cycle.resistance &&
      cycle.resistance.length >= index &&
      cycle.resistance[index];

    if (!editing) {
      return <span>{value} </span>;
    }

    return (
      <TextField
        key={`resistance-${index}`}
        label={`Cell ${index + 1}`}
        placeholder={`Cell ${index + 1}`}
        value={value || ""}
        name={"resistance"}
        onChange={(e) =>
          changeCycleResistance(index, parseFloat(e.target.value))
        }
        style={{ width: 75 }}
        type="number"
        InputProps={{
          endAdornment: <InputAdornment position="end">Ω</InputAdornment>,
        }}
        inputProps={{
          step: 0.1,
          min: "0",
        }}
      />
    );
  };

  if (editing) {
    return (
      <>
        {Array(cells)
          .fill("")
          .map((_, index) => {
            return renderResistance(index);
          })}
      </>
    );
  } else {
    const sum = cycle.resistance?.reduce(
      (prev, current) => prev + Number(current),
      0
    );
    if (cells === 1) {
      return <>{cycle.resistance?.join(" ")}</>;
    } else if (sum && sum > 0) {
      return (
        <>
          Average: {Math.round(sum / (cycle.resistance?.length ?? 1))} Cells:{" "}
          {cycle.resistance?.join(" ")}
        </>
      );
    }
    return <></>;
  }
};
