import { deepSearchService } from "../services/deepSearchService.js";

export const deepSearchController = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const result = await deepSearchService(query);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Deep Search Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Deep search failed",
    });
  }
};