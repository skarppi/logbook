import { LogicalFunction } from './flights';
import { Plane } from './flights/types';

export const defaultPlane: Plane = {
  name: '',
  batterySlots: 0,
  batteries: [],
  ignoreTelemetries: [],
  flightModes: [],
  modes: {
    armed: {
      op: LogicalFunction.greaterThan, key: 'SB', value: -1
    },
    startFlying: {
      op: LogicalFunction.greaterThan, key: 'Thr', value: -922
    },
    endFlying: {
      op: LogicalFunction.lessThan, key: 'Thr', value: -922
    },
  }
};

export const planes: { [key: string]: Plane } = {
  Reverb: {
    name: 'Reverb',
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
    name: 'TWR',
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
    modes: defaultPlane.modes
  },
  MOB7: {
    name: 'MOB7',
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
    name: 'Salome',
    batterySlots: 0,
    batteries: [
    ],
    ignoreTelemetries: ['SD', 'SF', 'SG', 'S2', 'S3', 'LS', 'RS'],
    flightModes: [],
    modes: {
      armed: { op: LogicalFunction.greaterThan, key: 'SA', value: -1 },
      startFlying: { op: LogicalFunction.greaterThan, key: 'VSpd(m/s)', value: 1 },
      endFlying: { op: LogicalFunction.lessThan, key: 'SA', value: 1 },
    }
  },
  F3K: {
    name: 'F3K',
    batterySlots: 0,
    batteries: [
    ],
    ignoreTelemetries: ['SD', 'SF', 'SG', 'S2', 'S3', 'LS', 'RS'],
    flightModes: ['Cruise', 'Launch', 'Zoom', 'Speed', 'Float'],
    modes: {
      armed: { op: LogicalFunction.greaterThan, key: 'SA', value: -1 },
      startFlying: { op: LogicalFunction.greaterThan, key: 'VSpd(m/s)', value: 1 },
      endFlying: { op: LogicalFunction.lessThan, key: 'SA', value: 1 },
    }
  }
};