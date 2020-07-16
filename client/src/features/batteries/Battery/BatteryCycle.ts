import gql from 'graphql-tag';

export const CREATE_BATTERY_CYCLE = gql`
  mutation ($cycle: BatteryCycleInput!) {
    createBatteryCycle(input: {batteryCycle: $cycle}) {
      batteryCycle {
        id
        date
        batteryName
        flightId
        state
        voltage
        discharged
        charged
      }
    }
  }`;

export const UPDATE_BATTERY_CYCLE = gql`
mutation($id:Int!, $cycle:BatteryCyclePatch!) {
  updateBatteryCycle(input: {id: $id, patch: $cycle}) {
    batteryCycle {
      id
    }
  }
}`;

export const DELETE_BATTERY_CYCLE = gql`
mutation($id:Int!) {
  deleteBatteryCycle(input: {id: $id}) {
    batteryCycle {
      id
    }
  }
}`;
