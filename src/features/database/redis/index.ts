// Re-export functions from specialized services for backward compatibility
export {
  cacheAnalysis,
  getAnalysisFromCache,
  cacheFormState,
  getFormStateFromCache,
  cacheJobDescMode,
  getJobDescMode,
  clearFormStateCache,
  clearATSCache,
} from "./atsRedisService";

export {
  cacheInterviewQuestions,
  getInterviewQuestionsFromCache,
  clearInterviewQuestionsCache,
} from "./inerviewQuestionsRedisService";

export {
  cacheGmailBotResponses,
  getGmailBotResponses,
  clearGmailBotResponses,
} from "./gmailBotRedisService";

// General cache clearing function that coordinates across all services
import { clearATSCache } from "./atsRedisService";
import { clearInterviewQuestionsCache } from "./inerviewQuestionsRedisService";
import { clearGmailBotResponses } from "./gmailBotRedisService";

/**
 * Clears all cached data (form state, analysis results, and email automation) for the current user.
 * This function coordinates clearing across all specialized cache services.
 * @returns {Promise<void>}
 */
export async function clearUserCache(): Promise<void> {
  try {
    // Clear all specialized caches
    await Promise.all([
      clearATSCache(),
      clearInterviewQuestionsCache(),
      clearGmailBotResponses(),
    ]);
  } catch (error) {
    console.error("Error clearing user cache:", error);
    throw new Error(
      `Failed to clear user cache: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
