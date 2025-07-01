"use server";

import { CVMatch } from "@/app/lib/ai/types";
import { Redis } from "@upstash/redis";
import { requireUserId } from "@/app/lib/auth/getCurrentUser";
import SerializableFile from "@/app/types/serializableFile";

const redis = Redis.fromEnv();

// Cache keys with user-specific prefixes
const getFormStateKey = (userId: string) => `form_state:${userId}`;
const getAnalysisKey = (userId: string, analysisId: string) =>
  `analysis:${userId}:${analysisId}`;

interface FormState {
  serializedCVFiles?: SerializableFile[];
  serializedJobDescriptionFile?: SerializableFile;
  jobDescription?: string;
  topCount?: number;
  results?: Array<CVMatch & { cacheId: string }>;
}

export async function cacheAnalysis(data: CVMatch): Promise<string> {
  const userId = await requireUserId();
  const id = crypto.randomUUID();
  const key = getAnalysisKey(userId, id);
  await redis.set(key, data, { ex: 600 }); // 10 minutes
  return id;
}

export async function getAnalysisFromCache(
  id: string
): Promise<CVMatch | null> {
  const userId = await requireUserId();
  const key = getAnalysisKey(userId, id);
  return await redis.get<CVMatch>(key);
}

export async function cacheFormState(state: FormState): Promise<void> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  await redis.set(key, state, { ex: 3600 }); // Cache for 1 hour
}

export async function getFormStateFromCache(): Promise<FormState | null> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  return await redis.get<FormState>(key);
}

export async function clearFormStateCache(): Promise<void> {
  const userId = await requireUserId();
  const key = getFormStateKey(userId);
  await redis.del(key);
}

// Get all analysis IDs for the current user
export async function getUserAnalysisIds(): Promise<string[]> {
  const userId = await requireUserId();
  const pattern = `analysis:${userId}:*`;
  const keys = await redis.keys(pattern);
  return keys.map((key) => key.split(":")[2]); // Extract the analysis ID
}

// Clear all cached data for the current user
export async function clearUserCache(): Promise<void> {
  const userId = await requireUserId();
  const formKey = getFormStateKey(userId);
  const analysisPattern = `analysis:${userId}:*`;

  // Get all analysis keys for this user
  const analysisKeys = await redis.keys(analysisPattern);

  // Delete all keys
  const keysToDelete = [formKey, ...analysisKeys];
  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}
