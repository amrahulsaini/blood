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
    
    // Add randomization to make each caption unique
    const randomSeed = Math.floor(Math.random() * 1000);
    const variations = [
      'passionate and deeply moved',
      'incredibly honored and excited',
      'thrilled beyond words',
      'genuinely grateful and inspired',
      'proud and committed'
    ];
    const selectedVariation = variations[randomSeed % variations.length];
    
    const prompt = `Write ONE powerful, inspiring, and impactful LinkedIn post (10-14 lines) from the perspective of ${donorName} who is ${selectedVariation} about joining @aashayein – The Life Saviours as a blood donor. 

CRITICAL REQUIREMENTS:
- Write ONLY ONE COMPLETE CAPTION - NO OPTIONS, NO VARIATIONS
- DO NOT write "Option 1", "Option 2" or multiple versions
- Write in FIRST PERSON (use "I", "my", "I'm")
- Express genuine excitement, pride, and gratitude for joining this noble cause
- Make it personal, heartfelt, emotional, and inspiring
- Emphasize the impact of saving lives and being part of this community
- MUST mention @aashayein (with @ symbol) in the post
- MUST include proper LinkedIn formatting with line breaks
- Make each caption UNIQUE and DIFFERENT - vary the opening, middle, and closing
- Use different phrases and expressions each time - DO NOT repeat common patterns

OUTPUT FORMAT: Write ONLY ONE single, complete LinkedIn post. Do NOT provide multiple options or alternatives.

MANDATORY THANKS SECTION (EXACT ORDER with correct pronouns):
At the end of the post, include these thanks in this EXACT ORDER with line breaks:

I'm deeply grateful to:
- Our Honorable Director Sir Arpit Agrawal, for his visionary leadership and constant guidance
- Shruti Mam, for her inspiring dedication and for motivating me to be part of this life-saving initiative
- Jatin Sir, for his continuous support and for encouraging me to make a difference

STRUCTURE:
1. Opening: Personal excitement and commitment (2-3 lines) - VARY THIS SECTION
   ADD A BLANK LINE AFTER OPENING

2. Middle: Impact and community (3-4 lines) - USE DIFFERENT PERSPECTIVES
   ADD A BLANK LINE AFTER MIDDLE SECTION

3. Gratitude section: Thanks to leaders (3-4 lines as shown above)
   ADD A BLANK LINE AFTER GRATITUDE SECTION

4. Closing: Call to action or inspiring message (1-2 lines) - CHANGE THE MESSAGE
   ADD A BLANK LINE BEFORE HASHTAGS

FORMATTING:
- Include 5-7 relevant emojis throughout the post
- Use proper paragraph breaks with blank lines between sections
- DO NOT write everything in one continuous paragraph
- Add line breaks (empty lines) to make it readable and structured
- End with 6-8 powerful hashtags on a new line
- ⚠️ MANDATORY: #NayiAashayeinNayiUdaan MUST BE THE FIRST HASHTAG - DO NOT SKIP THIS
- After #NayiAashayeinNayiUdaan, add other relevant hashtags (e.g., #BloodDonation #SaveLives #Aashayein #LifeSaver #BeTheChange #DonateBlood #HeroesInAction #CommunityService)
- IMPORTANT: Every caption MUST start hashtags with #NayiAashayeinNayiUdaan

VISUAL FORMAT EXAMPLE:
[Opening paragraph with 2-3 sentences]

[Middle paragraph with 3-4 sentences about impact]

I'm deeply grateful to:
- Director line
- Shruti Mam line
- Jatin Sir line

[Closing call to action]

#NayiAashayeinNayiUdaan #BloodDonation #SaveLives ...

Tone: grateful, passionate, inspirational, community-driven, powerful, and promising.
Output: Plain text with MULTIPLE LINE BREAKS between sections—no markdown asterisks, no quotes, no extra formatting marks.
CRITICAL: The hashtag section MUST begin with #NayiAashayeinNayiUdaan - this is NON-NEGOTIABLE.
IMPORTANT: Make this caption COMPLETELY DIFFERENT from previous ones - use fresh language, new metaphors, different sentence structures.`;


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
          temperature: 1.0, // Increased for more randomness
          topK: 60,
          topP: 0.98,
          maxOutputTokens: 800,
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
        // Return user-friendly error for quota issues
        return NextResponse.json(
          { error: 'AI model is at high quota. Please try again in a few moments.' },
          { status: 503 }
        );
      }
    }

    const data = await resp.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'AI model is at high quota. Please try again in a few moments.' }, { status: 503 });
    }

    return NextResponse.json({ caption: text.trim() }, { status: 200 });
  } catch (e) {
    console.error('Generate caption error', e);
    return NextResponse.json({ error: 'AI model is at high quota. Please try again in a few moments.' }, { status: 503 });
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
