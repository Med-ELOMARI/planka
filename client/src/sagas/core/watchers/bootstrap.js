

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* bootstrapWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOOTSTRAP_UPDATE_HANDLE, ({ payload: { bootstrap } }) =>
      services.handleBootstrapUpdate(bootstrap),
    ),
  ]);
}
