import { runDeepSearchAgent } from "../agent/deepSearchAgent.js";

export const deepSearchService = async (query) => {
  try {
    const result = await runDeepSearchAgent(query);
    return result;
  } catch (error) {
    throw error;
  }
};