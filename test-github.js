import { listRepos } from "./mcp-server/services/githubService.js";

const test = async () => {
  const repos = await listRepos();
  console.log(repos);
};

test();
