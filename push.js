const getDiff = require('./diff');

module.exports = async context => {
  context.log('Push event received!');
  context.log(context.payload.ref);
  if (context.payload.ref !== 'refs/heads/master') {
    context.log('Push event was not for master branch');
    return;
  }

  const diff = await getDiff(context);
  context.log(diff);
  // TODO: Create issues from todo flags
};