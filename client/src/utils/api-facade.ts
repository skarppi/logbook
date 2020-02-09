import axios from "axios";

const apiPath = `${process.env.PUBLIC_PATH}/api`;

// export function* handleCall(
//   action,
//   path,
//   api = getApi,
//   body?: any,
//   navigate?: (any) => string
// ) {
//   try {
//     const res = yield call(api, path, body);

//     if (res.error) {
//       yield put(action.failure(res.error));
//     } else {
//       yield put(action.success(res));
//       if (navigate) {
//         // yield put(push(navigate(res)));
//       }
//     }
//   } catch (err) {
//     if (err instanceof Error) {
//       const msg = (err["response"] && err["response"]["data"]) || err.message;
//       yield put(action.failure(msg));
//     } else {
//       yield put(action.failure("An unknown error occured."));
//     }
//   }
// }

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
  split: number,
  timezoneOffset: number,
  locationId: number,
  onUploadProgress: (progressEvent: any) => void
) {
  return axios.post(`${apiPath}/flights`, data, {
    headers: {
      SPLIT_FLIGHTS_AFTER_SECONDS: split,
      TIMEZONE_OFFSET: timezoneOffset,
      LOCATION_ID: locationId
    },
    onUploadProgress
  });
}
