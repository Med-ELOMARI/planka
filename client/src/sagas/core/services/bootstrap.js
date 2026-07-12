

import { put } from 'redux-saga/effects';

import actions from '../../../actions';

export function* handleBootstrapUpdate(bootstrap) {
  yield put(actions.handleBootstrapUpdate(bootstrap));
}

export default {
  handleBootstrapUpdate,
};
