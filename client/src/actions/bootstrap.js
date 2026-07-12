

import ActionTypes from '../constants/ActionTypes';

const handleBootstrapUpdate = (bootstrap) => ({
  type: ActionTypes.BOOTSTRAP_UPDATE_HANDLE,
  payload: {
    bootstrap,
  },
});

export default {
  handleBootstrapUpdate,
};
