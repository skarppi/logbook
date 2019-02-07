import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { createStore, applyMiddleware } from "redux";
import { createRootReducer, rootSaga } from ".";
import { composeWithDevTools } from "redux-devtools-extension";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";

// create the composing function for our middlewares
const composeEnhancers = composeWithDevTools({});
// create the redux-saga middleware
const sagaMiddleware = createSagaMiddleware();

export const history = createBrowserHistory();

export const rootReducer = createRootReducer(history);

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(routerMiddleware(history), logger, sagaMiddleware)
  )
);

sagaMiddleware.run(rootSaga);

export default store;
