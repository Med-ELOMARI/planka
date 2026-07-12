/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    q: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    // Determine board IDs accessible to the current user
    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const fullyVisibleProjectIds = [...managerProjectIds];

    if (currentUser.role === User.Roles.ADMIN) {
      const sharedProjects = await Project.qm.getShared({
        exceptIdOrIds: managerProjectIds,
      });
      fullyVisibleProjectIds.push(...sails.helpers.utils.mapRecords(sharedProjects));
    }

    const [boardMemberships, fullyVisibleBoards] = await Promise.all([
      BoardMembership.qm.getByUserId(currentUser.id),
      fullyVisibleProjectIds.length > 0 ? Board.qm.getByProjectIds(fullyVisibleProjectIds) : [],
    ]);

    const accessibleBoardIdsSet = new Set([
      ...sails.helpers.utils.mapRecords(fullyVisibleBoards),
      ...sails.helpers.utils.mapRecords(boardMemberships, 'boardId'),
    ]);

    const accessibleBoardIds = [...accessibleBoardIdsSet];

    if (accessibleBoardIds.length === 0) {
      return {
        cards: [],
        comments: [],
        included: {
          cards: [],
          boards: [],
          projects: [],
        },
      };
    }

    // Parallel search across cards and comments
    const [cards, comments] = await Promise.all([
      Card.qm.searchGlobally(inputs.q, accessibleBoardIds),
      Comment.qm.searchGlobally(inputs.q, accessibleBoardIds),
    ]);

    // Fetch the cards that matched comments belong to (for navigation)
    const commentCardIds = _.uniq(_.map(comments, 'cardId'));
    const cardsForComments =
      commentCardIds.length > 0 ? await Card.qm.getByIds(commentCardIds) : [];

    // Collect boards and projects for display context
    const allCards = [...cards, ...cardsForComments];
    const allBoardIds = _.uniq(_.map(allCards, 'boardId'));
    const boards = allBoardIds.length > 0 ? await Board.qm.getByIds(allBoardIds) : [];

    const projectIds = _.uniq(_.map(boards, 'projectId'));
    const projects = projectIds.length > 0 ? await Project.qm.getByIds(projectIds) : [];

    return {
      cards,
      comments,
      included: {
        cards: cardsForComments,
        boards,
        projects,
      },
    };
  },
};
