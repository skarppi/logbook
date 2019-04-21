import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./app/App/App";
import { Provider as ReduxProvider } from "react-redux";
import store, { history } from "./app/store";
import { Provider as UrqlProvider, createClient } from 'urql';

import "video-react/dist/video-react.css";

const client = createClient({
  url: `${process.env.PUBLIC_URL}/api/graphql`
});

ReactDOM.render(
  <ReduxProvider store={store}>
    <UrqlProvider value={client}>
      <App history={history} />
    </UrqlProvider>
  </ReduxProvider>,
  document.getElementById("app")
);
