import axios from 'axios';

const apiPath = `${process.env.PUBLIC_PATH}/api`;

export function getApi<T>(path: string, params: object = {}): Promise<T> {
  return axios.get(`${apiPath}/${path}`, { params }).then(res => res.data as T);
}

export function putApi<T>(path: string, body?: any, headers: any = {}): Promise<T> {
  return axios.put(`${apiPath}/${path}`, body, {
    headers
  }).then(res => res.data as T);
}

export function postApi<T>(path: string, body?: any): Promise<T> {
  return axios.post(`${apiPath}/${path}`, body).then(res => res.data as T);
}

export function deleteApi<T>(path: string): Promise<T> {
  return axios.delete(`${apiPath}/${path}`).then(res => res.data as T);
}

export function uploadFlightsAPI(
  data: FormData,
  timezoneOffset: number,
  locationId: number,
  onUploadProgress: (progressEvent: any) => void
) {
  return axios.post(`${apiPath}/flights`, data, {
    headers: {
      TIMEZONE_OFFSET: timezoneOffset,
      LOCATION_ID: locationId
    },
    onUploadProgress
  });
}
