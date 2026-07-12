

import EntryActionTypes from '../constants/EntryActionTypes';

const updateConfig = (data) => ({
  type: EntryActionTypes.CONFIG_UPDATE,
  payload: {
    data,
  },
});

const handleConfigUpdate = (config) => ({
  type: EntryActionTypes.CONFIG_UPDATE_HANDLE,
  payload: {
    config,
  },
});

const testSmtpConfig = () => ({
  type: EntryActionTypes.SMTP_CONFIG_TEST,
  payload: {},
});

export default {
  updateConfig,
  handleConfigUpdate,
  testSmtpConfig,
};
