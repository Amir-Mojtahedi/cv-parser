"use server";

import { CVMatch } from "@/shared/types";
import { FormState } from "@/features/database/redis/types";
import { InterviewQuestionsData } from "@/features/llm-analyzer/types";
import { Redis } from "@upstash/redis";
import { requireUserId } from "@/features/authentication/utils";

const redis = Redis.fromEnv();

// Cache keys with user-specific prefixes
const getFormStateKey = (userId: string) => `form_state:${userId}`;
const getJobDescModeKey = (userId: string) => `job_desc_mode:${userId}`;
const getAnalysisKey = (userId: string, analysisId: string) =>
  `analysis:${userId}:${analysisId}`;
const getInterviewQuestionsKey = (userId: string, analysisId: string) =>
  `interview_questions:${userId}:${analysisId}`;

// 24 hours in seconds
const CACHE_EXPIRE_SECONDS = 24 * 60 * 60;

/**
 * Caches a single CV analysis result for the current user in Redis.
 * Generates a unique analysis ID, stores the data under a user-specific key,
 * and sets an expiration of 24 hours.
 * @param {CVMatch} data - The analysis result to cache.
 * @returns {Promise<string>} The generated analysis ID.
 */
export async function cacheAnalysis(data: CVMatch): Promise<string> {
  const userId = await requireUserId();
  const id = crypto.randomUUID();
  const key = getAnalysisKey(userId, id);
  await redis.set(key, data, { ex: CACHE_EXPIRE_SECONDS }); // 24 hours
  return id;
}

/**
 * Retrieves a cached CV analysis result for the current user by its analysis ID.
 * @param {string} id - The analysis ID to retrieve.
 * @returns {Promise<CVMatch | null>} The cached analysis result, or null if not found.
 */
export async function getAnalysisFromCache(
  id: string
): Promise<CVMatch | null> {
  const userId = await requireUserId();
  const key = getAnalysisKey(userId, id);
  return await redis.get<CVMatch>(key);
}

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
  const userId = await requireUserId();
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
  const userId = await requireUserId();
  const key = getInterviewQuestionsKey(userId, analysisId);
  return await redis.get<InterviewQuestionsData>(key);
}

/**
 * Caches the user's form state (including uploaded files, job description, etc.) in Redis.
 * The state is stored under a user-specific key and expires after 24 hours.
 * @param {FormState} state - The form state to cache.
 * @returns {Promise<void>}
 */
export async function cacheFormState(state: FormState): Promise<void> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  await redis.set(key, state, { ex: CACHE_EXPIRE_SECONDS }); // Cache for 24 hours
}

/**
 * Retrieves the cached form state for the current user.
 * @returns {Promise<FormState | null>} The cached form state, or null if not found.
 */
export async function getFormStateFromCache(): Promise<FormState | null> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  return await redis.get<FormState>(key);
}

export async function cacheJobDescMode(jobDescMode: "write" | "upload") {
  const userId = await requireUserId();
  const key = getJobDescModeKey(userId);
  await redis.set(key, jobDescMode, { ex: CACHE_EXPIRE_SECONDS }); // Cache for 24 hours
}

export async function getJobDescMode(): Promise<"write" | "upload" | null> {
  const userId = await requireUserId();
  const key = getJobDescModeKey(userId);
  return await redis.get<"write" | "upload">(key);
}

/**
 * Clears the cached form state for the current user.
 * @returns {Promise<void>}
 */
export async function clearFormStateCache(): Promise<void> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  await redis.del(key);
}

/**
 * Clears all cached data (form state and analysis results) for the current user.
 * @returns {Promise<void>}
 */
export async function clearUserCache(): Promise<void> {
  const userId = await requireUserId();
  const formKey = getFormStateKey(userId);
  const jobDescModeKey = getJobDescModeKey(userId);
  const analysisPattern = `analysis:${userId}:*`;
  const interviewQuestionsPattern = `interview_questions:${userId}:*`;

  // Get all analysis and interview questions keys for this user
  const analysisKeys = await redis.keys(analysisPattern);
  const interviewQuestionsKeys = await redis.keys(interviewQuestionsPattern);

  // Delete all keys
  const keysToDelete = [formKey, jobDescModeKey, ...analysisKeys, ...interviewQuestionsKeys];
  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}
