const getDiff = require('./diff');
const parseDiff = require('parse-diff');
const processFile = require('./processFile');

module.exports = async context => {
  context.log('Push event received!');
  context.log(context.payload.ref);
  if (context.payload.ref !== 'refs/heads/master') {
    context.log('Push event was not for master branch');
    return;
  }

  const diff = await getDiff(context);
  context.log(diff);

  const files = parseDiff(diff);

  // Process all the files
  await Promise.all(files.map(processFile));
};
