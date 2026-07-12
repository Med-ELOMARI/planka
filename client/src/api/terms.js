

import http from './http';

/* Actions */

const getTerms = (language, headers) =>
  http.get(`/terms${language ? `?language=${language}` : ''}`, undefined, headers);

export default {
  getTerms,
};
