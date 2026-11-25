import { PLAYBOOKS, RECIPES } from '../data/ironcladData';

export const ALLOWED_CORNERMAN_ACTIONS = [
  'START_CRAVING_RESET',
  'OPEN_HALT_WORKSHEET',
  'VIEW_LIFELINES',
  'OPEN_PLAYBOOK_1',
  'OPEN_PLAYBOOK_2',
  'OPEN_PLAYBOOK_3',
  'OPEN_PLAYBOOK_4',
  'OPEN_PLAYBOOK_5',
] as const;

export type CornermanActionId = (typeof ALLOWED_CORNERMAN_ACTIONS)[number];

export interface IndexedKnowledgeChunk {
  id: string; // e.g., 'playbook-3#section-0' or 'recipe-witching-hour-spritz'
  type: 'PlaybookSection' | 'Recipe';
  title: string;
  sectionHeading?: string;
  playbookId?: string;
  sectionIndex?: number;
  recipeId?: string;
  keywords: string[];
  excerpt: string;
}

export interface ValidatedCornermanCitation {
  id: string;
  type: 'PlaybookSection' | 'Recipe';
  title: string;
  sectionHeading?: string;
  playbookId?: string;
  sectionIndex?: number;
  recipeId?: string;
}

export interface StructuredCornermanResponse {
  reply: string;
  sourceIds: string[];
  citations: ValidatedCornermanCitation[];
  action?: CornermanActionId;
  providerStatus: 'live' | 'builtin_fallback' | 'safety_escalation' | 'offline';
  statusNotice?: string;
}

export interface ConversationTurnInput {
  role: 'user' | 'cornerman';
  text: string;
}

/**
 * Builds the section-level index over all 5 Ironclad Playbooks and 5 Recipes.
 */
export function buildSectionKnowledgeIndex(): Map<string, IndexedKnowledgeChunk> {
  const index = new Map<string, IndexedKnowledgeChunk>();

  for (const pb of PLAYBOOKS) {
    pb.sections.forEach((sec, idx) => {
      const id = `${pb.id}#section-${idx}`;
      const combinedText = `${pb.title} ${sec.heading} ${sec.body.join(' ')} ${(
        sec.actionPoints || []
      ).join(' ')}`;
      const keywords = Array.from(
        new Set(
          combinedText
            .toLowerCase()
            .replace(/[^a-z0-9£.\s-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 4)
        )
      );

      index.set(id, {
        id,
        type: 'PlaybookSection',
        title: `Playbook ${pb.number}: ${pb.title}`,
        sectionHeading: sec.heading,
        playbookId: pb.id,
        sectionIndex: idx,
        keywords,
        excerpt: `${sec.heading}: ${sec.body[0] || ''}`,
      });
    });
  }

  for (const rec of RECIPES) {
    const id = rec.id;
    const combinedText = `${rec.title} ${rec.subtitle} ${rec.brainBenefitTitle} ${rec.brainBenefitDetail} ${rec.ingredients
      .map((i) => i.name)
      .join(' ')}`;
    const keywords = Array.from(
      new Set(
        combinedText
          .toLowerCase()
          .replace(/[^a-z0-9£.\s-]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 4)
      )
    );

    index.set(id, {
      id,
      type: 'Recipe',
      title: `Recipe: ${rec.title}`,
      sectionHeading: `${rec.prepTimeMins} mins • £${rec.costPerServingGBP.toFixed(2)}`,
      recipeId: rec.id,
      keywords,
      excerpt: `${rec.subtitle} (${rec.brainBenefitTitle})`,
    });
  }

  return index;
}

export const KNOWLEDGE_INDEX = buildSectionKnowledgeIndex();

/**
 * Validates a list of candidate source IDs against the section index and returns rich citations.
 */
export function validateSourceIds(
  candidateIds: unknown
): ValidatedCornermanCitation[] {
  if (!Array.isArray(candidateIds)) return [];
  const seen = new Set<string>();
  const validated: ValidatedCornermanCitation[] = [];

  for (const rawId of candidateIds) {
    if (typeof rawId === 'string' && !seen.has(rawId)) {
      const chunk = KNOWLEDGE_INDEX.get(rawId);
      if (chunk) {
        seen.add(rawId);
        validated.push({
          id: chunk.id,
          type: chunk.type,
          title: chunk.title,
          sectionHeading: chunk.sectionHeading,
          playbookId: chunk.playbookId,
          sectionIndex: chunk.sectionIndex,
          recipeId: chunk.recipeId,
        });
      }
    }
  }

  return validated.slice(0, 3);
}

/**
 * Lightweight section-level retrieval. Returns matching chunks ONLY when there is genuine topical overlap.
 */
export function retrieveSupportingSections(
  conversationWindow: ConversationTurnInput[]
): IndexedKnowledgeChunk[] {
  const userTurns = conversationWindow.filter((t) => t.role === 'user');
  const latestText = (userTurns[userTurns.length - 1]?.text || '').toLowerCase();
  const prevUserText = (userTurns[userTurns.length - 2]?.text || '').toLowerCase();

  // Combine latest turn with previous turn if the latest turn is a short contextual follow-up
  const queryText =
    latestText.split(/\s+/).length <= 7 && prevUserText
      ? `${prevUserText} ${latestText}`
      : latestText;

  const scored: { chunk: IndexedKnowledgeChunk; score: number }[] = [];

  for (const chunk of KNOWLEDGE_INDEX.values()) {
    let score = 0;

    // Domain-specific high-signal boosts
    if (
      /\b(pub|pint|matchday|mates|bar|round|outside|walking in|taproom|wedding|social)\b/.test(
        queryText
      ) &&
      chunk.playbookId === 'playbook-3'
    ) {
      score += 5;
    }

    if (
      /\b(craving|witching hour|5\s*pm|5pm|shift|urge|tempted|fancy a drink)\b/.test(
        queryText
      )
    ) {
      if (chunk.id === 'playbook-1#section-0') score += 4;
      if (chunk.id === 'recipe-witching-hour-spritz') score += 4;
    }

    if (
      /\b(halt|hungry|angry|lonely|tired|stress|burnout|cbt|thought|reframe|trigger)\b/.test(
        queryText
      ) &&
      chunk.playbookId === 'playbook-4'
    ) {
      score += 5;
    }

    if (
      /\b(budget|£40|aldi|tesco|shop|supermarket|grocery)\b/.test(queryText) &&
      chunk.playbookId === 'playbook-2'
    ) {
      score += 5;
    }

    if (
      /\b(workplace|employer|policy|charter|hr|b2b|company|team)\b/.test(
        queryText
      ) &&
      chunk.playbookId === 'playbook-5'
    ) {
      score += 5;
    }

    if (
      /\b(steak|cavolo|skillet)\b/.test(queryText) &&
      chunk.id === 'recipe-steak-skillet'
    ) {
      score += 5;
    }
    if (
      /\b(mackerel|chickpea|tahini|fish)\b/.test(queryText) &&
      chunk.id === 'recipe-mackerel-bowl'
    ) {
      score += 5;
    }
    if (
      /\b(oat|porridge|cacao|breakfast|sugar)\b/.test(queryText) &&
      chunk.id === 'recipe-recovery-oats'
    ) {
      score += 5;
    }
    if (
      /\b(harissa|chicken|traybake|sweet potato)\b/.test(queryText) &&
      chunk.id === 'recipe-harissa-traybake'
    ) {
      score += 5;
    }

    // Keyword overlap score
    const queryWords = queryText
      .replace(/[^a-z0-9£.\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4);

    for (const w of queryWords) {
      if (chunk.keywords.includes(w)) {
        score += 1;
      }
    }

    if (score >= 3) {
      scored.push({ chunk, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.chunk);
}

const WITHDRAWAL_REGEX =
  /\b(shaking|shakes|tremor|tremors|seizure|fitting|hallucinat|delirium|chest pain|severe withdrawal|sweating and shaking|stopped cold turkey)\b/i;

const URGENT_DISTRESS_REGEX =
  /\b(end my life|kill myself|suicid|want to die|can't go on living|self-harm|hurt myself|no point living|overdose)\b/i;

/**
 * Reviewed, fixed safety escalation flow for possible alcohol withdrawal or urgent emotional distress.
 * Never cites playbooks or invents medical detox instructions.
 */
export function evaluateSafetyEscalation(
  latestUserText: string
): StructuredCornermanResponse | null {
  if (URGENT_DISTRESS_REGEX.test(latestUserText)) {
    return {
      reply:
        "I'm really glad you told me how you're feeling right now, mate. Your safety comes first, and you don't have to carry this on your own tonight.\n\nPlease contact one of these free, confidential UK support services right now:\n• Call Samaritans on 116 123 (free, 24 hours a day)\n• Call CALM on 0800 58 58 58 (5pm to midnight daily)\n• Text SHOUT to 85258 (free 24/7 crisis text support)\n• If you are in immediate danger, call 999 or go to your nearest A&E.\n\nUse the button below to open Lifelines and call or text with one tap.",
      sourceIds: [],
      citations: [],
      action: 'VIEW_LIFELINES',
      providerStatus: 'safety_escalation',
    };
  }

  if (WITHDRAWAL_REGEX.test(latestUserText)) {
    return {
      reply:
        "Please pause and look after your physical safety first, mate. Symptoms like shaking, tremors, severe sweating, confusion, fits, or chest pain can be signs of physical alcohol withdrawal, which can be medically dangerous.\n\nIf you have been drinking heavily every day, please do not try to stop suddenly without medical guidance:\n• Call NHS 111 right now for urgent medical advice\n• Call 999 or go to A&E immediately if you have severe shaking, chest pain, confusion, or seizures\n• Speak with your GP or local NHS alcohol service for a safe, supported plan.\n\nTap below to view UK medical and support lifelines.",
      sourceIds: [],
      citations: [],
      action: 'VIEW_LIFELINES',
      providerStatus: 'safety_escalation',
    };
  }

  return null;
}

/**
 * Validates an untrusted response payload (from server endpoint or LLM) against the fixed schema.
 */
export function validateStructuredResponse(
  raw: unknown,
  providerStatus: StructuredCornermanResponse['providerStatus'],
  statusNotice?: string
): StructuredCornermanResponse {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;
  const reply =
    typeof obj.reply === 'string' && obj.reply.trim().length > 0
      ? obj.reply.trim()
      : 'I’m right here with you, mate. Let’s take one steady step at a time.';

  const citations = validateSourceIds(obj.sourceIds);
  const sourceIds = citations.map((c) => c.id);

  const action =
    typeof obj.action === 'string' &&
    (ALLOWED_CORNERMAN_ACTIONS as readonly string[]).includes(obj.action)
      ? (obj.action as CornermanActionId)
      : undefined;

  return {
    reply,
    sourceIds,
    citations,
    action,
    providerStatus,
    statusNotice,
  };
}

/**
 * Context-aware built-in UK recovery companion responder.
 * Used when the server-side AI endpoint is unconfigured, unreachable, or offline.
 * Understands multi-turn conversation windows (such as "I'm already outside" after a pub/shift craving).
 */
export function generateBuiltInCompanionResponse(
  boundedMessages: ConversationTurnInput[],
  providerStatus: 'builtin_fallback' | 'offline' = 'builtin_fallback',
  statusNotice?: string
): StructuredCornermanResponse {
  const userTurns = boundedMessages.filter((m) => m.role === 'user');
  const latest = (userTurns[userTurns.length - 1]?.text || '').trim();
  const latestLower = latest.toLowerCase();
  const previousUser = (userTurns[userTurns.length - 2]?.text || '').toLowerCase();

  // 1. Check safety escalation first
  const safety = evaluateSafetyEscalation(latest);
  if (safety) return safety;

  // 2. Contextual follow-up detection (e.g., "I'm already outside" / "I'm at the door" / "My mates are inside")
  const isFollowUpLocationOrPressure =
    /\b(already outside|outside the pub|at the door|in the car park|walking in|mates are inside|they're waiting|standing outside|right outside)\b/i.test(
      latestLower
    ) ||
    (latestLower.split(/\s+/).length <= 6 &&
      /\b(pub|shift|craving|pint|drink)\b/i.test(previousUser));

  if (isFollowUpLocationOrPressure) {
    const contextMention = /\b(shift|work)\b/i.test(previousUser)
      ? 'right after a brutal shift'
      : 'with the pub right in front of you';
    return validateStructuredResponse(
      {
        reply: `Being stood right outside ${contextMention} is the hardest 60 seconds, mate—well done for messaging before walking through that door.\n\nPractical next step: Turn your feet away from the entrance right now and walk 50 paces down the pavement while we run a 60-second Craving Reset together. Give yourself two minutes of breathing space before you make any decision.`,
        sourceIds: ['playbook-3#section-0', 'playbook-1#section-0'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 3. Setback / Relapse / Slip support
  if (
    /\b(slipped|relapsed|drank last night|had a drink|reset my streak|messed up|fell off|setback)\b/i.test(
      latestLower
    )
  ) {
    return validateStructuredResponse(
      {
        reply:
          "First thing, mate: drop the shame. A setback does not erase the days you've already banked or the badges you've earned—those lessons are still yours.\n\nPractical next step: Drink a big glass of water, eat a proper meal with protein and slow-release carbs, and use the HALT worksheet to note what triggered the slip while it's fresh so you can guard against it next time.",
        sourceIds: ['playbook-4#section-0'],
        action: 'OPEN_HALT_WORKSHEET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 4. Craving after a shift / 5 PM Witching Hour / Heading to the pub
  if (
    /\b(craving|5\s*pm|5pm|witching hour|brutal shift|finished a shift|go to the pub|going to the pub|fancy a pint|need a drink|talk me down|urge)\b/i.test(
      latestLower
    )
  ) {
    return validateStructuredResponse(
      {
        reply:
          "I hear you, mate—finishing a brutal shift leaves your nervous system wired and your blood sugar flat, which makes the pub pull feel ten times louder than it really is.\n\nPractical next step: Pause for 60 seconds before you head anywhere, get a cold alcohol-free drink or water in your hand, and run the Craving Reset below to steady your breathing and check whether hunger or exhaustion is driving the urge.",
        sourceIds: ['playbook-1#section-0', 'recipe-witching-hour-spritz'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 5. Pub / Matchday social script
  if (
    /\b(matchday|turn down a pint|sober script|mates at the pub|wedding|work social|round|guinness|lucky saint)\b/i.test(
      latestLower
    )
  ) {
    return validateStructuredResponse(
      {
        reply:
          "Walking into a matchday pub or work social is much easier when you decide your order before your foot hits the carpet.\n\nPractical next step: Opt out of the big round straight away, order a Guinness 0.0, Lucky Saint, or lime and soda directly from the bar so your hand is never empty, and use a simple line like: \"Got an early start tomorrow mate, staying on the zeros tonight.\"",
        sourceIds: ['playbook-3#section-0', 'playbook-3#section-1'],
        action: 'OPEN_PLAYBOOK_3',
      },
      providerStatus,
      statusNotice
    );
  }

  // 6. Work stress, burnout, HALT & CBT check
  if (
    /\b(stress|burnout|cbt|halt|angry|lonely|tired|overwhelmed|anxious|workplace)\b/i.test(
      latestLower
    )
  ) {
    return validateStructuredResponse(
      {
        reply:
          "When work pressure piles up, it's easy for your head to tell you that a drink is the only off-switch. In reality, exhaustion and stress need proper rest and fuel, not borrowed time from tomorrow.\n\nPractical next step: Take 90 seconds to write down the trigger and reframe the automatic thought in the interactive HALT & CBT worksheet below.",
        sourceIds: ['playbook-4#section-0'],
        action: 'OPEN_HALT_WORKSHEET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 7. Food / Fridge / £40 Budget Meals
  if (
    /\b(fridge|meal|recipe|cook|hungry|dinner|breakfast|£40|shop|food|steak|mackerel|oats|chicken)\b/i.test(
      latestLower
    )
  ) {
    return validateStructuredResponse(
      {
        reply:
          "Getting a hot, protein-rich meal in you within 15 minutes of finishing work is one of the best ways to take the edge off an evening craving.\n\nPractical next step: Try the 12-minute Steak & Cavolo Nero Skillet or the 10-minute Smashed Mackerel & Chickpea Bowl, or use the 3-ingredient fridge generator on this page to build a quick skillet from what you already have.",
        sourceIds: [
          'playbook-2#section-0',
          'recipe-steak-skillet',
          'recipe-mackerel-bowl',
        ],
        action: 'OPEN_PLAYBOOK_2',
      },
      providerStatus,
      statusNotice
    );
  }

  // 8. General / Unrelated query -> return ZERO irrelevant citations!
  const supporting = retrieveSupportingSections(boundedMessages);
  return validateStructuredResponse(
    {
      reply:
        "I'm here in your corner, mate. Whether you want to talk down an after-shift craving, plan a quick meal, practice a pub script, or work through a stressful day, tell me what's on your mind—or use the Craving Reset tool below anytime.",
      sourceIds: supporting.map((s) => s.id),
      action: 'START_CRAVING_RESET',
    },
    providerStatus,
    statusNotice
  );
}

/**
 * Generates a custom 15-minute meal from 3 fridge ingredients in plain UK English.
 */
export function buildFridgeCompanionRecipe(
  ingredientsInput: string
): StructuredCornermanResponse {
  const cleaned = ingredientsInput
    .split(/[,+&/]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const ing1 = cleaned[0] || 'Eggs';
  const ing2 = cleaned[1] || 'Spinach';
  const ing3 = cleaned[2] || 'Tinned Beans';

  const reply = `Good shout checking the fridge first, mate. Let's turn **${ing1}**, **${ing2}**, and **${ing3}** into a quick **12-Minute Recovery Skillet** (~£1.85).\n\n1. **Sear (0–4 mins):** Warm 1 tbsp olive oil in a frying pan over medium-high heat with a pinch of salt, black pepper, and garlic or chilli flakes. Cook **${ing1}** until golden.\n2. **Simmer (4–8 mins):** Tip in **${ing3}** to soak up the pan juices, adding a splash of water or lemon juice.\n3. **Finish (8–12 mins):** Fold through **${ing2}** for the final 2–3 minutes until tender, then plate up with a cold glass of water or ginger spritz.`;

  return validateStructuredResponse(
    {
      reply,
      sourceIds: ['playbook-2#section-0', 'recipe-steak-skillet'],
      action: 'OPEN_PLAYBOOK_2',
    },
    'builtin_fallback'
  );
}

/**
 * Main client caller for Cornerman.
 * Calls the server-side endpoint (Supabase Edge Function or /api/cornerman) with a bounded conversation window,
 * request validation, and an 8-second timeout. Never uses browser-side provider API keys.
 * Falls back explicitly to built-in companion guidance if offline or if the provider endpoint fails.
 */
export async function requestCornermanCompanion(options: {
  messages: ConversationTurnInput[];
  streakDays: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  forceProviderUnavailable?: boolean;
}): Promise<StructuredCornermanResponse> {
  const bounded = options.messages
    .slice(-8)
    .map((m) => ({
      role: m.role,
      text: String(m.text || '').slice(0, 1200).trim(),
    }))
    .filter((m) => m.text.length > 0);

  const latestUser =
    [...bounded].reverse().find((m) => m.role === 'user')?.text || '';

  // 1. Always run the reviewed, fixed safety escalation check first (works online & offline)
  const safety = evaluateSafetyEscalation(latestUser);
  if (safety) {
    return safety;
  }

  // 2. Check offline state
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return generateBuiltInCompanionResponse(
      bounded,
      'offline',
      'You are currently offline. Showing built-in recovery guidance and offline tools.'
    );
  }

  if (options.forceProviderUnavailable) {
    return generateBuiltInCompanionResponse(
      bounded,
      'builtin_fallback',
      'The Gaffer AI service is currently unavailable — showing built-in companion guidance.'
    );
  }

  const retrievedChunks = retrieveSupportingSections(bounded);

  // 3. Determine server-side endpoint URL (Supabase Edge Function if configured)
  const endpointUrl = options.supabaseUrl
    ? `${options.supabaseUrl.replace(/\/$/, '')}/functions/v1/cornerman`
    : '';

  if (endpointUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (options.supabaseAnonKey) {
        headers['Authorization'] = `Bearer ${options.supabaseAnonKey}`;
        headers['apikey'] = options.supabaseAnonKey;
      }

      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          messages: bounded,
          streakDays: options.streakDays,
          retrievedChunks: retrievedChunks.map((c) => ({
            id: c.id,
            title: `${c.title} — ${c.sectionHeading || ''}`,
            excerpt: c.excerpt,
          })),
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return validateStructuredResponse(data, 'live');
      }

      return generateBuiltInCompanionResponse(
        bounded,
        'builtin_fallback',
        `The Gaffer AI endpoint returned HTTP ${res.status} — using built-in companion guidance.`
      );
    } catch {
      return generateBuiltInCompanionResponse(
        bounded,
        'builtin_fallback',
        'The Gaffer AI endpoint is unreachable — using built-in companion guidance.'
      );
    }
  }

  // When no server-side endpoint is configured yet, use the built-in companion transparently
  return generateBuiltInCompanionResponse(
    bounded,
    'builtin_fallback',
    'Built-in voice & companion mode active (connect Supabase Edge Function for live cloud AI).'
  );
}
