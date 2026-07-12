
import socket from './socket';

/* Actions */

const search = (data, headers) => socket.get('/search', data, headers);

export default {
  search,
};
