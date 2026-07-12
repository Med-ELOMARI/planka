

import { ListTypes, ListTypeStates } from './Enums';

export default {
  [ListTypes.ACTIVE]: ListTypeStates.OPENED,
  [ListTypes.CLOSED]: ListTypeStates.CLOSED,
};
