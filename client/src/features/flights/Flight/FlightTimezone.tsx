import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React = require('react');

export function FlightTimezone({ offset, onChange }: { offset: number, onChange: (offset: number) => void }) {
  return <Select displayEmpty required value={offset} onChange={({ target: { value } }) => {
    onChange(Number(value));
  }}>
    {[...Array(25)].map((_, i) =>
      <MenuItem key={i - 12} value={i - 12}>{String(i - 12)}</MenuItem>
    )}
  </Select>;
}

