const nock = require('nock');
const getPrice = require('../utils/getPrice');

describe('getPrice', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });
  it('Send http getProject request with repository name', async () => {
    const project = {
      contributors: ['tester'],
      budget: 10000,
      accepted: 10,
      testautomation: 50,
      bug: 50,
      name: 'project1',
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

    const labels = [
      { name: 'dev' },
      { name: 'foo' }];
    const price = await getPrice({ labels }, 'project1');
    expect(price).toBe(50);
    expect(nock.isDone(), 'Pending mocks: ' + nock.pendingMocks()).toBeTruthy();
  });
});
