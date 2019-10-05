import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app/App/App';
import { Provider, createClient } from 'urql';

import 'video-react/dist/video-react.css';

const client = createClient({
  url: `${process.env.PUBLIC_PATH}/api/graphql`
});

ReactDOM.render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('app')
);
