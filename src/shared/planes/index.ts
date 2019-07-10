export enum PlaneType {
  drone,
  glider
}

export enum LogicalFunction {
  greaterThan = 'a>x',
  is = 'a=x',
  not = 'a~x',
  lessThan = 'a<x',
  and = 'AND',
  or = 'OR',
  sticky = 'STICKY'
}