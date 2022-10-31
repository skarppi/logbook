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