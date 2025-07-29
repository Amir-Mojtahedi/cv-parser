import { Type } from "@google/genai";

const interviewQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    hardSkillsQuestions: {
      type: Type.ARRAY,
      description: "Technical questions to validate hard skills mentioned in the CV",
      items: {
        type: Type.STRING,
        description: "A specific technical question related to hard skills"
      },
      minItems: 3,
      maxItems: 5
    },
    softSkillsQuestions: {
      type: Type.ARRAY,
      description: "Questions to assess soft skills and team collaboration abilities",
      items: {
        type: Type.STRING,
        description: "A behavioral or situational question related to soft skills"
      },
      minItems: 3,
      maxItems: 5
    },
    communicationQuestions: {
      type: Type.ARRAY,
      description: "Questions about communication, language skills, and cultural fit",
      items: {
        type: Type.STRING,
        description: "A question about communication style, language proficiency, or cultural adaptation"
      },
      minItems: 2,
      maxItems: 4
    },
    technicalDeepDiveQuestions: {
      type: Type.ARRAY,
      description: "Advanced technical questions to dive deeper into the candidate's expertise",
      items: {
        type: Type.STRING,
        description: "A detailed technical question that requires deep knowledge"
      },
      minItems: 2,
      maxItems: 4
    },
    interviewTips: {
      type: Type.ARRAY,
      description: "Additional tips for conducting the interview effectively",
      items: {
        type: Type.STRING,
        description: "A specific tip for the interviewer"
      },
      minItems: 3,
      maxItems: 5
    }
  },
  required: [
    "hardSkillsQuestions",
    "softSkillsQuestions", 
    "communicationQuestions",
    "technicalDeepDiveQuestions",
    "interviewTips"
  ]
};

export { interviewQuestionsSchema }; 