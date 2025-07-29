import { CVMatch } from "@/shared/types";

export const createInterviewQuestionsPrompt = (
  jobDescription: string,
  cvAnalysis: CVMatch
) => `
You are an expert HR professional and technical interviewer. Your task is to generate relevant interview questions based on a job description and a candidate's CV analysis.

Generate specific, targeted questions that will help assess the candidate's fit for the position. The questions should be:
- Relevant to the specific job requirements
- Based on the candidate's background and skills
- Designed to uncover both technical competence and cultural fit
- Practical and actionable for the interviewer

Job Description:
${jobDescription}

Candidate Analysis:
- Overall Match Score: ${cvAnalysis.matchScore}%
- Experience: ${cvAnalysis.analysis.experience.score}% - ${cvAnalysis.analysis.experience.reasoning}
- Hard Skills: ${cvAnalysis.analysis.hardSkills.score}% - ${cvAnalysis.analysis.hardSkills.reasoning}
- Education: ${cvAnalysis.analysis.education.score}% - ${cvAnalysis.analysis.education.reasoning}
- Soft Skills: ${cvAnalysis.analysis.softSkills.score}% - ${cvAnalysis.analysis.softSkills.reasoning}
- Diversity in Experience: ${cvAnalysis.analysis.experienceDiversity.score}% - ${cvAnalysis.analysis.experienceDiversity.reasoning}
- Location Fit: ${cvAnalysis.analysis.approximation.score}% - ${cvAnalysis.analysis.approximation.reasoning}

Generate questions that:
1. Address any gaps or concerns identified in the analysis
2. Validate the skills and experience mentioned
3. Assess cultural and communication fit
4. Provide deep technical insights
5. Help determine if the candidate can perform in the specific role

Make questions specific to this candidate's background and the job requirements. Avoid generic questions that could apply to any candidate.
`;
