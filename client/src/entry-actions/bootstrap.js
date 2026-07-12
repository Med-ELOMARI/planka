

import EntryActionTypes from '../constants/EntryActionTypes';

const handleBootstrapUpdate = (bootstrap) => ({
  type: EntryActionTypes.BOOTSTRAP_UPDATE_HANDLE,
  payload: {
    bootstrap,
  },
});

export default {
  handleBootstrapUpdate,
};
