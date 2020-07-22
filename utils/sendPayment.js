const axios = require('axios');

module.exports = async (amount, issue, project, action) => {
  const headers = {
    authorization: process.env.TASKER_APP_ID
  };

  console.log(issue);
  const payload = {
    amount: amount,
    githubUser: issue.assignee.login,
    issue: issue.number,
    action: action,
    project: project,
    timestamp: Date.now(),
    description: issue.title
  };
  console.log(payload);
  return axios.post(process.env.ROSTER_URL + '/postRecord',
    payload,
    {
      headers: headers
    });
};
