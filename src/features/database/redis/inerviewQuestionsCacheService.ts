"use server";

import { InterviewQuestionsData } from "@/features/llm-analyzer/types";
import { Redis } from "@upstash/redis";
import { getCurrentUserEmail } from "@/features/authentication/authService";

const redis = Redis.fromEnv();

// Cache keys with user-specific prefixes
const getInterviewQuestionsKey = (userId: string, analysisId: string) =>
  `interview_questions:${userId}:${analysisId}`;

// 24 hours in seconds
const CACHE_EXPIRE_SECONDS = 24 * 60 * 60;

/**
 * Caches interview questions for a specific analysis ID.
 * @param {string} analysisId - The analysis ID to associate the questions with.
 * @param {InterviewQuestionsData} questions - The interview questions to cache.
 * @returns {Promise<void>}
 */
export async function cacheInterviewQuestions(
  analysisId: string,
  questions: InterviewQuestionsData
): Promise<void> {
  const userId = await getCurrentUserEmail();
  const key = getInterviewQuestionsKey(userId, analysisId);
  await redis.set(key, questions, { ex: CACHE_EXPIRE_SECONDS }); // 24 hours
}

/**
 * Retrieves cached interview questions for a specific analysis ID.
 * @param {string} analysisId - The analysis ID to retrieve questions for.
 * @returns {Promise<InterviewQuestionsData | null>} The cached interview questions, or null if not found.
 */
export async function getInterviewQuestionsFromCache(
  analysisId: string
): Promise<InterviewQuestionsData | null> {
  const userId = await getCurrentUserEmail();
  const key = getInterviewQuestionsKey(userId, analysisId);
  return await redis.get<InterviewQuestionsData>(key);
}

/**
 * Clears all interview questions cached data for the current user.
 * @returns {Promise<void>}
 */
export async function clearInterviewQuestionsCache(): Promise<void> {
  const userId = await getCurrentUserEmail();
  const interviewQuestionsPattern = `interview_questions:${userId}:*`;

  // Get all interview questions keys for this user
  const interviewQuestionsKeys = await redis.keys(interviewQuestionsPattern);

  // Delete all keys
  if (interviewQuestionsKeys.length > 0) {
    await redis.del(...interviewQuestionsKeys);
  }
}
