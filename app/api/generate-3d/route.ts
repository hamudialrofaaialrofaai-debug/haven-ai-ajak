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
      prompt,
      engine = 'Luma Dream Machine',
      style = 'hyper-realistic',
      quality = '4K Spatial',
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required for 3D generation' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use Gemini to generate accurate 3D scene representation, materials, and procedural mesh configuration
    const promptInstructions = `You are a high-end 3D graphics engineer and spatial VFX director (working with ${engine}, Runway, and Kling AI pipelines).
User prompt: "${prompt}"
Generate a structured JSON specification for a 3D asset scene:
1. "title": Short evocative name
2. "concept": 2-sentence visual description
3. "palette": Array of 4 hex color strings matching the aesthetic
4. "geometryType": one of ["dodecahedron", "torus_knot", "faceted_gem", "icosahedron", "cylinder_cyber", "sphere_harmonic"]
5. "metalness": float 0.0 to 1.0
6. "roughness": float 0.0 to 1.0
7. "lighting": description of three-point studio lighting setup
8. "animation": description of rotation and particle shimmer
9. "polycount": formatted string like "48,200 Triangles"
10. "cameraFov": number like 45
11. "tags": 3 string tags`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptInstructions,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let spec: any = {};
    try {
      spec = JSON.parse(response.text || '{}');
    } catch {
      spec = {
        title: prompt.slice(0, 30),
        concept: `Spatial 3D synthesis based on "${prompt}"`,
        palette: ['#f59e0b', '#d97706', '#10b981', '#3b82f6'],
        geometryType: 'faceted_gem',
        metalness: 0.85,
        roughness: 0.2,
        lighting: 'Golden hour key light with emerald rim illumination',
        animation: 'Subtle planetary rotation with specular bloom',
        polycount: '54,000 Triangles',
        cameraFov: 45,
        tags: ['3D Asset', engine, style],
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: 'mesh-' + Date.now(),
        engine,
        style,
        quality,
        spec,
        createdAt: Date.now(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('3D Gen Error:', error);
    return new Response(JSON.stringify({ error: error?.message || '3D generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
