

import { all, call, spawn } from 'redux-saga/effects';

function* safeWatch(watcher) {
  while (true) {
    try {
      yield call(watcher);
      break;
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }
  }
}

export default function* runWatchers(watchers) {
  return yield all(watchers.map((watcher) => spawn(safeWatch, watcher)));
}
