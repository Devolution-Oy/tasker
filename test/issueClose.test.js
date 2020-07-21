const nock = require('nock');
// Requiring our app implementation
const myProbotApp = require('..');
const { Probot } = require('probot');
// Requiring our fixtures
const payloadRejected = require('./fixtures/issues.closed.withRejectLabel.json');
const payloadNoAssignee = require('./fixtures/issues.closed.withoutAssignee.json');
const payload = require('./fixtures/issues.closed.json');
const rejectLabel = { body: 'Issue had label rejected, therefore no payments done' };
const noAssignee = { body: 'Issue does not have assignee, therefore no payments done' };
const paid = { body: 'Sent a payment to octocat (50 €)' };
const failed = { body: 'Failed to send payment' };
const fs = require('fs');
const path = require('path');

describe('Closed issue', () => {
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

  test('Rejected issue does not get payment', async () => {
    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/tester/testing-things/issues/1/comments', (body) => {
        expect(body).toMatchObject(rejectLabel);
        return true;
      }).reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: payloadRejected });

    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });

  test('Not assigned issue does not get payment', async () => {
    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/tester/testing-things/issues/1/comments', (body) => {
        expect(body, body + ' != ' + noAssignee).toMatchObject(noAssignee);
        return true;
      }).reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: payloadNoAssignee });

    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });

  test('Payment is sent to assignee', async () => {
    nock(process.env.ROSTER_URL, {
      reqheaders: {
        Authorization: headerValue => headerValue.includes('')
      }
    }).post('/postRecord').reply(200, 'OK');

    const project = {
      contributors: ['tester'],
      budget: 10000,
      accepted: 10,
      testautomation: 50,
      bug: 50,
      name: 'testing-things',
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
    nock('https://api.github.com')
      .post('/repos/tester/testing-things/issues/1/comments', req => {
        expect(req).toMatchObject(paid);
        return true;
      })
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: payload }).then(res => {
      return expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
    }).catch(err => {
      console.log(err);
      expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
      return expect(false).toBeTruthy();
    });
  });

  test('Payment is sent fails', async () => {
    nock(process.env.ROSTER_URL)
      .post('/postRecord')
      .reply(500);

    const project = {
      contributors: ['tester'],
      budget: 10000,
      accepted: 10,
      testautomation: 50,
      bug: 50,
      name: 'testing-things',
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
    nock('https://api.github.com')
      .post('/repos/tester/testing-things/issues/1/comments', body => {
        expect(body).toMatchObject(failed);
        return true;
      }).reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: payload });

    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
