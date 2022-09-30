import TextField from "@mui/material/TextField";
import * as React from "react";

import { useNavigate } from "react-router-dom";

import gql from "graphql-tag";
import { useMutation } from "urql";

import { Location } from "../../../../../shared/locations/types";
import { DetailsTemplate } from "../../../common/DetailsTemplate";
import Box from "@mui/material/Box";

interface IQueryResponse {
  location: Location;
}

const Create = gql`
  mutation ($location: LocationInput!) {
    createLocation(input: { location: $location }) {
      location {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

const Update = gql`
  mutation ($id: Int!, $location: LocationPatch!) {
    updateLocation(input: { id: $id, patch: $location }) {
      location {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

const Delete = gql`
  mutation ($id: Int!) {
    deleteLocation(input: { id: $id }) {
      location {
        id
      }
    }
  }
`;

const NEW_LOCATION: Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

export const LocationDetails = ({
  data,
  nextLink,
  previousLink,
}: {
  data: Location;
  nextLink: { id?: number };
  previousLink: { id?: number };
}) => {
  const navigate = useNavigate();

  // graphql CRUD operations
  const [create, createLocation] = useMutation(Create);
  const [update, updateLocation] = useMutation(Update);
  const [del, deleteLocation] = useMutation(Delete);

  // local state
  const [location, setLocation] = React.useState(data || NEW_LOCATION);

  // modify local state
  const changeNumber = ({
    target: { name, value },
  }: React.ChangeEvent<{ name: string; value: string }>) =>
    setLocation({ ...location, [name]: Number(value) });

  const changelocation = ({
    target: { name, value },
  }: React.ChangeEvent<{ name: string; value: string }>) =>
    setLocation({ ...location, [name]: value });

  // update to server
  const save = () => {
    if (!location.id) {
      createLocation({ location }).then((res) => {
        if (!res.error) {
          navigate(`/locations/${res.data.createLocation.location.id}`);
        }
      });
    } else {
      const { __typename: _, flights, ...patch } = location;
      updateLocation({ id: location.id, location: patch });
    }
  };
  const executeDelete = () => {
    deleteLocation({ id: location.id }).then((res) => {
      if (!res.error) {
        navigate("/locations");
      }
    });
  };

  return (
    <DetailsTemplate
      type="location"
      path="/locations"
      title={
        <>
          <span>Location: </span>
          <TextField
            required
            error={
              location.id === NEW_LOCATION.id && location?.name?.length === 0
            }
            id="name"
            placeholder="Name"
            value={location.name}
            name="name"
            onChange={changelocation}
            onBlur={({ target: { value } }) => value.length > 0 && save()}
            margin="none"
          />
        </>
      }
      previousLink={previousLink}
      nextLink={nextLink}
      queries={[update, create, del]}
      deleteAction={() => location.id !== NEW_LOCATION.id && executeDelete}
      hidden={location.name === ""}
    >
      <Box display="flex" flexWrap="wrap">
        <TextField
          type="number"
          id="latitude"
          label="Latitude"
          placeholder="Latitude"
          value={location.latitude || ""}
          name="latitude"
          onChange={changeNumber}
          onBlur={save}
          margin="normal"
          style={{ flexGrow: 1 }}
        />

        <TextField
          type="number"
          id="longitude"
          label="Longitude"
          placeholder="Longitude"
          value={location.longitude || ""}
          name="longitude"
          onChange={changeNumber}
          onBlur={save}
          margin="normal"
          style={{ flexGrow: 1 }}
        />
      </Box>
    </DetailsTemplate>
  );
};
