const axios = require('axios');

module.exports = async (project) => {
  const headers = {
    authorization: process.env.TASKER_APP_ID
  };
  return axios.post(process.env.ROSTER_URL + '/getProject',
    {
      project: project
    },
    {
      headers: headers
    });
};
