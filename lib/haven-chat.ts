import { GoogleGenAI } from '@google/genai';

// Initialize AI Studio GenAI client (built-in in AI Studio)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Direct lightweight chat function for Haven AI
 * Created by Dr. Ajak Alrofaai Aling, South Sudanese ICT Engineer
 */
export async function chatWithHaven(message: string, userName: string = 'User', language: string = 'auto'): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are Haven AI, a thoughtful, helpful, and private personal AI companion.
Current user name: ${userName}.
Preferred language: ${language}.
Detect the user's language automatically (English, Arabic, or Sudanese Arabic) and reply in the same language.
Address the user warmly by their name (${userName}).
User says: ${message}`,
    });

    return response.text || '';
  } catch (error: any) {
    console.error('chatWithHaven error:', error);
    return `حبابك يا ${userName} — أنا معك في Haven AI. تفضل بسؤالك.`;
  }
}

export default chatWithHaven;
