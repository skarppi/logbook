import * as React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import { Flight } from "../../../shared/flights/types";
import { Location } from "../../../shared/locations/types";
import { useState } from "react";
import { useQuery } from "urql";
import { useStateAndListenChanges } from "../../../utils/hooks";
import { SelectChangeEvent } from "@mui/material";
import gql from "graphql-tag";

interface IFlightLocationProps {
  flight: Flight;
  save: (object: any) => {};
}

const Query = gql`
  query {
    locations(orderBy: NAME_ASC) {
      nodes {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

interface IQueryResponse {
  locations: {
    nodes: Location[];
  };
}

export const FlightLocation = ({ flight, save }: IFlightLocationProps) => {
  const [query] = useQuery<IQueryResponse>({ query: Query });

  const [locationId, setLocationId] = useStateAndListenChanges(
    flight.location?.id
  );

  const [createNew, setCreateNew] = useState(false);

  const changeFlightLocation = ({
    target: { value },
  }:
    | SelectChangeEvent
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (value === "new") {
      setCreateNew(true);
    } else {
      setLocationId(parseInt(value));
    }
  };

  const storeFlightLocation = () => {
    setCreateNew(false);
    save({
      id: flight.id,
      patch: {
        locationId,
      },
    });
  };

  const renderExistingLocations = () => {
    const locations = query.data?.locations?.nodes;
    if (!locations) {
      return <></>;
    }

    return (
      <FormControl margin="normal" fullWidth={true}>
        <InputLabel htmlFor="select-multiple-checkbox" shrink>
          Location
        </InputLabel>
        <Select
          value={locationId?.toString() || ""}
          name="location"
          onChange={changeFlightLocation}
          onBlur={storeFlightLocation}
          input={<Input id="select-multiple-checkbox" />}
        >
          <MenuItem key="new" value="new">
            Other...
          </MenuItem>

          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const renderNewLocation = () => {
    const locations = query.data?.locations?.nodes || [];

    return (
      <TextField
        id="location"
        label="Location"
        placeholder="Location"
        value={locations.find((l) => l.id === locationId)?.name || ""}
        name="location"
        onChange={changeFlightLocation}
        onBlur={storeFlightLocation}
        margin="normal"
        fullWidth={true}
        inputRef={(input) => input?.focus()}
      />
    );
  };

  if (createNew) {
    return renderNewLocation();
  } else {
    return renderExistingLocations();
  }
};
