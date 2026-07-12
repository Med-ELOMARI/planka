

import socket from './socket';

/* Transformers */

export const transformActivity = (activity) => ({
  ...activity,
  ...(activity.createdAt && {
    createdAt: new Date(activity.createdAt),
  }),
});

/* Actions */

const getBoardActivities = (boardId, data, headers) =>
  socket.get(`/boards/${boardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getCardActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

/* Event handlers */

const makeHandleActivityCreate = (next) => (body) => {
  next({
    ...body,
    item: transformActivity(body.item),
  });
};

export default {
  getBoardActivities,
  getCardActivities,
  makeHandleActivityCreate,
};
