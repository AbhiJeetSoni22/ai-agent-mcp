import { createIssue, createRepo, listIssues, listRepos } from "./mcp-server/services/githubService.js";

const test = async () => {
  try {
    // console.log("Creating repo...");

    // const repo = await createRepo("new-repo-test-1");
    // console.log("Created:", repo);

    // console.log("\nListing repos...");

    // const repos = await listRepos();
    // console.log(
    //   repos.map((r) => r.name)
    // );

    console.log('listing issue')
    const issue = await createIssue('AbhiJeetSoni22',"new-rep-1122","new isue")
    console.log('issue',issue)
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
  }
};

test();
