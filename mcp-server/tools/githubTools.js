import { z } from "zod";

import {
  listRepos,
  createRepo,
  createIssue,
  listIssues,
} from "../services/githubService.js";

/*
=====================================
GITHUB MCP TOOLS
=====================================
*/

export const githubTools = [
  /*
  =========================
  List Repositories
  =========================
  */
  {
    name: "list_repos",
    description: "Get all GitHub repositories of the authenticated user",
    schema: z.object({}),

    execute: async () => {
      return await listRepos();
    },
  },

  /*
  =========================
  Create Repository
  =========================
  */
  {
    name: "create_repo",
    description: "Create a new GitHub repository",
    schema: z.object({
      name: z.string().describe("Name of the repository"),
    }),

    execute: async ({ name }) => {
      return await createRepo(name);
    },
  },

  /*
  =========================
  Create Issue
  =========================
  */
  {
    name: "create_issue",
    description: "Create an issue in a repository",
    schema: z.object({
      owner: z.string().describe("Repository owner username"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue description"),
    }),

    execute: async ({ owner, repo, title, body }) => {
      return await createIssue(owner, repo, title, body || "");
    },
  },

  /*
  =========================
  List Issues
  =========================
  */
  {
    name: "list_issues",
    description: "List all issues of a repository",
    schema: z.object({
      owner: z.string().describe("Repository owner username"),
      repo: z.string().describe("Repository name"),
    }),

    execute: async ({ owner, repo }) => {
      return await listIssues(owner, repo);
    },
  },
];
