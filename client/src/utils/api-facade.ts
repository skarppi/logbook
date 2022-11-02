import axios, { AxiosResponse } from "axios";
import { Flight } from "../shared/flights/types";

const apiPath = `${import.meta.env.BASE_URL}/api`;

export function getApi<T>(path: string, params: object = {}): Promise<T> {
  return axios
    .get(`${apiPath}/${path}`, { params })
    .then((res) => res.data as T);
}

export function putApi<T>(
  path: string,
  body?: any,
  headers: any = {}
): Promise<T> {
  return axios
    .put(`${apiPath}/${path}`, body, {
      headers,
    })
    .then((res) => res.data as T);
}

export function postApi<T>(path: string, body?: any): Promise<T> {
  return axios.post(`${apiPath}/${path}`, body).then((res) => res.data as T);
}

export function deleteApi<T>(path: string): Promise<T> {
  return axios.delete(`${apiPath}/${path}`).then((res) => res.data as T);
}

export function uploadFlightsAPI(
  data: FormData,
  timezoneOffset: number,
  locationId: number,
  onUploadProgress: (progressEvent: any) => void
): Promise<AxiosResponse<Flight[]>> {
  return axios.post(`${apiPath}/flights`, data, {
    headers: {
      TIMEZONE_OFFSET: timezoneOffset,
      LOCATION_ID: locationId,
    },
    onUploadProgress,
  });
}
