import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import * as React from 'react';
import { Flight } from '../../../../../shared/flights/types';
import { useHistory } from 'react-router-dom';

import { FlightDate } from './FlightDate';
import { FlightDuration } from './FlightDuration';
import { FlightBatteries } from './FlightBatteries';
import { FlightLocation } from './FlightLocation';

import { Videos } from '../Videos/Videos';
import { FlightGraph } from './FlightGraph';

const css = require('../../../common/Form.css');
const flightCss = require('./Flight.css');

import { differenceInHours } from 'date-fns';

import DeleteIcon from '@material-ui/icons/Delete';
import NavigateBeforeIcon from '@material-ui/icons/ExpandMore';
import NavigateNextIcon from '@material-ui/icons/ExpandLess';
import HamburgerIcon from '@material-ui/icons/MoreVert';
import FavoriteIcon from '@material-ui/icons/Favorite';
import UnFavoriteIcon from '@material-ui/icons/FavoriteBorder';

import { LoadingIcon } from '../../loading/Loading';
import { useQuery, useMutation } from 'urql';
import gql from 'graphql-tag';
import { Battery } from '../../../../../shared/batteries/types';
import { formatDate } from '../../../utils/date';
import { putApi } from '../../../utils/api-facade';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { FlightTimezone } from './FlightTimezone';
import { FlightTrack } from './FlightTrack';

const Query = gql`
  query($id:String!) {
    flight(id: $id) {
      id
      session
      startDate
      endDate
      duration
      armedTime
      flightTime
      notes
      location {
        id
        name
        latitude
        longitude
      }
      favorite
      segments
      batteryCycles {
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
      plane {
        id
        type
        telemetries
        batterySlots
        planeBatteries {
          nodes {
            batteryName
          }
        }
      }
    }
    batteries(orderBy:NAME_ASC) {
      nodes {
        name
      }
    }
  }`;

const Update = gql`
  mutation($id:String!, $patch:FlightPatch!) {
    updateFlight(input: {id: $id, patch: $patch}) {
      flight {
        id
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
    deleteFlight(input: {id: $id}) {
      flight {
        id
      }
    }
  }`;


interface IQueryResponse {
  flight: Flight;
  batteries: {
    nodes: Battery[];
  };
}

export const FlightDetails = ({ entry, nextFlightLink, previousFlightLink }) => {

  const history = useHistory();

  const [timezoneOffset, setTimezoneOffset] = React.useState(-new Date().getTimezoneOffset() / 60);
  const [anchorEl, setAnchorEl] = React.useState(null);

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
      setFlight(read.data.flight);

      if (flight.segments && flight.segments[0]) {
        const row = flight.segments[0].rows[0];
        const originalStartDate = new Date(`${row.Date} ${row.Time}`);
        const currentStartDate = new Date(flight.startDate);

        const offset = -(originalStartDate.getTimezoneOffset() / 60 + differenceInHours(currentStartDate, originalStartDate));

        setTimezoneOffset(offset);
      }
    }
  }, [read.data]);

  const flightDate = formatDate(flight.startDate);

  const changeFavorite = () =>
    updateFlight({
      id: flight.id,
      patch: { favorite: flight.favorite ? 0 : 1 }
    });

  const changeNotes = ({ target: { name, value } }) =>
    setFlight({
      ...flight,
      notes: { ...flight.notes, [name]: value }
    });

  const saveNotes = () => updateFlight({
    id: flight.id,
    patch: { notes: flight.notes }
  });

  const executeReset = _ => {
    setAnchorEl(null);
    putApi(`flights/${flightDate}/${flight.id}/reset`, null, {
      TIMEZONE_OFFSET: timezoneOffset
    }).then(res =>
      refreshFlight({ requestPolicy: 'network-only' })
    );
  };

  const executeDelete = _ => {
    setAnchorEl(null);
    deleteFlight({ id: flight.id }).then(res => {
      if (!res.error) {
        history.push(`/flights/${flightDate}`);
      }
    });
  };

  const goNextFlight = _ => history.push(nextFlightLink);

  const goPreviousFlight = _ => history.push(previousFlightLink);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }


  return (
    <Card className={css.card}>
      <CardHeader
        title={`Flight: ${flight.id}`}
        action={
          <>
            <LoadingIcon
              spinning={read.fetching || update.fetching || del.fetching}
              error={read.error || update.error || del.error}
            />

            {<IconButton
              onClick={changeFavorite}>
              {flight.favorite ? <FavoriteIcon /> : <UnFavoriteIcon />}
            </IconButton>
            }

            <IconButton
              onClick={goNextFlight}
              disabled={!nextFlightLink}>
              <NavigateNextIcon />
            </IconButton>

            <IconButton
              onClick={goPreviousFlight}
              disabled={!previousFlightLink}>
              <NavigateBeforeIcon />
            </IconButton>

            <IconButton
              aria-label='More'
              aria-controls='hamburger'
              aria-haspopup='true'
              onClick={handleClick}
            >
              <HamburgerIcon />
            </IconButton>
            <Menu
              id='hamburger'
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >

              <MenuItem key='Reset'>
                <FlightTimezone offset={timezoneOffset} onChange={setTimezoneOffset} />
                <ListItemText primary='Change timezone' onClick={executeReset} />
              </MenuItem>


              <MenuItem key='Delete' onClick={executeDelete}>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText primary='Delete Flight' />
              </MenuItem>
            </Menu>
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
            value={(flight.notes?.osd) || ''}
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
          batteries={read.data?.batteries.nodes || []}
          refreshFlight={() => refreshFlight({ requestPolicy: 'network-only' })}
        />

        <div className={css.container}>
          <TextField
            id='jornal'
            label='Journal'
            placeholder='Journal'
            multiline
            className={`${css.textField} ${css.wide}`}
            value={(flight.notes?.journal) || ''}
            name='journal'
            onChange={changeNotes}
            onBlur={saveNotes}
            margin='normal'
          />
        </div>

        <div className={flightCss.graph}>
          <FlightGraph segments={flight.segments || []} plane={flight.plane}></FlightGraph>
        </div>

        <div className={flightCss.track}>
          <FlightTrack flight={flight}></FlightTrack>
        </div>

        <Videos
          date={flight.startDate}
          plane={flight.planeId}
          session={flight.session}
        />
      </CardContent>
    </Card>
  );
};