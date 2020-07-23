const isDuplicate = async (title, context) => {
  const search = await context.github.search.issuesAndPullRequests({
    q: `${title} in:title repo:${context.payload.repository.full_name}`,
    per_page: 100
  });

  if (search.data.total_count !== 0) {
    return true;
  }

  return false;
};

const createIssue = async (title, context) => {
  const dublicate = await isDuplicate(title, context);
  if (dublicate) {
    context.log('Issue with "' + title + '" exists. Prefixing the title');
    title = 'RENAME THIS: ' + title;
  }

  context.log('Trying to create issue ' + title);
  // TODO: Fetch ProjectMaster as assignee from Roster
  const assignee = 'mkurkela';
  const author = context.payload.sender.name;
  const authorUrl = context.payload.sender.url;
  const parent = context.payload.head_commit ? context.payload.head_commit.id : null;
  const parentUrl = context.payload.head_commit ? context.payload.head_commit.url : null;
  const body = `Task generated from TODO flag\n
  Parent: [${parent}](${parentUrl})\n
  Author: [${author}](${authorUrl})`;
  return context.github.issues.create(context.repo({
    title: title,
    body: body,
    assignee: assignee
  }));
};

const processChange = async (change, context) => {
  if (!change || change.type !== 'add') return;

  const regex = new RegExp('.*TODO\\b\\s?:?(?<title>.*)');
  const match = regex.exec(change.content);
  if (!match || !match.groups.title) return;

  var title = match.groups.title.trim();

  return createIssue(title, context);
};

const processChunk = async (chunk, context) => {
  if (!chunk) return;

  // Process all the changes in the chunk
  await Promise.all(chunk.changes.map(async (change, index) => {
    return processChange(change, context);
  }));
};

module.exports = async (file, context) => {
  if (!file) return;

  // Process all the chunks in the file
  await Promise.all(file.chunks.map(async chunk => {
    return processChunk(chunk, context);
  }));
};
