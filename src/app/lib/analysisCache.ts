'use server'

import { CVMatch } from "@/app/lib/ai/types";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Cache keys
const FORM_STATE_KEY = 'form_state';

interface FormState {
    jobDescription: string;
    topCount: number;
    results: Array<CVMatch & { cacheId: string }>;
}

export async function cacheAnalysis(data: CVMatch): Promise<string> {
    const id = crypto.randomUUID();
    await redis.set(id, data, { ex: 600 }); 
    return id;
}

export async function getAnalysisFromCache(id: string): Promise<CVMatch | null> {
    return await redis.get<CVMatch>(id);
}

export async function cacheFormState(state: FormState): Promise<void> {
    await redis.set(FORM_STATE_KEY, state, { ex: 3600 }); // Cache for 1 hour
}

export async function getFormState(): Promise<FormState | null> {
    return await redis.get<FormState>(FORM_STATE_KEY);
}

export async function clearFormState(): Promise<void> {
    await redis.del(FORM_STATE_KEY);
}