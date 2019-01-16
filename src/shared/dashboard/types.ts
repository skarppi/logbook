import { DashboardUnit } from ".";

export interface Dataset {
  label: string;
  data: any[];
}

export interface Dashboard {
  labels: string[];
  max: number;
  datasets: Dataset[];
}

export interface DashboardQuery {
  unit: DashboardUnit;
  size: number;
}
