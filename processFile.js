const findTODO = async changeContent => {
  const regex = new RegExp('.*TODO\\b\\s?:?(?<title>.*)', 'i');
  const match = regex.exec(changeContent);
  if (!match) return;
  return new Promise(resolve => {
    resolve(match.title.trim());
  });
};

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

const processChange = async (change, context) => {
  if (!change || change.type !== 'add') return;

  // Find TODOs
  context.log('change content: ' + change.content);
  findTODO(change.content).then(async title => {
    const dublicate = await isDuplicate(title, context);
    if (dublicate) {
      context.log('Isseu "' + title + '" exists. Prefixing the title');
      title = 'RENAME: ' + title;
    }

    const body = 'Example issue body';
    return context.github.issue.create(context.repo({
      title: title,
      body: body,
      assignee: 'mkurkela'
    }));
  });
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
