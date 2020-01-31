import { useState, useEffect } from 'react';

export function useStateAndListenChanges(initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  return [value, setValue];
}