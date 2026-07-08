

import http from './http';

/* Actions */

const getBootstrap = (headers) => http.get('/bootstrap', undefined, headers);

export default {
  getBootstrap,
};
