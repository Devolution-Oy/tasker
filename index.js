/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const issueClose = require('./issueClose.js');
const issueLabeled = require('./issueLabeled.js');
const push = require('./push.js');

module.exports = app => {
  // Handle payments for closed issues
  app.on('issues.closed', issueClose);
  // Parse TODO flags from new commits
  app.on('push', push);
  // Handle issue acceptance
  app.on('issues.labeled', issueLabeled);

  const status = app.route('/status');
  status.use(require('express').static('public'));
  status.get('/alive', (_req, res) => {
    res.status(200).send('Alive');
  });
};
