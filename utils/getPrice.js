const fetchProject = require('./fetchProject');

const issuePrice = (labels, project) => {
  let price = 0;
  console.log(project)
  labels.forEach(label => {
    if (project[label.name]) { price = project[label.name]; }
  });
  return price;
};
module.exports = async (issue, repo) => {
  return fetchProject(repo).then(res => {
    const price = issuePrice(issue.labels, res.data);
    return new Promise(resolve => {
      resolve(price);
    }).catch(err => {
      console.log(err);
      return new Promise(resolve => {
        resolve(0);
      });
    });
  });
};
