/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

(async () => {
  try {
    await knex.migrate.latest();

    if (process.env.NODE_ENV !== 'production') {
      await knex.seed.run();
    }
  } catch (error) {
    process.exitCode = 1;
    throw error;
  } finally {
    knex.destroy();
  }
})();
