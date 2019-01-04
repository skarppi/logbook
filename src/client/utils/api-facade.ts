import axios from "axios";

export function getApi<T>(path: string): Promise<T> {
  return axios.get(`/api/${path}`).then(res => res.data as T);
}

export function uploadFlightsAPI(
  data: FormData,
  onUploadProgress: (progressEvent: any) => void
) {
  return axios.post(`/api/flights`, data, {
    onUploadProgress: onUploadProgress
  });
}
