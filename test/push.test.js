const nock = require('nock');
const fs = require('fs');
const path = require('path');
// Requiring our app implementation
const taskerApp = require('..');
const { Probot } = require('probot');
const pushEvent = require('./fixtures/push.json');

describe('Push event', () => {
  let probot;
  let mockCert;

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err);
      mockCert = cert;
      done();
    });
  });

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({ id: 123, cert: mockCert });
    // Load our app into probot
    probot.load(taskerApp);
  });

  test('Push events are handled', async () => {
    nock('https://api.github.com')
      .post('/app/installations/8783722/access_tokens')
      .reply(201, {
        token: 'test'
      });

    nock('https://api.github.com')
      .get('/repos/Devolution-Oy/tasker-issue-test/commits/7716bf0bd4044056d2ab6464d3ece46c3b49c6bb')
      .reply(200, (uri, requestBody) => {
        return Promise.resolve(
          fs.readFileSync(path.join(__dirname, 'fixtures', 'diffs', 'simple.txt'), 'utf8')
        );
      });

    nock('https://api.github.com')
      .get('/search/issues?q=Example%20todo%20flag%20in%3Atitle%20repo%3ADevolution-Oy%2Ftasker-issue-test&per_page=100')
      .reply(200, (uri, requestBody) => {
        return Promise.resolve({
          total_count: 0
        });
      });

    nock('https://api.github.com')
      .post('/repos/Devolution-Oy/tasker-issue-test/issues', body => {
        const parent = '7716bf0bd4044056d2ab6464d3ece46c3b49c6bb';
        const parentUrl = 'https://github.com/Devolution-Oy/tasker-issue-test/commit/7716bf0bd4044056d2ab6464d3ece46c3b49c6bb';
        const author = 'mkurkela';
        const authorUrl = 'https://api.github.com/users/mkurkela';

        const issueBody = `Task generated from TODO flag\nParent: [${parent}](${parentUrl})\nAuthor: [${author}](${authorUrl})`;
        expect(body).toMatchObject({
          title: 'Example todo flag',
          body: issueBody,
          assignee: 'mkurkela'
        });
        return true;
      })
      .reply(200);

    const event = { name: 'push', payload: pushEvent };
    await probot.receive(event);

    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });
});
