import { NextRequest, NextResponse } from 'next/server';

// Uses Google Gemini API. Set GEMINI_API_KEY in your environment.
// We'll try GEMINI_MODEL if provided, else attempt gemini-2.0-flash and fall back to gemini-1.5-flash.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';
const EXTRA_FALLBACKS = ['gemini-1.5-flash-8b'];
const API_BASE = `https://generativelanguage.googleapis.com/v1beta/models`;

function getApiKeyAndSource() {
  const keyPreferred = process.env.AASHAYEIN_GEMINI_API_KEY?.trim();
  if (keyPreferred) return { key: keyPreferred, source: 'AASHAYEIN_GEMINI_API_KEY' };
  const keyDefault = process.env.GEMINI_API_KEY?.trim();
  if (keyDefault) return { key: keyDefault, source: 'GEMINI_API_KEY' };
  return { key: '', source: 'none' };
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json().catch(() => ({ name: '' }));
    const { key: apiKey } = getApiKeyAndSource();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY on server.' },
        { status: 500 }
      );
    }

    const donorName = (name || 'a blood donor').toString().slice(0, 120);
    const prompt = `Write an enthusiastic LinkedIn post (4-6 lines) from the perspective of ${donorName} who is personally excited and grateful about joining Aashayein – The Life Saviours as a blood donor. Write in FIRST PERSON (use "I", "my", "I'm"). Express genuine excitement and gratitude for joining this noble cause. Emphasize how proud and honored the person is to be part of this life-saving community. Make it personal, heartfelt, and inspiring. Include 3-4 relevant emojis and 4-6 impactful hashtags (e.g., #BloodDonation #SaveLives #Aashayein #LifeSaver #BeTheChange #DonateBlood). Tone: grateful, excited, inspirational, community-driven. Output plain text only—no markdown, no quotes.`;

    async function callModel(model: string) {
      const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
      return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 400,
        },
        }),
      });
    }

    let resp = await callModel(PRIMARY_MODEL);
    if (!resp.ok) {
      const errors: Record<string, string> = {};
      errors[PRIMARY_MODEL] = await resp.text();
      // Try fallbacks in order
      const candidates = [FALLBACK_MODEL, ...EXTRA_FALLBACKS];
      let succeeded = false;
      for (const model of candidates) {
        try {
          const r = await callModel(model);
          if (r.ok) {
            resp = r;
            succeeded = true;
            break;
          } else {
            errors[model] = await r.text();
          }
        } catch (e: any) {
          errors[model] = String(e?.message || e);
        }
      }
      if (!succeeded) {
        console.error('Caption API failed', errors);
        // Return error - no fallback, force AI generation
        return NextResponse.json(
          { error: 'AI caption generation failed. Please try again.', details: errors },
          { status: 500 }
        );
      }
    }

    const data = await resp.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'AI generated empty caption. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ caption: text.trim() }, { status: 200 });
  } catch (e) {
    console.error('Generate caption error', e);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

// Lightweight diagnostics endpoint to quickly verify server env/config
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const test = url.searchParams.get('test');
  const name = url.searchParams.get('name') || '';

  // If test mode is requested, try generating with optional name via GET for quick verification
  if (test === '1') {
    try {
      const { key: apiKey } = getApiKeyAndSource();
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Missing GEMINI_API_KEY on server.' },
          { status: 500 }
        );
      }

      const donorName = (name || 'our newest donor').toString().slice(0, 120);
      const prompt = `Write a concise LinkedIn caption (2–3 lines) celebrating ${donorName}'s registration as a blood donor with Aashayein – The Life Saviours. Tone: warm, proud, community-first. Include 1–2 appropriate emojis and 2–4 short hashtags (e.g., #BloodDonation #SaveLives). Output plain text only—no markdown, no quotes.`;

      async function callModel(model: string) {
        const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 200,
            },
          }),
        });
      }

      let resp = await callModel(PRIMARY_MODEL);
      if (!resp.ok) {
        const errors: Record<string, string> = {};
        errors[PRIMARY_MODEL] = await resp.text();
        const candidates = [FALLBACK_MODEL, ...EXTRA_FALLBACKS];
        let succeeded = false;
        for (const model of candidates) {
          try {
            const r = await callModel(model);
            if (r.ok) {
              resp = r;
              succeeded = true;
              break;
            } else {
              errors[model] = await r.text();
            }
          } catch (e: any) {
            errors[model] = String(e?.message || e);
          }
        }
        if (!succeeded) {
          console.error('Caption API test failed', errors);
          const donorName = (name || 'our newest donor').toString().slice(0, 120);
          const fallbackCaption = `Honored to welcome ${donorName} as a registered blood donor with Aashayein – The Life Saviours. Your commitment can save lives. ❤️ #BloodDonation #SaveLives`;
          return NextResponse.json(
            { caption: fallbackCaption, ai: false, note: 'Returned local fallback due to model errors', details: errors },
            { status: 200 }
          );
        }
      }

      const data = await resp.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Proud to welcome a new lifesaver to Aashayein – The Life Saviours. #BloodDonation #SaveLives';
      return NextResponse.json({ caption: text.trim(), mode: 'test' }, { status: 200 });
    } catch (e) {
      console.error('Generate caption GET test error', e);
      return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
  }

  // Default diagnostics
  const { key, source } = getApiKeyAndSource();
  const maskedKey = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : null;
  return NextResponse.json(
    {
      ok: true,
      hasApiKey: Boolean(key),
      maskedKey,
      keySource: source,
      primaryModel: PRIMARY_MODEL,
      fallbackModel: FALLBACK_MODEL,
      apiBase: API_BASE,
    },
    { status: 200 }
  );
}
