module.exports = issue => {
  const matcher = 'Author: \\[([^\\]]*)\\]';
  const match = issue.body.match(matcher);
  // TODO: Loop issue comments for Author if not found from body
  return match ? match[1] : '';
};
