import { LogicalFunction, PlaneType } from '.';
import { Plane, LogicalSwitch } from './types';

export const logicalSwitches: { [key: string]: LogicalSwitch } = {
  // default switches for quad with SB arming switch
  L01: {
    id: 'L01', func: LogicalFunction.greaterThan, v1: 'SB', v2: '-1', description: 'SB not up = armed'
  },
  L02: {
    id: 'L02', func: LogicalFunction.greaterThan, v1: 'Thr', v2: '-922', description: 'Throttle > 5% = flying'
  },
  L03: {
    id: 'L03', func: LogicalFunction.lessThan, v1: 'Thr', v2: '-922', duration: 3, description: 'Throttle < 5% = stopped'
  },
  L04: {
    id: 'L04', func: LogicalFunction.is, v1: null, duration: 10, description: 'No data for 10 seconds = new flight'
  },

  // default switches for glider with SA launch switch (SoarOTX)
  L11: {
    id: 'L11', func: LogicalFunction.greaterThan, v1: 'SA', v2: '-1', description: 'SA not up = armed/launch mode'
  },
  L12: {
    id: 'L12', func: LogicalFunction.greaterThan, v1: 'VSpd(m/s)', v2: '1', description: 'Vertical speed more than 1m/s = flying'
  },
  L13: {
    id: 'L13', func: LogicalFunction.lessThan, v1: 'SA', v2: '1', description: 'SA not down = back to launch mode'
  },
  L14: {
    id: 'L14', func: LogicalFunction.is, v1: null, duration: 2, description: 'No data for 2 seconds'
  }
}

export const defaultPlane: Plane = {
  id: '',
  type: PlaneType.drone,
  batterySlots: 0,
  batteries: [],
  ignoreTelemetries: [],
  flightModes: [],
  modes: {
    armed: logicalSwitches.L01,
    flying: logicalSwitches.L02,
    stopped: logicalSwitches.L03,
    restart: logicalSwitches.L04,
    stoppedStartsNewFlight: false
  }
};

export const planes: { [key: string]: Plane } = {
  Reverb: {
    id: 'Reverb',
    type: PlaneType.drone,
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
    ignoreTelemetries: ['SA', 'SD', 'SF', 'SG', 'SH', 'S2', 'S3', 'LS', 'RS'],
    flightModes: [],
    modes: defaultPlane.modes
  },
  TWR: {
    id: 'TWR',
    type: PlaneType.drone,
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
    ignoreTelemetries: ['SA', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'S1', 'S2', 'S3', 'LS', 'RS'],
    flightModes: [],
    modes: {
      armed: logicalSwitches.L01,
      flying: logicalSwitches.L02,
      stopped: logicalSwitches.L04,
      restart: logicalSwitches.L04,
      stoppedStartsNewFlight: false
    }

  },
  MOB7: {
    id: 'MOB7',
    type: PlaneType.drone,
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
    ignoreTelemetries: ['SD', 'SE', 'SF', 'SG', 'SH', 'S1', 'S2', 'S3', 'LS', 'RS', 'RxBt(V)'],
    flightModes: [],
    modes: defaultPlane.modes
  },
  Salome: {
    id: 'Salome',
    type: PlaneType.glider,
    batterySlots: 0,
    batteries: [
    ],
    ignoreTelemetries: ['SD', 'SF', 'SG', 'S2', 'S3', 'LS', 'RS'],
    flightModes: [],
    modes: {
      armed: logicalSwitches.L01,
      flying: logicalSwitches.L12,
      stopped: logicalSwitches.L03,
      restart: logicalSwitches.L14,
      stoppedStartsNewFlight: true
    }
  },
  F3K: {
    id: 'F3K',
    type: PlaneType.glider,
    batterySlots: 0,
    batteries: [
    ],
    ignoreTelemetries: ['SD', 'SF', 'SG', 'S2', 'S3', 'LS', 'RS'],
    flightModes: ['Cruise', 'Launch', 'Zoom', 'Speed', 'Float'],
    modes: {
      armed: logicalSwitches.L11,
      flying: logicalSwitches.L12,
      stopped: logicalSwitches.L13,
      restart: logicalSwitches.L14,
      stoppedStartsNewFlight: true
    }
  }
};