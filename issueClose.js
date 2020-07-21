const axios = require('axios');
const getPrice = require('./utils/getPrice');

const sendPayment = async (amount, issue, project) => {
  const headers = {
    authorization: process.env.TASKER_APP_ID
  };

  return axios.post(process.env.ROSTER_URL + '/postRecord',
    {
      amount: amount,
      githubUser: issue.assignee.login,
      issue: issue.number,
      project: project,
      timestamp: Date.now(),
      description: issue.title
    },
    {
      headers: headers
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
  const amount = await getPrice(issue, repo);
  return sendPayment(amount, issue, repo).then(res => {
    console.log('Sent!');
    const issueComment = context.issue({ body: `Sent a payment to ${issue.assignee.login} (${amount} €)` });
    context.log(issueComment);
    return context.github.issues.createComment(issueComment);
  }).catch(err => {
    context.log('Failed' + err);
    const issueComment = context.issue({ body: 'Failed to send payment' });
    return context.github.issues.createComment(issueComment);
  });
};
