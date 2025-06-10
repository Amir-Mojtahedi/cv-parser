'use server'

import { CVMatch } from "@/app/lib/ai/types";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function cacheAnalysis(data: CVMatch): Promise<string> {
    const id = crypto.randomUUID();
    await redis.set(id, data, { ex: 600 }); 
    return id;
}

export async function getAnalysisFromCache(id: string): Promise<CVMatch | null> {
    return await redis.get<CVMatch>(id);
}