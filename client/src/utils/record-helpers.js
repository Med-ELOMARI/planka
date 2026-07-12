

import { StaticUserIds } from '../constants/StaticUsers';
import { ListTypes, UserRoles } from '../constants/Enums';

export const isUserStatic = (user) => [StaticUserIds.DELETED].includes(user.id);

export const isUserAdminOrProjectOwner = (user) =>
  [UserRoles.ADMIN, UserRoles.PROJECT_OWNER].includes(user.role);

export const isListArchiveOrTrash = (list) =>
  [ListTypes.ARCHIVE, ListTypes.TRASH].includes(list.type);

export const isListFinite = (list) => [ListTypes.ACTIVE, ListTypes.CLOSED].includes(list.type);

export const isListKanban = (list) => [ListTypes.ACTIVE, ListTypes.CLOSED].includes(list.type);
