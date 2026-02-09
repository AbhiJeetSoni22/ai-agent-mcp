import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const BASE_URL = "https://api.github.com";

const github = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

/*
=====================================
GITHUB SERVICES
=====================================
*/

/*
📌 List Repositories
*/
export const listRepos = async () => {
  try {
    const res = await github.get("/user/repos");

    return {
      repos: res.data.map((repo) => ({
        name: repo.name,
      })),
    };
  } catch (err) {
    throw new Error("Failed to fetch repositories");
  }
};

/*
📌 Create Repository
*/
export const createRepo = async (name) => {
  try {
    const res = await github.post("/user/repos", {
      name,
      private: false,
    });

    return {
      name: res.data.name,
      url: res.data.html_url,
    };
  } catch (err) {
    console.error("GitHub API ERROR:", err.response?.data || err.message);
    throw err;
  }
};

/*
📌 Create Issue
*/
export const createIssue = async (repo, title, body) => {
  try {
    const user = await github.get("/user");
    const owner = user.data.login;
    const res = await github.post(`/repos/${owner}/${repo}/issues`, {
      title,
      body,
    });

    return {
      issue_number: res.data.number,
      url: res.data.html_url,
    };
  } catch (err) {
    throw new Error("Failed to create issue");
  }
};

/*
📌 List Issues
*/
export const listIssues = async (repo) => {
  try {
    const user = await github.get("/user");
    const owner = user.data.login;
    const res = await github.get(`/repos/${owner}/${repo}/issues`);

    return {
      issues: res.data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
      })),
    };
  } catch (err) {
    throw new Error("Failed to fetch issues");
  }
};
