import { createIssue, createRepo, listIssues, listRepos } from "./mcp-server/services/githubService.js";

const test = async () => {
  try {
 

    console.log('listing issue')
    const issue = await createIssue('AbhiJeetSoni22',"new-rep-1122","new isue")
    console.log('issue',issue)
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
  }
};

test();
