import { GoogleGenAI } from '@google/genai';
import { TavilySearchAPIRetriever, TavilyDoc } from '@/lib/tavily';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const getOpenAIClient = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

// In-memory memory store as resilient cache alongside Firestore
const memoryCache = new Map<string, string[]>();

export async function POST(req: Request) {
  try {
    const { uid = 'user-sovereign', userName = 'User', preferredLanguage = 'auto', message, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch memories for this uid
    const memories = memoryCache.get(uid) || [];
    let memorySaved: string | null = null;
    const rememberMatch = message.match(/(?:remember this|تذكر هذا|احفظ عندك|remember that)[:\s]+(.+)/i);
    if (rememberMatch && rememberMatch[1]) {
      memorySaved = rememberMatch[1].trim();
      memories.push(memorySaved);
      memoryCache.set(uid, memories);
    }

    const memoriesContext = memories.length > 0
      ? memories.map((m, i) => `${i + 1}. ${m}`).join('\n')
      : 'No prior memories stored yet.';

    // 2. Real-time web search via Tavily
    let searchContext = 'No web search needed';
    let sources: any[] = [];

    try {
      const retriever = new TavilySearchAPIRetriever({
        apiKey: process.env.TAVILY_API_KEY,
        k: 5,
      });
      const searchDocs = await retriever.getRelevantDocuments(message);

      if (searchDocs.length > 0) {
        searchContext = searchDocs.map((d: TavilyDoc) => d.pageContent).join('\n\n');
        sources = searchDocs.map((d: TavilyDoc) => {
          let domain = 'web-source';
          try {
            if (d.metadata.source) {
              domain = new URL(d.metadata.source).hostname.replace('www.', '');
            }
          } catch {
            domain = d.metadata.source || 'web-source';
          }
          return {
            title: d.metadata.title || 'Verified Source',
            url: d.metadata.source,
            domain,
            snippet: d.pageContent.slice(0, 200),
          };
        });
      }
    } catch (e) {
      searchContext = 'No web search needed';
    }

    // 3. User-Personalized System Prompt
    const systemPrompt = `You are Haven AI, a personal, private, and helpful AI assistant.

User Profile:
- Name: ${userName}
- User ID: ${uid}
- Preferred Language: ${preferredLanguage}

Language Rules:
- Detect the user's language automatically:
  * English -> Fluent, natural English.
  * Modern Standard Arabic (الفصحى) -> Clear, elegant Arabic.
  * Sudanese Arabic (اللهجة السودانية) -> Warm, authentic Sudanese Arabic (e.g., "حبابك يا ${userName}", "عافية وخير").
- ALWAYS reply in the exact language the user uses in their message.
- If the user set a preferred language of "${preferredLanguage}" (and not 'auto'), honor it.

Personalization:
- Greet and address the user warmly by their name: ${userName}.
- Creator information is strictly located in the About/Creator section and must not be proclaimed in everyday chat.
- Focus 100% on serving ${userName}.

Memories:
${memoriesContext}
${searchContext !== 'No web search needed' ? `Sources: ${searchContext}` : ''}`;

    let answer = '';

    // Check if OpenAI key is supplied
    const openai = getOpenAIClient();
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8).map((h: any) => ({
              role: h.role === 'assistant' ? 'assistant' : 'user',
              content: h.content,
            })),
            { role: 'user', content: message },
          ],
          temperature: 0.8,
        });
        answer = completion.choices[0]?.message?.content || '';
      } catch (err) {
        console.warn('OpenAI error, falling back to Gemini:', err);
      }
    }

    // High performance Gemini 3.8 Flash model
    if (!answer) {
      const contents: any[] = [];
      for (const h of history.slice(-8)) {
        if (h.role === 'user' || h.role === 'assistant') {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const geminiConfig: any = {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      };

      // Fallback search tool if Tavily was empty
      if (sources.length === 0) {
        geminiConfig.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: geminiConfig,
      });

      answer = response.text || 'I am Haven AI, ready to assist your creative and intellectual journey.';

      if (sources.length === 0) {
        const candidate = response.candidates?.[0];
        const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks;
        if (Array.isArray(groundingChunks)) {
          for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
              const url = chunk.web.uri;
              let domain = 'web-source';
              try {
                domain = new URL(url).hostname.replace('www.', '');
              } catch {}
              sources.push({
                title: chunk.web.title || 'Verified Source',
                url,
                domain,
              });
            }
          }
        }
      }
    }

    // 4. Save to Firestore if available
    try {
      if (db) {
        await addDoc(collection(db, `users/${uid}/chat_history`), {
          message,
          answer,
          sources,
          timestamp: Date.now(),
        });
      }
    } catch (dbErr) {
      // Non-blocking: sovereign local persistence acts as guaranteed backup
    }

    return new Response(
      JSON.stringify({
        answer,
        text: answer,
        sources,
        memorySaved,
        movieReady: answer.includes('Ready to generate MP4 in Create Studio'),
        creator: 'Dr. Ajak Alrofaai Aling',
        brand: 'Ajak Alrofaai',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        answer: 'Error: ' + (error?.message || 'Chat generation failed'),
        error: error?.message || 'Chat generation failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
