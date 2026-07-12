const DEFAULT_LABELS = [
  { name: 'Urgent', color: 'berry-red' },
  { name: 'Need review', color: 'midnight-blue' },
  { name: 'Cancelled', color: 'gun-metal' },
  { name: 'Postponed', color: 'egg-yellow' },
  { name: 'Optional', color: 'grey-stone' },
];

const POSITION_GAP = 65536;

exports.up = async (knex) => {
  const boards = await knex('board').select('id');

  for (const board of boards) {
    // eslint-disable-next-line no-await-in-loop
    const existingLabels = await knex('label').where({ board_id: board.id }).count('id as count').first();

    if (parseInt(existingLabels.count, 10) === 0) {
      // eslint-disable-next-line no-await-in-loop
      await knex('label').insert(
        DEFAULT_LABELS.map((label, index) => ({
          board_id: board.id,
          position: POSITION_GAP * (index + 1),
          name: label.name,
          color: label.color,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      );
    }
  }
};

exports.down = async () => {
  // Not reversible — cannot distinguish seeded labels from user-created ones.
};
