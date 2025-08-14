"use server";

import { GmailBotResponse } from "@/features/llm-analyzer/types";
import { Redis } from "@upstash/redis";
import { getCurrentUserEmail } from "@/features/authentication/authService";

const redis = Redis.fromEnv();

// Cache keys with user-specific prefixes
const getGmailBotResponsesKey = (userId: string) =>
  `email_automation_responses:${userId}`;

// 24 hours in seconds
const CACHE_EXPIRE_SECONDS = 24 * 60 * 60;

/**
 * Appends new Gmail bot responses to existing cached responses.
 * This function retrieves existing responses, appends new ones, and caches the combined result.
 * @param {GmailBotResponse[]} newResults - New responses to append
 * @returns {Promise<void>}
 */
export async function cacheGmailBotResponses(
  newResults: GmailBotResponse[]
): Promise<void> {
  try {
    const userId = await getCurrentUserEmail();
    const key = getGmailBotResponsesKey(userId);
    
    // Get existing responses
    const existingResults = await redis.get<GmailBotResponse[]>(key) || [];
    
    // Append new results to existing ones
    const allResults = [...existingResults, ...newResults];
    
    // Keep only the latest 100 responses to prevent unlimited growth
    const limitedResults = allResults.slice(-100);
    
    // Cache the combined results
    await redis.set(key, limitedResults, { ex: CACHE_EXPIRE_SECONDS });
    
  } catch (error) {
    console.error("Error caching Gmail bot responses:", error);
    throw new Error(`Failed to cache Gmail bot responses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves all cached Gmail bot responses for the current user.
 * @returns {Promise<GmailBotResponse[]>} Array of all cached responses
 */
export async function getGmailBotResponses(): Promise<GmailBotResponse[]> {
  try {
    const userId = await getCurrentUserEmail();
    const key = getGmailBotResponsesKey(userId);
    const results = await redis.get<GmailBotResponse[]>(key);
    return results ?? [];
  } catch (error) {
    console.error("Error retrieving Gmail bot responses:", error);
    return [];
  }
}

/**
 * Clears all cached Gmail bot responses for the current user.
 * @returns {Promise<void>}
 */
export async function clearGmailBotResponses(): Promise<void> {
  try {
    const userId = await getCurrentUserEmail();
    const key = getGmailBotResponsesKey(userId);
    await redis.del(key);
  } catch (error) {
    console.error("Error clearing Gmail bot responses:", error);
    throw new Error(`Failed to clear Gmail bot responses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
