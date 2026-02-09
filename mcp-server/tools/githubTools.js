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
    description:
      "List ALL repositories of the currently authenticated GitHub user. Do NOT ask for username. Always call this tool when user asks to list repos.",

    schema: z.object({}).optional(),

    handler: async () => {
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
    description:
      "Create a new PUBLIC GitHub repository for the authenticated user. Only the repository name is required. Always call this tool when the user asks to create a repo.",

    schema: z.object({
      name: z.string(),
      private: z.boolean().optional(),
    }),

    handler: async ({ name }) => {
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
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue description"),
    }),

    handler: async ({ repo, title, body }) => {
      return await createIssue(repo, title, body || "");
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
      repo: z.string().describe("Repository name"),
    }),

    handler: async ({ repo }) => {
      return await listIssues(repo);
    },
  },
];
