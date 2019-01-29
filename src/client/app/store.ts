import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { createStore, applyMiddleware } from "redux";
import { RootState, rootReducer, rootSaga } from ".";
import { composeWithDevTools } from "redux-devtools-extension";

// create the composing function for our middlewares
const composeEnhancers = composeWithDevTools({});
// create the redux-saga middleware
const sagaMiddleware = createSagaMiddleware();

const store = createStore<RootState, any, any, any>(
  rootReducer,
  composeEnhancers(applyMiddleware(logger, sagaMiddleware))
);

sagaMiddleware.run(rootSaga);

export default store;
