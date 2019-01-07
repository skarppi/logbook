export interface Dataset {
  label: string;
  data: any[];
}

export interface Dashboard {
  labels: string[];
  datasets: Dataset[];
}
