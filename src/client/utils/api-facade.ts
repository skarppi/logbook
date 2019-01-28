import axios from "axios";

import { call, put } from "redux-saga/effects";

export function* handleCall(action, path, api = getApi, body?: any) {
  try {
    const res = yield call(api, path, body);

    if (res.error) {
      yield put(action.failure(res.error));
    } else {
      yield put(action.success(res));
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(action.failure(err.stack!));
    } else {
      yield put(action.failure("An unknown error occured."));
    }
  }
}

export function getApi<T>(path: string, params: object = {}): Promise<T> {
  return axios.get(`/api/${path}`, { params }).then(res => res.data as T);
}

export function putApi<T>(path: string, body?: any): Promise<T> {
  return axios.put(`/api/${path}`, body).then(res => res.data as T);
}

export function postApi<T>(path: string, body?: any): Promise<T> {
  return axios.post(`/api/${path}`, body).then(res => res.data as T);
}

export function deleteApi<T>(path: string): Promise<T> {
  return axios.delete(`/api/${path}`).then(res => res.data as T);
}

export function uploadFlightsAPI(
  data: FormData,
  onUploadProgress: (progressEvent: any) => void
) {
  return axios.post(`/api/flights`, data, {
    onUploadProgress: onUploadProgress
  });
}
