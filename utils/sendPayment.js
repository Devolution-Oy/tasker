const axios = require('axios');

module.exports = async (amount, issue, project) => {
  const headers = {
    authorization: process.env.TASKER_APP_ID
  };

  const payload = {
      amount: amount,
      githubUser: issue.assignee.login,
      issue: issue.number,
      project: project,
      timestamp: Date.now(),
      description: issue.title
    }
  console.log()
  return axios.post(process.env.ROSTER_URL + '/postRecord',
    payload,
    {
      headers: headers
    });
};