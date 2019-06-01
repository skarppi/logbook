import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import * as React from 'react';
import { Plane, Flight } from '../../../../shared/flights/types';
import { withRouter } from 'react-router-dom';

import { FlightDate } from './FlightDate';
import { FlightDuration } from './FlightDuration';
import { FlightBatteries } from './FlightBatteries';
import { FlightLocation } from './FlightLocation';

import { Videos } from '../Videos/Videos';
import { FlightGraph } from './FlightGraph';

const css = require('../../../common/Form.css');
const flightCss = require('./Flight.css');

import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Loading } from '../../loading/Loading';
import { useQuery, useMutation } from 'urql';
import gql from 'graphql-tag';
import { Battery } from '../../../../shared/batteries/types';
import { formatDate } from '../../../../shared/utils/date';

const Query = gql`
  query($id:String!) {
    flightById(id: $id) {
      id
      plane
      session
      startDate
      endDate
      duration
      armedTime
      flightTime
      notes
      segments
      batteryCyclesByFlightId {
        nodes {
          id
          date
          batteryName
          flightId
          state
          voltage
          discharged
          charged
          resistance
        }
      }
    }
    allBatteries(orderBy:NAME_ASC) {
      nodes {
        name
      }
    }
  }`;

const Update = gql`
  mutation($id:String!, $patch:FlightPatch!) {
    updateFlightById(input: {id: $id, flightPatch: $patch}) {
      flight {
        id
        plane
        session
        startDate
        endDate
        duration
        armedTime
        flightTime
        notes
      }
    }
  }`;

const Delete = gql`
  mutation($id:String!) {
    deleteFlightById(input: {id: $id}) {
      flight {
        id
      }
    }
  }`;


interface IQueryResponse {
  flightById: Flight;
  allBatteries: {
    nodes: Battery[];
  }
}

export const planes: { [key: string]: Plane } = {
  Reverb: {
    batterySlots: 1,
    batteries: [
      'tattu1',
      'tattu2',
      'tattu3',
      'tattu4',
      'tattu5',
      'cnhl1',
      'cnhl2'
    ],
    ignoreTelemetries: ['SA', 'SD', 'SE', 'SF', 'SG', 'SH', 'S1', 'S2', 'S3', 'LS', 'RS']
  },
  TWR: {
    batterySlots: 1,
    batteries: [
      'mylipo1',
      'mylipo2',
      'mylipo3',
      'mylipo4',
      'mylipo5',
      'happy1',
      'happy2',
      'happy3',
      'happy4'
    ],
    ignoreTelemetries: ['SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'S1', 'S2', 'S3', 'LS', 'RS']
  },
  MOB7: {
    batterySlots: 2,
    batteries: [
      'mylipo1',
      'mylipo2',
      'mylipo3',
      'mylipo4',
      'happy1',
      'happy2',
      'happy3',
      'happy4'
    ],
    ignoreTelemetries: ['SD', 'SE', 'SF', 'SG', 'SH', 'S1', 'S2', 'S3', 'LS', 'RS', 'RxBt(V)']
  }
};

export const defaultPlane: Plane = {
  batterySlots: 0,
  batteries: [],
  ignoreTelemetries: []
};

const FlightDetailsComponent = ({ entry, history }) => {

  const [read, refreshFlight] = useQuery<IQueryResponse>({
    query: Query,
    variables: { id: entry.id }
  });
  const [update, updateFlight] = useMutation(Update);
  const [del, deleteFlight] = useMutation(Delete);

  // local state
  const [flight, setFlight] = React.useState<Flight>(entry);
  React.useEffect(() => {
    if (read.data) {
      setFlight(read.data.flightById);
    }
  }, [read.data]);

  const changeNotes = ({ target: { name, value } }) =>
    setFlight({
      ...flight,
      notes: { ...flight.notes, [name]: value }
    });

  const saveNotes = () => updateFlight({
    id: flight.id,
    patch: { notes: flight.notes }
  });

  const executeDelete = _ => {
    deleteFlight({ id: flight.id }).then(res => {
      if (!res.error) {
        history.push(`/flights/${formatDate(flight.startDate)}`);
      }
    });
  };

  return (
    <Card className={css.card}>
      <CardHeader
        title={`Flight: ${flight.id}`}
        action={
          <>
            <Loading
              spinning={read.fetching || update.fetching || del.fetching}
              error={read.error || update.error || del.error}
              overlay={false}
            />

            <Tooltip title='Reset flight'>
              <IconButton onClick={_ => this.props.resetFlight(flight)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title='Delete flight'>
              <IconButton onClick={executeDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />
      <CardContent>
        <div className={css.container}>
          <FlightDate flight={flight} />
          <FlightDuration flight={flight} save={updateFlight} />
        </div>

        <div className={css.container}>
          <TextField
            id='osd'
            label='OSD'
            placeholder='OSD'
            multiline
            className={css.textField}
            value={(flight.notes && flight.notes.osd) || ''}
            name='osd'
            onChange={changeNotes}
            onBlur={saveNotes}
            margin='normal'
          />

          <FlightLocation
            flight={flight}
            save={updateFlight}
          />
        </div>

        <Divider variant='middle' />

        <FlightBatteries
          flight={flight}
          batteries={read.data && read.data.allBatteries.nodes || []}
          refreshFlight={() => refreshFlight({ requestPolicy: 'network-only' })}
        />

        <div className={css.container}>
          <TextField
            id='jornal'
            label='Journal'
            placeholder='Journal'
            multiline
            className={`${css.textField} ${css.wide}`}
            value={(flight.notes && flight.notes.journal) || ''}
            name='journal'
            onChange={changeNotes}
            onBlur={saveNotes}
            margin='normal'
          />
        </div>

        <div className={flightCss.graph}>
          <FlightGraph segments={flight.segments || []} plane={planes[flight.plane] || defaultPlane}></FlightGraph>
        </div>

        <Videos
          date={flight.startDate}
          plane={flight.plane}
          session={flight.session}
        />
      </CardContent>
    </Card>
  );
}

export const FlightDetails = withRouter(FlightDetailsComponent);