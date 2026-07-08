

import EntryActionTypes from '../constants/EntryActionTypes';

const toggleFavorites = (isEnabled) => ({
  type: EntryActionTypes.FAVORITES_TOGGLE,
  payload: {
    isEnabled,
  },
});

const toggleEditMode = (isEnabled) => ({
  type: EntryActionTypes.EDIT_MODE_TOGGLE,
  payload: {
    isEnabled,
  },
});

const updateHomeView = (value) => ({
  type: EntryActionTypes.HOME_VIEW_UPDATE,
  payload: {
    value,
  },
});

const logout = (revokeAccessToken = true) => ({
  type: EntryActionTypes.LOGOUT,
  payload: {
    revokeAccessToken,
  },
});

export default {
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
};
