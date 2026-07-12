

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';

export const selectCalendarCardsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return [];
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return [];
    }

    return boardModel.getFilteredCardsModelArray().map((cardModel) => ({
      id: cardModel.id,
      name: cardModel.name,
      createdAt: cardModel.createdAt,
      dueDate: cardModel.dueDate,
      isClosed: cardModel.isClosed,
    }));
  },
);

export default {
  selectCalendarCardsForCurrentBoard,
};
