const sendPayment = require('../utils/sendPayment');
const nock = require('nock');

describe('sendPayment', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('Calls roster postRecord with amount, issue, project and action type', async () => {
    const payload = {
      amount: 49,
      githubUser: 'octocat',
      issue: 1,
      action: 'closed',
      project: 'testing-things',
      description: 'Something done'
    };
    nock(process.env.ROSTER_URL, {
      reqHeaders: {
        Authorization: headerValue => headerValue.includes('')
      }
    }).post('/postRecord', body => {
      console.log(body);
      expect(body.amount).toBe(payload.amount);
      expect(body.githubUser).toBe(payload.githubUser);
      expect(body.issue).toBe(payload.issue);
      expect(body.project).toBe(payload.project);
      expect(body.timestamp).toBeTruthy();
      expect(body.action).toBe(payload.action);
      expect(body.description).toBe(payload.description);
      return true;
    }).reply(200);

    const event = require('./fixtures/issues.closed.json');
    await sendPayment(49, event.issue, 'testing-things', 'closed');
    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });
});
