/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const request = require('request')

module.exports = app => {
  // Your code here

  const sendPayment = (amount, githubUser, issue, project, context) => {
    request.post('https://us-central1-roster-pr.cloudfunctions.net/postRecord', {
      json: {
        amount: amount,
        githubUser: githubUser,
        issue: issue,
        project: project,
        timestamp: '2020-05-12T22:33:00'
      }
    }, (error, res, body) => {
      if (error) {
        app.log(error)
        const issueComment = context.issue({ body: 'Failed to send payment' })
        return context.github.issues.createComment(issueComment)
      }
      const issueComment = context.issue({ body: `Sent payment to ${githubUser}` })
      return context.github.issues.createComment(issueComment)
    })

  }
  const checkLabelName = (labels, name) => {
    let ret = false
    labels.forEach(label => {
      app.log(label.name)
      if (label.name === name) {
        app.log("Setting the return value true")
        ret = true
      }
    })
    app.log("Returning " + ret)

    return ret
  }
  app.log('Yay, the app was loaded!')

  app.on('issues.closed', async context => {
    const issue = context.payload.issue
    if (checkLabelName(issue.labels, 'rejected')) {
      const issueComment = context.issue({ body: 'Issue had label rejected, therefore no payments done' })
      return context.github.issues.createComment(issueComment)
    }

    if (!issue.assignee) {
      const issueComment = context.issue({ body: 'Issue does not have assignee, therefore no payments done' })
      return context.github.issues.createComment(issueComment)
    }

    const repo = context.payload.repository.name
    return sendPayment(50, issue.assignee.login, issue.number, repo, context)
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
