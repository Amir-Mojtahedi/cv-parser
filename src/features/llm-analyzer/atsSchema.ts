import { Type } from "@google/genai";

const singleCvAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    fileName: {
      type: Type.STRING,
      description:
        "The exact filename of the CV being analyzed, extracted from the '--- CV [fileName] ---' separator.",
    },
    matchScore: {
      type: Type.NUMBER,
      description:
        "The weighted final score out of 100 for the candidate's CV against the job description.",
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        Experience: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Experience.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief, precise analysis for Experience.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
        "Hard Skills": {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Hard Skills.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief, precise analysis for Hard Skills.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
        Education: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Education.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief, precise analysis for Education.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
        "Soft Skills": {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Soft Skills.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief, precise analysis for Soft Skills.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
        "Diversity in experience": {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Diversity in Experience.",
            },
            reasoning: {
              type: Type.STRING,
              description:
                "Brief, precise analysis for Diversity in Experience.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
        Approximation: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Score from 0 to 100 for Location Approximation.",
            },
            reasoning: {
              type: Type.STRING,
              description:
                "Brief, precise analysis for Location Approximation.",
            },
          },
          required: ["score", "reasoning"],
          propertyOrdering: ["score", "reasoning"],
        },
      },
      required: [
        "Experience",
        "Hard Skills",
        "Education",
        "Soft Skills",
        "Diversity in experience",
        "Approximation",
      ],
      propertyOrdering: [
        "Experience",
        "Hard Skills",
        "Education",
        "Soft Skills",
        "Diversity in experience",
        "Approximation",
      ],
    },
  },
  required: ['fileName', 'matchScore', 'analysis'],
  propertyOrdering: ['fileName', 'matchScore', 'analysis'],
};

// This is the NEW top-level schema for the BATCH response
export const atsBatchAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    cvAnalyses: {
      type: Type.ARRAY,
      description:
        "An array of analysis results, one for each CV provided in the prompt.",
      items: singleCvAnalysisSchema, // Each item in the array must follow the single CV schema
    },
  },
  required: ["cvAnalyses"],
};
