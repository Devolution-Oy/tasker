/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const axios = require('axios');

module.exports = app => {
  const sendPayment = (amount, githubUser, issue, project) => {
    app.log('Sending paymet ' + process.env.ROSTER_URL);
    return axios.post(process.env.ROSTER_URL + '/postRecord', {
      amount: amount,
      githubUser: githubUser,
      issue: issue,
      project: project,
      timestamp: Date.now()
    }).then(res => {
      return true;
    });
  };

  const checkLabelName = (labels, name) => {
    let ret = false;
    labels.forEach(label => {
      app.log(label.name);
      if (label.name === name) {
        ret = true;
      }
    });
    return ret;
  };

  app.on('issues.closed', async (context) => {
    const issue = context.payload.issue;
    if (checkLabelName(issue.labels, 'rejected')) {
      const issueComment = context.issue({ body: 'Issue had label rejected, therefore no payments done' });
      return context.github.issues.createComment(issueComment);
    }

    if (!issue.assignee) {
      app.log('No assignee');
      const issueComment = context.issue({ body: 'Issue does not have assignee, therefore no payments done' });
      return context.github.issues.createComment(issueComment);
    }

    const repo = context.payload.repository.name;
    return sendPayment(50, issue.assignee.login, issue.number, repo, context)
      .then(res => {
        app.log('Sent');
        const issueComment = context.issue({ body: `Sent payment to ${issue.assignee.login}` });
        app.log(issueComment);
        return context.github.issues.createComment(issueComment);
      }).catch(err => {
        app.log('Failed' + err);
        const issueComment = context.issue({ body: 'Failed to send payment' });
        return context.github.issues.createComment(issueComment);
      });
  });
};
