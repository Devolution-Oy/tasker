const nock = require('nock');
// Requiring our app implementation
const myProbotApp = require('..');
const { Probot } = require('probot');
// Requiring our fixtures
const fs = require('fs');
const path = require('path');

describe('Labeled issue', () => {
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
    probot.load(myProbotApp);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Ready label', async () => {
    // Nock roster postRecord call
    nock(process.env.ROSTER_URL, {
      reqheaders: {
        Authorization: headerValue => headerValue.includes('')
      }
    }).post('/postRecord').reply(200, 'OK');

    // Nock roster getProject call
    const project = {
      contributors: ['tester'],
      budget: 10000,
      accepted: 10,
      testautomation: 50,
      bug: 50,
      name: 'tasker',
      question: 50,
      dev: 50,
      ux: 50,
      design: 50,
      documentation: 50,
      review: 30,
      github: true
    };
    nock(process.env.ROSTER_URL, {
      reqHeaders: {
        Authorization: headerValue => headerValue.includes('')
      }
    }).post('/getProject')
      .reply(200, project);
    // Test that a comment is posted
    const paid = { body: 'Sent a payment to octocat (10 €)' };
    nock('https://api.github.com')
      .post('/repos/tester/testing-things/issues/1/comments', req => {
        console.log(req);
        expect(req).toMatchObject(paid);
        return true;
      })
      .reply(200);

    const payload = require('./fixtures/issue.labeled.ready.json');
    await probot.receive({ name: 'issues', payload: payload });
    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });
  // TODO: Issue.labeled: Unit test for error cases
});
