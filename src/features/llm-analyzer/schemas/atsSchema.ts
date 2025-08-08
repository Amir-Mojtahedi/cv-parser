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
        experience: {
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
        hardSkills: {
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
        education: {
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
        softSkills: {
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
        experienceDiversity: {
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
        approximation: {
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
        "experience",
        "hardSkills",
        "education",
        "softSkills",
        "experienceDiversity",
        "approximation",
      ],
      propertyOrdering: [
        "experience",
        "hardSkills",
        "education",
        "softSkills",
        "experienceDiversity",
        "approximation",
      ],
    },
  },
  required: ["fileName", "matchScore", "analysis"],
  propertyOrdering: ["fileName", "matchScore", "analysis"],
};

export const atsBatchAnalysisSchema = {
  type: Type.ARRAY,
  description: "An array of analysis results, one for each CV provided.",
  items: singleCvAnalysisSchema,
};
