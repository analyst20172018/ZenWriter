import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_SMART = 'gemini-3-pro-preview';

/**
 * Continues the text based on the current context.
 */
export const streamContinuation = async (
  currentText: string, 
  genre: string = 'general'
): Promise<any> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Take the last ~2000 characters to keep context relevant but save tokens
  const context = currentText.slice(-2000);

  const prompt = `
    You are an expert co-writer. The user is writing a text.
    Your task is to seamlessly continue the text from where it left off.
    Maintain the user's tone, style, and voice.
    Do not repeat the last sentence. 
    Just output the continuation text directly.
    
    Context:
    ${context}
    
    Continuation:
  `;

  return await ai.models.generateContentStream({
    model: MODEL_FAST,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature: 0.8, // Slightly creative
      maxOutputTokens: 300,
    }
  });
};

/**
 * Improves or rewrites a selected piece of text.
 */
export const improveSelection = async (selection: string, instruction: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are a professional editor.
    Improve the following text based on this instruction: "${instruction}".
    Return ONLY the improved text. Do not add conversational filler.
    
    Original Text:
    "${selection}"
  `;

  const response = await ai.models.generateContent({
    model: MODEL_SMART,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature: 0.3, // More deterministic for editing
    }
  });

  return response.text || selection;
};

/**
 * Provides synonyms or alternative phrasing.
 */
export const getAlternatives = async (wordOrPhrase: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    Provide 5 distinct synonyms or short alternative phrases for: "${wordOrPhrase}".
  `;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse synonyms", e);
    return [];
  }
};