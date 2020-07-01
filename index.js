/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const issueClose = require('./issueClose.js');
const push = require('./push.js');

module.exports = app => {
  // Handle payments for closed issues
  app.on('issues.closed', issueClose);
  // Parse TODO flags from new commits
  app.on('push', push);
};
