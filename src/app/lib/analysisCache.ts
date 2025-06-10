import { CVMatch } from "@/app/lib/ai/types";

// This is a simple in-memory cache.
// In production, use Vercel KV, Redis, or another persistent solution.
const analysisCache = new Map<string, CVMatch>();

export function cacheAnalysis(data: CVMatch): string {
    const id = crypto.randomUUID(); // Generate a unique ID
    analysisCache.set(id, data);
    return id;
}

export function getAnalysisFromCache(id: string): CVMatch | undefined {
    return analysisCache.get(id);
}