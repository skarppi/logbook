export const isLoading = (state, actions) => {
  if (!state.api) {
    return;
  }
  // returns true only when all actions is not loading
  return actions.find(action => state.api.loading[action]) !== undefined;
  // return _(actions).some(action => _.get(state));
};
