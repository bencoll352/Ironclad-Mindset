// Supabase Edge Function: supabase/functions/cornerman/index.ts
// Server-side endpoint for The Ironclad Cornerman using @google/genai.
// Keeps GEMINI_API_KEY strictly on the server (never exposed to browser bundles).

import { GoogleGenAI, Type } from 'npm:@google/genai@^3.3.0';

const ALLOWED_ACTIONS = [
  'START_CRAVING_RESET',
  'OPEN_HALT_WORKSHEET',
  'VIEW_LIFELINES',
  'OPEN_PLAYBOOK_1',
  'OPEN_PLAYBOOK_2',
  'OPEN_PLAYBOOK_3',
  'OPEN_PLAYBOOK_4',
  'OPEN_PLAYBOOK_5',
  'NONE',
] as const;

type CornermanActionType = (typeof ALLOWED_ACTIONS)[number];

interface ConversationTurn {
  role: 'user' | 'cornerman';
  text: string;
}

interface CornermanRequestPayload {
  messages: ConversationTurn[];
  streakDays?: number;
  mode?: 'chat' | 'fridge';
  fridgeIngredients?: string[];
  retrievedChunks?: {
    id: string;
    title: string;
    excerpt: string;
  }[];
}

// Simple in-memory sliding-window rate limiter per client IP (20 requests / 60 seconds)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(clientKey) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(clientKey, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(clientKey, timestamps);
  return false;
}

const WITHDRAWAL_PATTERNS =
  /\b(shaking|shakes|tremor|tremors|seizure|fitting|hallucinat|delirium|chest pain|heart racing uncontrollably|cold turkey from heavy|severe withdrawal|sweating and shaking)\b/i;

const URGENT_DISTRESS_PATTERNS =
  /\b(end my life|kill myself|suicid|want to die|can't go on living|self-harm|hurt myself|no point living|overdose)\b/i;

function checkFixedSafetyEscalation(text: string): {
  reply: string;
  sourceIds: string[];
  action: CornermanActionType;
  safetyTriggered: 'withdrawal' | 'distress';
} | null {
  if (URGENT_DISTRESS_PATTERNS.test(text)) {
    return {
      safetyTriggered: 'distress',
      reply:
        "I'm really glad you reached out right now, mate, and I want you to stay safe. Please speak to someone who can support you immediately:\n\n• Call Samaritans free on 116 123 (24 hours a day, every day)\n• Call CALM on 0800 58 58 58 (5pm to midnight)\n• Text SHOUT to 85258 for free 24/7 crisis text support\n• If you are in immediate physical danger, call 999 or go to your nearest A&E.\n\nPlease open Lifelines below to call or text with one tap.",
      sourceIds: [],
      action: 'VIEW_LIFELINES',
    };
  }

  if (WITHDRAWAL_PATTERNS.test(text)) {
    return {
      safetyTriggered: 'withdrawal',
      reply:
        "Please pause and take care with this, mate. Physical alcohol withdrawal symptoms—such as shaking, tremors, confusion, seizures, or chest pain—can be medically serious. Do not try to tough out severe withdrawal symptoms alone or stop suddenly without medical advice if you have been drinking heavily every day.\n\n• Call NHS 111 right now for urgent medical advice\n• Call 999 or go to A&E if you have chest pain, severe shaking, confusion, or fits\n• Speak to your GP for safe, medically supported reduction advice.\n\nUse Lifelines below for immediate one-tap UK numbers.",
      sourceIds: [],
      action: 'VIEW_LIFELINES',
    };
  }

  return null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please wait a moment before sending another message.',
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let body: CornermanRequestPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON request payload.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (
    !body ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    body.messages.length > 12
  ) {
    return new Response(
      JSON.stringify({
        error: 'Request must include a bounded messages array (1 to 12 turns).',
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const boundedMessages = body.messages.slice(-8).map((m) => ({
    role: m.role === 'cornerman' ? 'model' : 'user',
    text: String(m.text || '').slice(0, 1200).trim(),
  }));

  const latestUserTurn =
    [...boundedMessages].reverse().find((m) => m.role === 'user')?.text || '';

  if (!latestUserTurn) {
    return new Response(
      JSON.stringify({ error: 'Latest user message cannot be empty.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Reviewed, fixed escalation flow for possible withdrawal or urgent distress
  const safetyResponse = checkFixedSafetyEscalation(latestUserTurn);
  if (safetyResponse) {
    return new Response(JSON.stringify(safetyResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'GEMINI_API_KEY is not configured on the Supabase Edge Function.',
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const validSourceIds = new Set(
    (body.retrievedChunks || []).map((chunk) => chunk.id)
  );
  const ragBlock =
    body.retrievedChunks && body.retrievedChunks.length > 0
      ? body.retrievedChunks
          .map((c) => `[ID: ${c.id}] ${c.title}\n${c.excerpt}`)
          .join('\n\n')
      : 'No matching playbook or recipe sections retrieved.';

  const systemInstruction = `You are "The Ironclad Cornerman", a grounded, warm, practical recovery companion and British head chef.
Write in plain UK English. Keep your tone calm, direct, and supportive.
Rules:
1. Acknowledge what the user has just said (including short follow-ups like "I'm already outside" using the conversation context).
2. Suggest ONE clear, practical next step they can do right now.
3. Offer the single most helpful built-in tool action from the allowed list (START_CRAVING_RESET, OPEN_HALT_WORKSHEET, VIEW_LIFELINES, OPEN_PLAYBOOK_1..5, or NONE).
4. NEVER invent neurochemical recovery timelines, medical diagnoses, or personalised detox instructions.
5. Only cite sourceIds from the provided RAG Context below when they genuinely support your answer. If none apply, return an empty array [].

Retrieved Ironclad Sections:
${ragBlock}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: boundedMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      config: {
        systemInstruction,
        temperature: 0.4,
        abortSignal: controller.signal,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            sourceIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            action: {
              type: Type.STRING,
              enum: [...ALLOWED_ACTIONS],
            },
          },
          required: ['reply', 'sourceIds', 'action'],
        },
      },
    });

    clearTimeout(timeoutId);

    const parsed = JSON.parse(response.text || '{}');
    const validatedSourceIds = Array.isArray(parsed.sourceIds)
      ? parsed.sourceIds.filter((id: unknown) =>
          typeof id === 'string' && validSourceIds.has(id)
        )
      : [];
    const validatedAction: CornermanActionType = ALLOWED_ACTIONS.includes(
      parsed.action
    )
      ? parsed.action
      : 'NONE';

    return new Response(
      JSON.stringify({
        reply: String(parsed.reply || '').trim(),
        sourceIds: validatedSourceIds,
        action: validatedAction,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Cornerman AI provider timed out or was unavailable.',
        detail: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
