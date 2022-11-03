import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App/App";
import { Provider, createClient } from "urql";

import "video-react/dist/video-react.css";
import "leaflet/dist/leaflet.css";
import "./common/global-leaflet.css";

const client = createClient({
  url: import.meta.env.BASE_URL + "api/graphql",
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
);
