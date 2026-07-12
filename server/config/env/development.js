/**
 * Development environment settings
 * (sails.config.*)
 *
 * This configuration is only used when running your Sails app in development mode.
 * i.e. when you lift your app using:
 *
 * ```
 * node app
 * ```
 *
 * The settings here will then override those in `config/env/production.js`.
 *
 * For more information on configuring Sails, see:
 * https://sailsjs.com/config
 */

module.exports = {
  /**
   * Socket.io configuration for development
   */
  sockets: {
    onlyAllowOrigins: [
      'http://localhost:1337',
      'http://localhost:3000',
      'http://127.0.0.1:1337',
      'http://127.0.0.1:3000',
    ],
  },
};
