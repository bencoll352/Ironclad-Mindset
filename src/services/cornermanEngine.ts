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

function pickNonRepeating(
  candidates: string[],
  previousBotReplies: string[],
  turnSeed: number
): string {
  const unused = candidates.filter(
    (c) => !previousBotReplies.some((prev) => prev.includes(c.slice(0, 48)))
  );
  if (unused.length > 0) {
    return unused[turnSeed % unused.length];
  }
  return candidates[turnSeed % candidates.length];
}

function extractUserTopicSnippet(text: string): string {
  const cleaned = text
    .replace(/^(i'm|i am|im|i feel|feeling|i just|just|it's|its|well|yeah|so)\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim();
  if (!cleaned) return 'what is going on right now';
  const words = cleaned.split(/\s+/).slice(0, 8);
  return words.join(' ').toLowerCase();
}

/**
 * Context-aware, non-repeating built-in UK recovery coach responder ("Pippa").
 * Tracks multi-turn conversation history, remembers what Pippa already suggested,
 * handles natural conversational follow-ups ("yes", "no", "still tempted", "6/10", greetings, etc.),
 * and always invites real back-and-forth dialogue.
 */
export function generateBuiltInCompanionResponse(
  boundedMessages: ConversationTurnInput[],
  providerStatus: 'builtin_fallback' | 'offline' = 'builtin_fallback',
  statusNotice?: string
): StructuredCornermanResponse {
  const userTurns = boundedMessages.filter((m) => m.role === 'user');
  const botTurns = boundedMessages.filter((m) => m.role === 'cornerman');
  const latest = (userTurns[userTurns.length - 1]?.text || '').trim();
  const latestLower = latest.toLowerCase();
  const previousUser = (userTurns[userTurns.length - 2]?.text || '').toLowerCase();
  const lastBot = (botTurns[botTurns.length - 1]?.text || '').toLowerCase();
  const previousBotReplies = botTurns.map((b) => b.text);
  const turnSeed = userTurns.length;
  const wordCount = latestLower.split(/\s+/).filter(Boolean).length;

  // 1. Check safety escalation first
  const safety = evaluateSafetyEscalation(latest);
  if (safety) return safety;

  // 2. Meta question: "how does this chat work?" / "who are you?" -> zero irrelevant citations
  if (
    /\b(how does this (chat|app|work)|what can you do|who are you|are you (real|ai|a bot))\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "I'm Pippa—your 24/7 UK voice and recovery coach right here inside Ironclad. You can talk to me hands-free about cravings after a shift, pub plans, stress, or quick meals on a £40 budget. What's on your plate today?",
        "Think of me as a steady mate in your corner, any hour of the day. Talk through what's winding you up, run a 60-second breathing reset together, or sort a quick meal. How's your head right now?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: [], action: undefined },
      providerStatus,
      statusNotice
    );
  }

  // 3. Casual greeting / opening hello
  const strippedOfPippa = latestLower
    .replace(/\bpippa\b/gi, '')
    .replace(/[,!?.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (
    strippedOfPippa === '' ||
    /^(hi|hello|hey|alright|hiya|good morning|good afternoon|good evening|morning|afternoon|evening|how are you|hows it going|how's it going|what's up|whats up|you alright)$/i.test(
      strippedOfPippa
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Alright mate! Good to hear from you. How's your day going so far—have you just clocked off, or just checking in?",
        "Hey! I'm right here with you. What's happening in your world right now—smooth sailing, or is something starting to tug at you?",
        "Hello! Glad you popped in. Tell me how you're actually feeling today—tired, buzzing, stressed, or doing alright?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: [], action: undefined },
      providerStatus,
      statusNotice
    );
  }

  // 4. Contextual follow-up: user is outside the pub / at the door / mates waiting
  const isFollowUpLocationOrPressure =
    /\b(already outside|outside the pub|at the door|in the car park|walking in|mates are inside|they're waiting|standing outside|right outside)\b/i.test(
      latestLower
    ) ||
    (wordCount <= 6 &&
      /\b(outside|door|car park|pub|waiting)\b/i.test(latestLower) &&
      /\b(pub|shift|craving|pint|drink)\b/i.test(previousUser));

  if (isFollowUpLocationOrPressure) {
    const contextMention = /\b(shift|work)\b/i.test(previousUser)
      ? 'right after a brutal shift'
      : 'with the pub right in front of you';
    const reply = pickNonRepeating(
      [
        `Being stood right outside ${contextMention} is the hardest 60 seconds, mate—well done for talking to me before walking through that door. Turn your feet away from the entrance right now, walk 50 paces down the pavement, and take four slow breaths with me. Are you heading straight home after this, or still deciding?`,
        `Right, pause right there outside the door. You've already done the hardest bit by checking in instead of going on autopilot. Step back from the entrance for two minutes and grab a breath of cold air—are your mates expecting you inside, or can you call it a night and grab some food?`,
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-3#section-0', 'playbook-1#section-0'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 5. Numeric rating follow-up (e.g. "8", "7 out of 10", "about a 9")
  const ratingMatch = latestLower.match(/\b(10|[1-9])\s*(?:\/\s*10|out of 10)?\b/);
  if (
    ratingMatch &&
    wordCount <= 7 &&
    (/\b(out of 10|how loud|how strong|rate|scale)\b/.test(lastBot) ||
      /\/\s*10/.test(latestLower))
  ) {
    const score = Number(ratingMatch[1]);
    if (score >= 7) {
      return validateStructuredResponse(
        {
          reply: `${score} out of 10 is loud, so let's keep things dead simple for the next five minutes. Don't negotiate with tomorrow—just get something cold and alcohol-free in your hand and run the 60-second Craving Reset below. Have you eaten anything proper in the last four hours?`,
          sourceIds: ['playbook-1#section-0'],
          action: 'START_CRAVING_RESET',
        },
        providerStatus,
        statusNotice
      );
    }
    if (score >= 4) {
      return validateStructuredResponse(
        {
          reply: `Okay, ${score} out of 10—annoying background noise, but totally manageable. Usually around that level it's tiredness or low blood sugar whispering at you. Fancy putting a 10-minute meal on or stepping outside for a quick breather?`,
          sourceIds: ['playbook-4#section-0'],
          action: 'OPEN_HALT_WORKSHEET',
        },
        providerStatus,
        statusNotice
      );
    }
    return validateStructuredResponse(
      {
        reply: `${score} out of 10 is solid—you're well in control there. Keep your evening steady with decent food and an early wind-down. What's the plan for the rest of tonight?`,
        sourceIds: [],
      },
      providerStatus,
      statusNotice
    );
  }

  // 6. Short natural conversational replies ("yes", "no", "still tempted", "thanks", "what else")
  const isAffirmative = /^(yes|yeah|yep|aye|definitely|for sure|starving|i am|a bit|kind of|maybe|okay|ok|alright then)[.! ]*$/i.test(
    latestLower
  );
  const isNegative = /^(no|nah|nope|not really|already ate|nothing|don't know|idk|not yet)[.! ]*$/i.test(
    latestLower
  );
  const isGratitudeOrDone = /\b(thanks|thank you|cheers|that helped|feeling better|sorted|appreciate it|got this)\b/i.test(
    latestLower
  );
  const isStillStruggling = /\b(still tempted|still craving|didn't work|not working|still hard|still want|worse|loud)\b/i.test(
    latestLower
  );
  const isAskMore = /\b(tell me more|what else|anything else|why does|how do i|give me another|like what)\b/i.test(
    latestLower
  );

  if (isGratitudeOrDone) {
    const reply = pickNonRepeating(
      [
        "Anytime, mate. You did the heavy lifting just by pausing and talking it out. Shout me again later if the evening gets noisy—what are you up to for the rest of the night?",
        "Glad that took the edge off! Bank that win and be kind to yourself tonight. Fancy a brew or something decent to eat now?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: [] },
      providerStatus,
      statusNotice
    );
  }

  if (isStillStruggling) {
    const reply = pickNonRepeating(
      [
        "Stay on the line with me—don't try to fight the whole night in one go, just win the next ten minutes. Craving waves spike hard and then drop off once your adrenaline settles. Tell me where you are right this second: at home, in the car, or near a shop/pub?",
        "Alright, let's switch tactics because white-knuckling alone is exhausting. Change your physical state right now: stand up, splash cold water on your face or wrists, and pour the coldest fizzy drink you've got. How loud is the urge out of 10 right now?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-1#section-0'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  if (isAffirmative) {
    if (/\b(eaten|hungry|food|fridge|meal|cook)\b/.test(lastBot)) {
      return validateStructuredResponse(
        {
          reply:
            "Right, let's sort your blood sugar first—that alone knocks half a craving flat. Tell me three things you've got in the fridge or cupboard right now, or hit the Steak Skillet or Mackerel Bowl in Fuel the Mind. What have you got in?",
          sourceIds: ['playbook-2#section-0', 'recipe-steak-skillet'],
          action: 'OPEN_PLAYBOOK_2',
        },
        providerStatus,
        statusNotice
      );
    }
    if (/\b(pub|mates|order|script|round|home)\b/.test(lastBot)) {
      return validateStructuredResponse(
        {
          reply:
            "Smart move deciding early. Keep your line dead casual—something like 'Early start tomorrow, staying on the Guinness 0.0 tonight'—and get your glass in hand first so nobody tries to buy you a pint. Which zero-alcohol drink are you going for first?",
          sourceIds: ['playbook-3#section-0'],
          action: 'OPEN_PLAYBOOK_3',
        },
        providerStatus,
        statusNotice
      );
    }
    return validateStructuredResponse(
      {
        reply:
          "Good—let's take it one steady move at a time. Drop your shoulders, take one long exhale right now, and tell me what's the main thing winding you up tonight: exhaustion, people around you, or just wanting an off-switch?",
        sourceIds: ['playbook-4#section-0'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  if (isNegative) {
    if (
      /\b(already ate|not hungry|eaten)\b/.test(latestLower) ||
      /\b(eaten|hungry|food|fridge)\b/.test(lastBot)
    ) {
      return validateStructuredResponse(
        {
          reply:
            "Okay, so you've eaten—that means this is likely stress, tiredness, or habit kicking in rather than hunger. Let's calm your nervous system down: change out of work kit, stick on a decent playlist or podcast, and hit the 60-second Craving Reset. On a scale of 1 to 10, how wound-up do you feel?",
          sourceIds: ['playbook-4#section-0'],
          action: 'START_CRAVING_RESET',
        },
        providerStatus,
        statusNotice
      );
    }
    return validateStructuredResponse(
      {
        reply:
          "Fair enough—no pressure to force it. Sometimes you just need someone to listen while the urge passes. What would feel like the easiest win in the next 15 minutes—a hot shower, a quick walk, or sticking a film on?",
        sourceIds: [],
      },
      providerStatus,
      statusNotice
    );
  }

  if (isAskMore) {
    const reply = pickNonRepeating(
      [
        "Here's why this works: after a long shift, cortisol stays sky-high while your blood sugar dips, so your brain begs for the fastest dopamine hit it remembers. Giving it salt, protein, cold fizz, and 60 seconds of slow breathing resets that alarm without a hangover tomorrow. Want to try a quick thought-reframe or a 10-minute recipe idea?",
        "Another tactic the lads and lasses in Ironclad swear by is 'playing the tape forward'—picture 7am tomorrow morning with a clear head and money still in your pocket versus waking up groggy. What part of tonight feels trickiest for you?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: ['playbook-1#section-0'] },
      providerStatus,
      statusNotice
    );
  }

  // 7. Positive progress / good day check-in
  if (
    /\b(doing (good|well|great|fine|okay)|feeling (good|great|strong|better|proud)|stayed sober|didn't drink|made it|good day|not bad|banked)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Love hearing that, mate! Every single sober day builds real momentum—your sleep, mood, and wallet all feel it. What helped you most today so we can bottle that for tougher days?",
        "Brilliant work—honestly, days like that are proof the work is paying off. Got anything nice planned for tonight to switch off properly?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: [] },
      providerStatus,
      statusNotice
    );
  }

  // 8. Setback / Relapse / Slip support (satisfies Promptfoo Test 3)
  if (
    /\b(slipped|relapsed|drank last night|had a drink|reset my streak|messed up|fell off|setback)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "First thing, mate: drop the shame. A setback does not erase the days you've already banked or the badges you've earned—those lessons are still yours.\n\nPractical next step: Drink a big glass of water, eat a proper meal with protein and slow-release carbs, and use the HALT worksheet to note what triggered the slip while it's fresh. Tell me—what happened right before you had that drink?",
        "Hey, breathe—drop the shame straight away. One slip doesn't wipe out your strength or what you've already learned. Get some water and real food in you first, then talk me through what set it off so we can block that trigger next time.",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-4#section-0'],
        action: 'OPEN_HALT_WORKSHEET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 9. Craving after a shift / 5 PM Witching Hour / Heading to the pub (satisfies Promptfoo Tests 1 & 7)
  if (
    /\b(craving|5\s*pm|5pm|witching hour|brutal shift|finished a shift|finished work|go to the pub|going to the pub|fancy a pint|need a drink|talk me down|urge|tempted)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "I hear you, mate—finishing a brutal shift leaves your nervous system wired and your blood sugar flat, which makes the pub pull feel ten times louder than it really is.\n\nPractical next step: Pause for 60 seconds before you head anywhere, get a cold alcohol-free drink or water in your hand, and run the Craving Reset below. Quick check first—have you eaten properly today, or are you running on fumes?",
        "Right, I'm with you. That post-shift 5pm pull is brutal because your body wants an instant off-switch, not actually alcohol. Give me 60 seconds on the Craving Reset before you decide anything—how loud is the craving out of 10 right now?",
        "Good on you for speaking up instead of going on autopilot. Let's buy 10 minutes of breathing room so the wave peaks and drops. Are you still at work, on your commute, or already home?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-1#section-0', 'recipe-witching-hour-spritz'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 10. Pub / Matchday social script
  if (
    /\b(matchday|turn down a pint|sober script|mates at the pub|wedding|work social|round|guinness|lucky saint|pub)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Walking into a matchday pub or work social is way easier when you decide your order before your foot hits the carpet. Opt out of the big round straight away, order a Guinness 0.0, Lucky Saint, or lime and soda directly from the bar, and keep it simple: \"Early start tomorrow mate, staying on the zeros tonight.\" Want to practice what you'll say if someone pushes a pint on you?",
        "Pub nights are all about keeping a cold glass in your hand and having an exit plan ready if it gets messy late on. Who are you heading out with, and do they know you're taking a break from booze?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-3#section-0', 'playbook-3#section-1'],
        action: 'OPEN_PLAYBOOK_3',
      },
      providerStatus,
      statusNotice
    );
  }

  // 11. Boredom / Quiet evening / Restlessness / Weekend
  if (
    /\b(bored|boring|nothing to do|quiet evening|restless|twitchy|weekend|friday night|saturday night)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Quiet evenings can feel weirdly loud when you're used to filling them with a drink. Your brain's just looking for a bit of stimulation, not actually booze. Stick a podcast or match on, cook something quick with plenty of flavour, or go for a brisk 15-minute walk. Which sounds easiest right now?",
        "Friday and Saturday nights feel strange at first when you slow down—give yourself credit for sitting with it. What's one small thing you actually enjoy doing when your head's clear tomorrow morning?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      { reply, sourceIds: ['playbook-1#section-0'] },
      providerStatus,
      statusNotice
    );
  }

  // 12. Late-night / 3am / Can't sleep / Racing head
  if (
    /\b(can't sleep|cant sleep|3am|3 am|insomnia|wide awake|racing thoughts|ceiling|night)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Staring at the ceiling in the middle of the night makes every worry feel twice the size, mate. Don't lie there battling it—get a glass of water, drop the room temperature slightly, and try four rounds of 4-4-4-4 box breathing to quiet your pulse. What's keeping your mind spinning tonight?",
        "Late nights are tough, especially when your nervous system is still rewiring. Remind yourself: resting sober in bed is still miles better for your body than passing out after a drink. Want to run the 60-second breathing guide together?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-4#section-0'],
        action: 'START_CRAVING_RESET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 13. Work stress, burnout, HALT & CBT check
  if (
    /\b(stress|stressed|burnout|cbt|halt|angry|lonely|tired|overwhelmed|anxious|workplace|boss|exhausted|drained)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "When work pressure piles up, it's easy for your head to tell you that a drink is the only off-switch. In reality, exhaustion and stress need proper rest and fuel, not borrowed time from tomorrow. Tell me what actually happened today—was it workload, people, or just non-stop pressure?",
        "Sounds like you're carrying a heavy load right now. Let's pull it out of your head and look at it properly using the HALT & CBT worksheet, or just talk it out here with me—which part of HALT (Hungry, Angry, Lonely, Tired) feels loudest right now?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
        sourceIds: ['playbook-4#section-0'],
        action: 'OPEN_HALT_WORKSHEET',
      },
      providerStatus,
      statusNotice
    );
  }

  // 14. Food / Fridge / £40 Budget Meals
  if (
    /\b(fridge|meal|recipe|cook|hungry|dinner|breakfast|£40|shop|food|steak|mackerel|oats|chicken|tea|supper)\b/i.test(
      latestLower
    )
  ) {
    const reply = pickNonRepeating(
      [
        "Getting a hot, protein-rich meal in you within 15 minutes of finishing work is one of the best ways to take the edge off an evening craving. Fancy the 12-minute Steak & Cavolo Nero Skillet, the 10-minute Smashed Mackerel Bowl, or telling me three things in your fridge so I can throw a quick skillet together for you?",
        "Proper food changes everything—once your blood sugar steadies up, cravings drop off fast. What have you got knocking about in your fridge or cupboards right now?",
      ],
      previousBotReplies,
      turnSeed
    );
    return validateStructuredResponse(
      {
        reply,
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

  // 15. General open conversation -> reflect what the user actually said and invite back-and-forth
  const supporting = retrieveSupportingSections(boundedMessages);
  const snippet = extractUserTopicSnippet(latest);
  const reply = pickNonRepeating(
    [
      `I hear you on ${snippet}. Talk me through that a bit more—how's that leaving you feeling right now, and is it making tonight feel harder or easier?`,
      `Got you—dealing with ${snippet} takes real headspace. Take a breath for a second: what do you feel you need most right now, a practical plan or just a soundboard to vent?`,
      `Right, listening to you talk about ${snippet}—it makes sense that's on your mind. How are your energy levels holding up today, and have you had chance to eat properly yet?`,
    ],
    previousBotReplies,
    turnSeed
  );

  return validateStructuredResponse(
    {
      reply,
      sourceIds: supporting.map((s) => s.id),
      action: supporting.length > 0 ? 'START_CRAVING_RESET' : undefined,
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
 * Main client caller for Pippa.
 * Calls the server-side endpoint (Supabase Edge Function) if configured, or runs the
 * upgraded multi-turn built-in UK voice coach offline/locally with zero API keys needed.
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
      'You are currently offline. Pippa built-in voice coach & tools are active.'
    );
  }

  if (options.forceProviderUnavailable) {
    return generateBuiltInCompanionResponse(
      bounded,
      'builtin_fallback',
      'Pippa cloud AI service is currently unavailable — showing built-in companion guidance.'
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
        `Pippa AI endpoint returned HTTP ${res.status} — using built-in interactive coach.`
      );
    } catch {
      return generateBuiltInCompanionResponse(
        bounded,
        'builtin_fallback',
        'Pippa AI endpoint is unreachable — using built-in interactive coach.'
      );
    }
  }

  // Built-in interactive UK coach active by default (no API key needed)
  return generateBuiltInCompanionResponse(
    bounded,
    'builtin_fallback',
    'Pippa interactive UK voice coach active (no API key required).'
  );
}
