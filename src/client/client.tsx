import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./app/App/App";
import { Provider } from "react-redux";
import store, { history } from "./app/store";

import "video-react/dist/video-react.css";

ReactDOM.render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById("app")
);
