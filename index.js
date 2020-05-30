/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const issueClose = require('./issueClose.js');
const push = require('./push');

module.exports = app => {
  app.on('issues.closed', issueClose);
  app.on('push', push);
}