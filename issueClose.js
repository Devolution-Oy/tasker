const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = require(process.env.ROSTER_SERVICE_APP_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPayment = async (amount, githubUser, issue, project) => {
  return admin.auth().createCustomToken(process.env.APP_ID)
    .then(token => {
      console.log('Got application token ' + token);
      const headers = {
        authorization: token
      };

      return axios.post(process.env.ROSTER_URL + '/postRecord',
        {
          amount: amount,
          githubUser: githubUser,
          issue: issue,
          project: project,
          timestamp: Date.now()
        },
        {
          headers: headers
        });
    });
};

const checkLabelName = (labels, name) => {
  let ret = false;
  labels.forEach(label => {
    if (label.name === name) {
      ret = true;
    }
  });
  return ret;
};

module.exports = async context => {
  const issue = context.payload.issue;
  if (checkLabelName(issue.labels, 'rejected')) {
    const issueComment = context.issue({ body: 'Issue had label rejected, therefore no payments done' });
    return context.github.issues.createComment(issueComment);
  }

  if (!issue.assignee) {
    context.log('No assignee');
    const issueComment = context.issue({ body: 'Issue does not have assignee, therefore no payments done' });
    return context.github.issues.createComment(issueComment);
  }

  const repo = context.payload.repository.name;
  return sendPayment(50, issue.assignee.login, issue.number, repo, context)
    .then(res => {
      context.log('Sent');
      const issueComment = context.issue({ body: `Sent payment to ${issue.assignee.login}` });
      context.log(issueComment);
      return context.github.issues.createComment(issueComment);
    }).catch(err => {
      context.log('Failed' + err);
      const issueComment = context.issue({ body: 'Failed to send payment' });
      return context.github.issues.createComment(issueComment);
    });
};
