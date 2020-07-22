const fetchProject = require('./utils/fetchProject');
const sendPayment = require('./utils/sendPayment');

module.exports = async context => {
  context.log('issue labeled event received');

  // Only ready labels causes an action
  // TODO: Only open issues should cause accepted payment
  const label = context.payload.label;
  context.log(label);
  if (label.name !== 'ready') {
    context.log('Label was not ready (' + label.name + ')');
    return;
  }

  context.log('Getting repo');
  const repo = context.payload.repository.name;
  context.log(repo);
  context.log('Fetching project from roster');
  const project = await fetchProject(repo);
  context.log(project);
  const amount = project.data.accepted;
  const issue = context.payload.issue;
  context.log(amount);
  return sendPayment(amount, issue, repo).then(res => {
    context.log('Sent!');
    const issueComment = context.issue({ body: `Sent a payment to ${issue.assignee.login} (${amount} €)` });
    context.log(issueComment);
    return context.github.issues.createComment(issueComment);
  }).catch(err => {
    context.log('Failed' + err);
    const issueComment = context.issue({ body: 'Failed to send payment' });
    return context.github.issues.createComment(issueComment);
  });
};
