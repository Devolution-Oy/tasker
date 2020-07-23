const getAuthor = require('../utils/getAuthor');

describe('getAuthor', () => {
  it('Parses issue\'s author from issue body', async () => {
    const payload = require('./fixtures/issue.labeled.ready.json');
    const author = await getAuthor(payload.issue);
    expect(author).toBe('mkurkela');
  });
});
