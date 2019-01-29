import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./app/App/App";
import { Provider } from "react-redux";
import store from "./app/store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
