import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useStateAndListenChanges = (
  initialValue?: number
): [number | undefined, Dispatch<SetStateAction<number | undefined>>] => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  return [value, setValue];
};
