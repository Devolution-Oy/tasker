const nock = require('nock');
const fetchProject = require('../utils/fetchProject');

describe('FethcProject', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });
  it('Send http getProject request with repository name', async () => {
    nock(process.env.ROSTER_URL, {
      reqHeaders: {
        Authorization: headerValue => headerValue.includes('')
      }
    }).post('/getProject', req => {
      expect(req.project).toBe('project1');
      return true;
    }).reply(200);
    await fetchProject('project1');
    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });
});
