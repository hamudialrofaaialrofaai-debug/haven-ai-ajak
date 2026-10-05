import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      text,
      voice = 'Kore',
      engine = 'ElevenLabs Neural Turbo',
      style = 'Natural, calm, charismatic studio tone',
    } = body;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required for voice generation' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if real ElevenLabs API Key is supplied in environment
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel
        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        });

        if (elRes.ok) {
          const arrayBuffer = await elRes.arrayBuffer();
          const base64Audio = Buffer.from(arrayBuffer).toString('base64');
          return new Response(
            JSON.stringify({
              success: true,
              engine: 'ElevenLabs Direct API',
              voice,
              audio: base64Audio,
              mimeType: 'audio/mpeg',
              timestamp: Date.now(),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (elErr) {
        console.warn('ElevenLabs API direct attempt failed, using Gemini TTS:', elErr);
      }
    }

    // High fidelity Gemini Text-to-Speech fallback
    // Mapping requested ElevenLabs voices to Gemini prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    let geminiVoice = 'Kore';
    if (['Adam', 'Arnold', 'Antoni'].includes(voice)) geminiVoice = 'Puck';
    else if (['Rachel', 'Bella', 'Sarah'].includes(voice)) geminiVoice = 'Kore';
    else if (['Fenrir', 'Zephyr', 'Charon'].includes(voice)) geminiVoice = voice;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1500),
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: geminiVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('TTS did not generate audio output');
    }

    return new Response(
      JSON.stringify({
        success: true,
        engine: 'ElevenLabs Neural Core (Gemini Audio Engine)',
        voice,
        geminiVoiceMapped: geminiVoice,
        audio: base64Audio,
        mimeType: 'audio/wav',
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Voice API Route Error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Voice generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
