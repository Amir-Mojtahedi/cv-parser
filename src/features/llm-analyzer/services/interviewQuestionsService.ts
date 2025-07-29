"use server";

import { generateInterviewQuestions } from "@/features/llm-analyzer/utils";
import { CVMatch } from "@/shared/types";
import { InterviewQuestionsData } from "@/features/llm-analyzer/types";
import { 
  getInterviewQuestionsFromCache, 
  cacheInterviewQuestions 
} from "@/features/database/redis/redisService";

/**
 * Server action to generate or retrieve interview questions based on job description and CV analysis.
 * @param {string} jobDescription - The job description text.
 * @param {CVMatch} cvAnalysis - The CV analysis results.
 * @param {string} analysisId - The analysis ID for caching.
 * @returns {Promise<InterviewQuestionsData | null>} A promise that resolves to interview questions or null if failed.
 */
export async function getInterviewQuestions(
  jobDescription: string,
  cvAnalysis: CVMatch,
  analysisId: string
): Promise<InterviewQuestionsData | null> {
  try {
    // First, check if questions are already cached
    const cachedQuestions = await getInterviewQuestionsFromCache(analysisId);
    if (cachedQuestions) {
      return cachedQuestions;
    }

    // If not cached, generate new questions
    const questions = await generateInterviewQuestions(jobDescription, cvAnalysis);
    
    if (questions) {
      // Cache the generated questions for future use
      await cacheInterviewQuestions(analysisId, questions);
    }
    
    return questions;
  } catch (error) {
    console.error("Error in getInterviewQuestions:", error);
    return null;
  }
} 