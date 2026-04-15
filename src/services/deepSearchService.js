

import { runLangChainAgent } from "../agent/langchainAgent.js";



export const deepSearchService = async (query) => {
  try {
    return await runLangChainAgent(query);
  } catch (error) {
    throw error;
  }
};