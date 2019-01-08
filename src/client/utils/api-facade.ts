import axios from "axios";

export function getApi<T>(path: string, params: object = {}): Promise<T> {
  return axios.get(`/api/${path}`, { params }).then(res => res.data as T);
}

export function uploadFlightsAPI(
  data: FormData,
  onUploadProgress: (progressEvent: any) => void
) {
  return axios.post(`/api/flights`, data, {
    onUploadProgress: onUploadProgress
  });
}
