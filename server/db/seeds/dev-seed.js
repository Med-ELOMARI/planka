const bcrypt = require('bcrypt');

const POSITION_STEP = 65536;

DEFAULT_PASSWORD = 'password123';

const USERS = [
  { email: 'admin@example.com', role: 'admin', name: 'Admin User', username: 'admin' },
  { email: 'owner@example.com', role: 'projectOwner', name: 'Project Owner', username: 'owner' },
  { email: 'user1@example.com', role: 'boardUser', name: 'Alice Developer', username: 'alice' },
  { email: 'user2@example.com', role: 'boardUser', name: 'Bob Designer', username: 'bob' },
  { email: 'user3@example.com', role: 'boardUser', name: 'Charlie Tester', username: 'charlie' },
];


const LIST_TEMPLATES = [
  { name: 'To Do', color: 'pumpkin-orange' },
  { name: 'In Progress', color: 'lagoon-blue' },
  { name: 'In Review', color: 'lagoon-blue' },
  { name: 'Done', color: 'bright-moss' },
];

const CARD_NAMES = [
  'Set up project infrastructure',
  'Implement user authentication',
  'Design database schema',
  'Create REST API endpoints',
  'Write unit tests',
  'Configure CI/CD pipeline',
  'Add error handling',
  'Optimize performance',
  'Review code quality',
];

const COMMENTS = [
  'Initial work has started on this.',
  'This is blocked by another task.',
  'Almost done, just need to review.',
  'Updated the implementation approach.',
  'Tests are passing now.',
  'Needs more investigation.',
  'Ready for review.',
  'Fixed the issue mentioned in comments.',
  'Added documentation for this.',
];

const LABELS = [
  { name: 'Bug', color: 'berry-red' },
  { name: 'Feature', color: 'morning-sky' },
  { name: 'Enhancement', color: 'fresh-salad' },
  { name: 'Documentation', color: 'lagoon-blue' },
  { name: 'Urgent', color: 'apricot-red' },
];

const PROJECT_NAMES = [
  'Product Development',
  'Marketing Campaign',
  'Internal Tools',
  'Research & Discovery',
  'Customer Success',
];

const BOARD_NAMES = ['Sprint Board', 'Backlog', 'Bug Tracker', 'Features', 'Ideas'];

const BACKGROUNDS = [
  'ocean-dive',
  'jungle-mesh',
  'purple-rose',
  'sky-change',
  'green-eyes',
  'blue-xchange',
];

const now = () => new Date().toISOString();

exports.seed = async (knex) => {
  const numProjects = parseInt(process.env.SEED_PROJECTS, 10) || 3;
  const numBoards = parseInt(process.env.SEED_BOARDS_PER_PROJECT, 10) || 2;
  const numLists = Math.min(
    parseInt(process.env.SEED_LISTS, 10) || LIST_TEMPLATES.length,
    LIST_TEMPLATES.length,
  );
  const numCards = parseInt(process.env.SEED_CARDS_PER_LIST, 10) || 3;
  const numComments = parseInt(process.env.SEED_COMMENTS_PER_CARD, 10) || 2;
  const password = process.env.SEED_PASSWORD || DEFAULT_PASSWORD;

  const ts = now();

  const userIds = [];
  for (const u of USERS) {
    const existing = await knex('user_account').where('email', u.email).first();
    if (existing) {
      userIds.push(existing.id);
      continue;
    }

    const [{ id }] = await knex('user_account')
      .insert(
        {
          email: u.email,
          password: bcrypt.hashSync(password, 10),
          role: u.role,
          name: u.name,
          username: u.username,
          subscribeToOwnCards: false,
          subscribeToCardWhenCommenting: true,
          turnOffRecentCardHighlighting: false,
          enableFavoritesByDefault: true,
          defaultEditorMode: 'wysiwyg',
          defaultHomeView: 'groupedProjects',
          defaultProjectsOrder: 'byDefault',
          isSsoUser: false,
          isDeactivated: false,
          createdAt: ts,
          updatedAt: ts,
        },
        'id',
      );
    userIds.push(id);
  }

  const [, ownerId, ...boardUserIds] = userIds;

  for (let p = 0; p < numProjects; p++) {
    const [{ id: projectId }] = await knex('project')
      .insert(
        {
          name: PROJECT_NAMES[p % PROJECT_NAMES.length],
          description: `Description for ${PROJECT_NAMES[p % PROJECT_NAMES.length]}`,
          backgroundType: 'gradient',
          backgroundGradient: BACKGROUNDS[p % BACKGROUNDS.length],
          isHidden: false,
          createdAt: ts,
          updatedAt: ts,
        },
        'id',
      );

    await knex('project_manager').insert([
      { projectId, userId: ownerId, createdAt: ts, updatedAt: ts },
      { projectId, userId: userIds[0], createdAt: ts, updatedAt: ts },
    ]);

    for (let b = 0; b < numBoards; b++) {
      const [{ id: boardId }] = await knex('board')
        .insert(
          {
            projectId,
            position: (b + 1) * POSITION_STEP,
            name: BOARD_NAMES[b % BOARD_NAMES.length],
            defaultView: 'kanban',
            defaultCardType: 'project',
            limitCardTypesToDefaultOne: false,
            alwaysDisplayCardCreator: true,
            displayCardAges: true,
            expandTaskListsByDefault: true,
            createdAt: ts,
            updatedAt: ts,
          },
          'id',
        );

      const boardMemberships = [
        { projectId, boardId, userId: ownerId, role: 'editor' },
        { projectId, boardId, userId: userIds[0], role: 'editor' },
        ...boardUserIds.map((id) => ({
          projectId,
          boardId,
          userId: id,
          role: 'editor',
        })),
      ];
      await knex('board_membership').insert(
        boardMemberships.map((m) => ({
          ...m,
          canComment: null,
          createdAt: ts,
          updatedAt: ts,
        })),
      );

      const labelIds = await Promise.all(
        LABELS.map((lbl, i) =>
          knex('label')
            .insert(
              {
                boardId,
                position: (i + 1) * POSITION_STEP,
                name: lbl.name,
                color: lbl.color,
                createdAt: ts,
                updatedAt: ts,
              },
              'id',
            )
            .then(([{ id }]) => id),
        ),
      );

      const listIds = await Promise.all(
        LIST_TEMPLATES.slice(0, numLists).map((lt, i) =>
          knex('list')
            .insert(
              {
                boardId,
                type: 'active',
                position: (i + 1) * POSITION_STEP,
                name: lt.name,
                color: lt.color,
                createdAt: ts,
                updatedAt: ts,
              },
              'id',
            )
            .then(([{ id }]) => id),
        ),
      );

      for (let ci = 0; ci < numCards; ci++) {
        const cardIndex =
          (ci + b * numCards + p * numBoards * numCards) % CARD_NAMES.length;
        const li = ci % listIds.length;
        const creatorId = boardUserIds[ci % boardUserIds.length];

        const dueDate =
          (ci + b + p) % 3 === 0
            ? new Date(Date.now() + (ci + 1) * 86400000).toISOString()
            : undefined;

        const [{ id: cardId }] = await knex('card')
          .insert(
            {
              boardId,
              listId: listIds[li],
              creatorUserId: creatorId,
              type: 'project',
              position: (ci + 1) * POSITION_STEP,
              name: CARD_NAMES[cardIndex],
              description: `Description for: ${CARD_NAMES[cardIndex]}`,
              commentsTotal: numComments,
              isClosed: false,
              ...(dueDate && { dueDate }),
              createdAt: ts,
              updatedAt: ts,
            },
            'id',
          );

        await knex('card_membership').insert(
          [
            creatorId,
            boardUserIds[(ci + 1) % boardUserIds.length],
          ].map((uid) => ({ cardId, userId: uid, createdAt: ts, updatedAt: ts })),
        );

        if (ci % 2 === 0) {
          await knex('card_label').insert({
            cardId,
            labelId: labelIds[ci % labelIds.length],
            createdAt: ts,
            updatedAt: ts,
          });
        }

        const listRef = LIST_TEMPLATES.slice(0, numLists)[li];

        await knex('action').insert({
          boardId,
          cardId,
          userId: creatorId,
          type: 'createCard',
          data: {
            card: { name: CARD_NAMES[cardIndex] },
            list: { id: listIds[li], type: 'active', name: listRef.name },
          },
          createdAt: ts,
          updatedAt: ts,
        });

        if (numComments > 0) {
          const commentRows = Array.from({ length: numComments }, (_, co) => ({
            cardId,
            userId: boardUserIds[(ci + co) % boardUserIds.length],
            text: COMMENTS[(ci * numComments + co + b * 3 + p * 5) % COMMENTS.length],
            createdAt: ts,
            updatedAt: ts,
          }));
          await knex('comment').insert(commentRows);
        }
      }
    }
  }

  console.log(
    `Seeded ${numProjects} project(s), ${numProjects * numBoards} board(s), ${numProjects * numBoards * numCards} card(s), ${numProjects * numBoards * numCards * numComments} comment(s)`,
  );
};
