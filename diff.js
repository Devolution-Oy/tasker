/**
 *
 * @param {import('probot').Context} context
 */
const getCommit = async context => {
  context.log('Trying to get diff');
  context.log(context.event);
  return context.github.repos.getCommit(context.repo({
    method: 'GET',
    ref: context.payload.head_commit.id,
    headers: { Accept: 'application/vnd.github.diff' }
  }));
};

module.exports = async context => {
  const commit = await getCommit(context);
  return commit.data;
};
