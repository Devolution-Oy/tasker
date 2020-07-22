const fetchProject = require('./utils/fetchProject');
const sendPayment = require('./utils/sendPayment');

module.exports = async context => {
  console.log('issue labeled event received');
  const issue = context.payload.issue;

  // Only ready labels causes an action
  // TODO: Only open issues should cause accepted payment
  const label = context.payload.label;
  if (label.name !== 'ready')
    return;

  const repo = context.payload.repository.name;
  const project = await fetchProject(issue, repo);
  const amount = project.data.accepted;
  console.log(amount);
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