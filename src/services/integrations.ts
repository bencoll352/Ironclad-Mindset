import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PLAYBOOKS, RECIPES } from '../data/ironcladData';
import {
  CornermanCitation,
  IntegrationConfig,
  WebhookLogItem,
} from '../types/ironclad';

const STORAGE_PREFIX = 'ironclad_mindset_v1_';

export function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersisted<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage write warning:', err);
  }
}

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  twentyCrmWebhookUrl: import.meta.env.VITE_TWENTY_CRM_WEBHOOK_URL || '',
  docuSealEmbedUrl:
    import.meta.env.VITE_DOCUSEAL_EMBED_URL ||
    'https://docuseal.com/d/ironclad-sober-workplace-charter-uk',
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config: IntegrationConfig): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
    }
    return supabaseInstance;
  } catch {
    return null;
  }
}

export async function syncToSupabaseOrLocal<T>(
  table: string,
  localKey: string,
  payload: T,
  config: IntegrationConfig
): Promise<{ syncedRemote: boolean }> {
  savePersisted(localKey, payload);
  const client = getSupabaseClient(config);
  if (!client) {
    return { syncedRemote: false };
  }
  try {
    await client.from(table).upsert({
      id: localKey,
      payload,
      updated_at: new Date().toISOString(),
    });
    return { syncedRemote: true };
  } catch {
    return { syncedRemote: false };
  }
}

/**
 * Embedded RAG Retriever over the 5 Ironclad Playbooks & 5 Mood-Food Recipes
 */
export function retrieveIroncladRAGContext(query: string): {
  contextText: string;
  citations: CornermanCitation[];
} {
  const q = query.toLowerCase();
  const citations: CornermanCitation[] = [];
  const snippets: string[] = [];

  // Match Playbooks
  PLAYBOOKS.forEach((pb) => {
    const haystack = `${pb.title} ${pb.subtitle} ${pb.summary} ${pb.keyTakeaways.join(' ')}`.toLowerCase();
    const isCravingMatch =
      (q.includes('craving') || q.includes('5 pm') || q.includes('5pm') || q.includes('day ') || q.includes('sleep') || q.includes('detox')) &&
      pb.number === 1;
    const isBudgetMatch =
      (q.includes('budget') || q.includes('£40') || q.includes('shop') || q.includes('aldi') || q.includes('tesco') || q.includes('fridge') || q.includes('meal') || q.includes('cook')) &&
      pb.number === 2;
    const isPubMatch =
      (q.includes('pub') || q.includes('matchday') || q.includes('pint') || q.includes('mates') || q.includes('football') || q.includes('script') || q.includes('0.0')) &&
      pb.number === 3;
    const isCbtMatch =
      (q.includes('stress') || q.includes('burnout') || q.includes('cbt') || q.includes('halt') || q.includes('work') || q.includes('shift') || q.includes('trigger')) &&
      pb.number === 4;
    const isB2BMatch =
      (q.includes('b2b') || q.includes('policy') || q.includes('employer') || q.includes('hr') || q.includes('company')) &&
      pb.number === 5;

    if (
      isCravingMatch ||
      isBudgetMatch ||
      isPubMatch ||
      isCbtMatch ||
      isB2BMatch ||
      q.includes(`playbook ${pb.number}`) ||
      haystack.split(' ').some((w) => w.length > 5 && q.includes(w))
    ) {
      citations.push({
        id: pb.id,
        type: 'Playbook',
        title: `Playbook ${pb.number}: ${pb.title}`,
        referenceId: pb.id,
      });
      snippets.push(
        `[PLAYBOOK ${pb.number}: ${pb.title}] Summary: ${pb.summary} Key Takeaways: ${pb.keyTakeaways.join(' | ')}`
      );
    }
  });

  // Match Recipes
  RECIPES.forEach((rec) => {
    const haystack = `${rec.title} ${rec.brainBenefitTitle} ${rec.brainBenefitDetail}`.toLowerCase();
    if (
      (q.includes('steak') && rec.id.includes('steak')) ||
      ((q.includes('mackerel') || q.includes('fish') || q.includes('omega')) && rec.id.includes('mackerel')) ||
      ((q.includes('oat') || q.includes('breakfast') || q.includes('morning') || q.includes('sugar')) && rec.id.includes('oats')) ||
      ((q.includes('5 pm') || q.includes('5pm') || q.includes('spritz') || q.includes('craving') || q.includes('ginger') || q.includes('drink')) &&
        rec.id.includes('spritz')) ||
      ((q.includes('chicken') || q.includes('prep') || q.includes('traybake')) && rec.id.includes('harissa')) ||
      haystack.split(' ').some((w) => w.length > 6 && q.includes(w))
    ) {
      citations.push({
        id: rec.id,
        type: 'Recipe',
        title: `Recipe: ${rec.title}`,
        referenceId: rec.id,
      });
      snippets.push(
        `[RECIPE: ${rec.title} (£${rec.costPerServingGBP.toFixed(2)}, ${rec.prepTimeMins}m)] Brain Benefit: ${rec.brainBenefitTitle} - ${rec.brainBenefitDetail}`
      );
    }
  });

  // Ensure at least one grounded citation
  if (citations.length === 0) {
    citations.push({
      id: 'playbook-1',
      type: 'Playbook',
      title: 'Playbook 1: The First 30 Days Sobriety Blueprint',
      referenceId: 'playbook-1',
    });
    citations.push({
      id: 'playbook-4',
      type: 'Playbook',
      title: 'Playbook 4: Interactive HALT & CBT Trigger Worksheet',
      referenceId: 'playbook-4',
    });
  }

  return {
    contextText: snippets.join('\n\n'),
    citations: citations.slice(0, 3),
  };
}

/**
 * Generates a custom 15-minute gut-brain recipe from any 3 random fridge ingredients
 */
export function buildFridgeDopamineRecipe(
  ingredientsInput: string
): { responseText: string; citations: CornermanCitation[] } {
  const cleaned = ingredientsInput
    .split(/[,+&/]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const ing1 = cleaned[0] || 'Eggs';
  const ing2 = cleaned[1] || 'Spinach';
  const ing3 = cleaned[2] || 'Tinned Beans';

  const responseText = `Right mate, apron on—let's turn **${ing1}**, **${ing2}**, and **${ing3}** into a proper **12-Minute Ironclad Dopamine Skillet** before that post-shift fatigue talks you into a takeaway or a pint.

### Chef's 12-Minute Recovery Skillet: ${ing1}, ${ing2} & ${ing3}
- **Prep & Cook Time:** 12 mins | **Est. Cost:** ~£1.85 | **Brain Target:** L-Tyrosine + Gut-Brain Axis Stabilisation

**Why this works for your head right now:**
When you finish a shift running on fumes, low blood glucose mimics an alcohol craving. Combining **${ing1}** (amino acids for neurotransmitter repair) with **${ing2}** and **${ing3}** locks in slow-release energy and calms evening cortisol.

**Step-by-Step Pass Order:**
1. **Hard Sear (Mins 0–4):** Get your frying pan properly hot with 1 tbsp olive oil, a pinch of flaky salt, cracked black pepper, and crushed garlic or chilli flakes. Sear off **${ing1}** first so you get proper caramelised flavour in the pan.
2. **Build the Base (Mins 4–8):** Toss **${ing3}** straight into the pan juices so it absorbs all that savoury seasoning. Add a splash of water or lemon juice/apple cider vinegar to deglaze the pan.
3. **Fold & Wilt (Mins 8–12):** Fold through **${ing2}** for the final 2–3 minutes just until vibrant and tender.
4. **Plate & Pour:** Serve in a warm bowl, pour an ice-cold sparkling water with lime on the side, and eat sitting down away from your phone.

You've just saved £25 on Deliveroo/pints and fed your prefrontal cortex properly. Let me know how it tastes, mate.`;

  return {
    responseText,
    citations: [
      {
        id: 'playbook-2',
        type: 'Playbook',
        title: 'Playbook 2: The £40 Mood-Food Supermarket Cheat Sheet',
        referenceId: 'playbook-2',
      },
      {
        id: 'recipe-steak-skillet',
        type: 'Recipe',
        title: 'Recipe: The Ironclad 12-Min Skillet Method',
        referenceId: 'recipe-steak-skillet',
      },
    ],
  };
}

/**
 * Calls @google/genai if a Gemini API key is configured, otherwise uses the intelligent RAG local mentor
 */
export async function askIroncladCornerman(
  userPrompt: string,
  streakDays: number,
  config: IntegrationConfig,
  isFridgeGenerator = false
): Promise<{ text: string; citations: CornermanCitation[]; usedLiveGemini: boolean }> {
  if (isFridgeGenerator) {
    const built = buildFridgeDopamineRecipe(userPrompt);
    if (!config.geminiApiKey) {
      return {
        text: built.responseText,
        citations: built.citations,
        usedLiveGemini: false,
      };
    }
  }

  const { contextText, citations } = retrieveIroncladRAGContext(userPrompt);

  if (config.geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
      const systemInstruction = `You are "The Ironclad Cornerman", a grounded, warm, direct British mentor and head chef who has walked through alcohol recovery and burnout and come out stronger.
Your user is currently on Day ${streakDays} alcohol-free.
Speak eye-to-eye ("Mate, let's slow this down for 60 seconds..."). Zero corporate fluff, zero judgment, practical British kitchen & workplace wisdom.
Always ground your advice in the provided Ironclad RAG Knowledge Base below:
${contextText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return {
          text: response.text,
          citations,
          usedLiveGemini: true,
        };
      }
    } catch (err) {
      console.warn('Gemini live call fallback triggered:', err);
    }
  }

  // Intelligent Grounded Local Responder with full RAG awareness
  const q = userPrompt.toLowerCase();

  if (q.includes('5 pm') || q.includes('5pm') || q.includes('craving') || q.includes('talk me down')) {
    return {
      usedLiveGemini: false,
      citations: [
        {
          id: 'playbook-1',
          type: 'Playbook',
          title: 'Playbook 1: The First 30 Days Sobriety Blueprint',
          referenceId: 'playbook-1',
        },
        {
          id: 'recipe-witching-hour-spritz',
          type: 'Recipe',
          title: 'Recipe: The "Witching Hour" Fiery Ginger & ACV Spritz',
          referenceId: 'recipe-witching-hour-spritz',
        },
      ],
      text: `Mate, stop right there and drop your shoulders away from your ears. Let's slow this down for 60 seconds.

You are on **Day ${streakDays}**. That 5 PM voice barking in your ear right now? That isn't *you*—that is a Pavlovian cortisol spike combined with low blood sugar after a long shift. In neurochemistry, a craving wave peaks and breaks within **15 to 20 minutes** if you don't feed it.

### Your 3-Step Ironclad Reset for the Next 15 Minutes:
1. **Change Your Physical State Immediately:** Pour a tall glass packed with ice, **25ml raw Apple Cider Vinegar, fresh lime, grated ginger (or fiery ginger beer 0.0%), and a pinch of flaky sea salt** (*The Witching Hour Spritz*). The sharp bite hits your vagus nerve and tells your brain the shift is officially over.
2. **Eat Protein Before You Decide Anything:** Never negotiate with a craving on an empty stomach. Get a skillet on for 10 minutes or smash a tin of mackerel with lemon and chickpeas. Once your blood glucose levels out, the craving loses 70% of its volume.
3. **Play the Tape Forward to 7:00 AM Tomorrow:** Picture waking up tomorrow morning clear-headed, zero dry mouth, zero 3 AM heart-hammering anxiety, with another £15–£40 still in your bank account and **Day ${streakDays + 1}** locked in the Forge.

Nobody ever woke up at 7:00 AM wishing they had drunk the night before. Stay with me for the next 15 minutes, mate—you've got this.`,
    };
  }

  if (q.includes('fridge') || q.includes('15-min') || q.includes('dopamine meal') || q.includes('recipe')) {
    return {
      usedLiveGemini: false,
      citations: [
        {
          id: 'recipe-steak-skillet',
          type: 'Recipe',
          title: 'Recipe: The Ironclad Steak, Cavolo Nero & Garlic Skillet',
          referenceId: 'recipe-steak-skillet',
        },
        {
          id: 'recipe-mackerel-bowl',
          type: 'Recipe',
          title: 'Recipe: Smashed Mackerel, Chickpea & Lemon Tahini Bowl',
          referenceId: 'recipe-mackerel-bowl',
        },
      ],
      text: `Right mate, when you've just walked off a brutal shift, if dinner takes longer than 15 minutes you're going to reach for a takeaway menu or a bottle. Here are my two fastest **Dopamine & Gut-Repair Shift Winners**:

### Option A: 12-Min Ironclad Steak, Cavolo Nero & Garlic Skillet (£3.45)
- **The Brain Science:** Grass-fed beef rump/bavette is loaded with **L-Tyrosine**—the direct amino acid precursor your brain uses to synthesize dopamine—while cavolo nero delivers folate and magnesium to drop evening cortisol.
- **Pass Method:** Hard-sear a bone-dry 200g rump steak in cast iron (2 mins each side with 3 smashed garlic cloves). Rest on a warm plate. Toss shredded cavolo nero and half a tin of drained cannellini beans straight into the beef drippings with chilli flakes for 3 minutes. Slice steak on top and pour over the resting juices.

### Option B: 10-Min Smashed Mackerel, Chickpea & Lemon Tahini Bowl (£1.95)
- **The Brain Science:** 90% of serotonin is produced in your gut. Oily Scottish mackerel gives you a massive hit of anti-inflammatory **EPA/DHA Omega-3s**, and chickpeas feed your microbiome.
- **Pass Method:** Whisk 1 tbsp tahini, the olive oil straight from the mackerel tin, juice of half a lemon, and warm water in a bowl. Toss in a drained tin of chickpeas, sliced red onion, and parsley. Flake the mackerel on top with plenty of cracked black pepper.

*Tip: Use the **3-Ingredient Fridge Generator** box just above our chat if you want me to build a custom skillet out of whatever 3 random bits you've got on your middle shelf right now!*`,
    };
  }

  if (q.includes('pub') || q.includes('matchday') || q.includes('pint') || q.includes('script') || q.includes('mates')) {
    return {
      usedLiveGemini: false,
      citations: [
        {
          id: 'playbook-3',
          type: 'Playbook',
          title: 'Playbook 3: The Matchday & UK Pub Survival Guide',
          referenceId: 'playbook-3',
        },
      ],
      text: `Walking into a UK pub on a Saturday matchday or after work on **Day ${streakDays}** comes down to one rule: **walk through the door knowing your exact order before your foot hits the carpet.**

### 1. Your First-60-Seconds Bar Protocol
- **Never join the big round on Day 1–90:** The moment someone says *"Whose round is it?"*, say: *"I'm grabbing my own today mate, I'm bouncing after the match—what are you having?"* Buy theirs if you want, put a **Guinness 0.0** or **Lucky Saint (on tap)** in your own hand immediately. Nobody offers to buy a drink for someone whose hand is already full.

### 2. Word-for-Word Scripts When Someone Pushes ("Why aren't you drinking?")
- **The Direct No-Fuss Script:** *"Taking a proper 30-day break from the booze mate—honestly sleeping like a king and feeling too sharp to wreck it. This Guinness Zero is actually spot on."*
- **The Early Graft Script:** *"Got an early commitment tomorrow morning and need a clear head—staying on the zeros tonight."*
*(Rule: Say it with your chest, zero apology, and immediately ask them a question about the match or work. People care about what's in your glass for approximately 12 seconds.)*

### 3. The 9:30 PM "Irish Exit"
Around pint 3 or 4, the pub volume goes up 30% and the lads start telling the exact same story twice. That's your victory bell. Fist-bump the person next to you, head out cleanly, and enjoy waking up Sunday morning at 7:00 AM with £80 still in your wallet and zero beer fear.`,
    };
  }

  if (q.includes('stress') || q.includes('burnout') || q.includes('cbt') || q.includes('work') || q.includes('halt')) {
    return {
      usedLiveGemini: false,
      citations: [
        {
          id: 'playbook-4',
          type: 'Playbook',
          title: 'Playbook 4: Interactive HALT & CBT Trigger Worksheet',
          referenceId: 'playbook-4',
        },
      ],
      text: `Let's run a rapid **Ironclad CBT & HALT Check** right now, mate. When work or shift pressure has your jaw clenched, your brain tries to sell you the lie that alcohol equals decompression. It doesn't—it just borrows calm from tomorrow with 300% interest.

### Step 1: Spot the Permissive Thought
Right now, the automatic thought is usually one of two classics:
- *"I've worked like a dog all day, I deserve to switch my brain off."*
- *"If I don't have something tonight, I'll never get to sleep before tomorrow's shift."*

### Step 2: The Grounded Chef Reframe
- **Fact Check:** Alcohol blocks deep restorative REM sleep and spikes your resting heart rate by 10–15 BPM all night. You don't need poison; you need **nervous system down-regulation**.
- **Your Ironclad Reframe:** *"My body is exhausted and flooded with adrenaline from grafting hard. I deserve actual recovery—a hot high-protein meal, a hot shower, and 8 hours of proper sober sleep—not a 3 AM cortisol spike."*

### Step 3: Next 10 Minutes Action
Head over to **Playbook 4 (Interactive HALT & CBT Trigger Worksheet)** if you want to log this trigger permanently in your journal, or tap the **5 PM SOS Red Button** at the top of the screen and run 4 rounds of 4-4-4-4 Box Breathing with me right now.`,
    };
  }

  // General grounded fallback using retrieved Playbooks
  return {
    usedLiveGemini: false,
    citations,
    text: `I hear you loud and clear, mate. You're on **Day ${streakDays}** in the Forge, and showing up here instead of bottling it up is how real resilience is built.

Here is the grounded game plan based on your **Ironclad Playbooks**:
1. **Check Your HALT Baseline First:** Are you **H**ungry, **A**ngry, **L**onely, or **T**ired right now? Nine times out of ten, fixing blood sugar (getting 35g+ of protein and complex carbs in you) and hydrating takes the sharp edge off within 20 minutes.
2. **Protect Tonight's Pillow:** Whatever happened on shift or at work today is done. Your only job between now and when your head hits the pillow is keeping your word to yourself for this 24-hour block.
3. **Use the Vault:** Check the cited Playbook badges below—we've got the exact day-by-day neurotransmitter timeline in **Playbook 1**, the **£40 Aldi/Tesco Mood-Food blueprint in Playbook 2**, and the **CBT Trigger Reframe tool in Playbook 4**.

Tell me what's happening right now—are you dealing with a craving, planning food for the week, or navigating work/family pressure?`,
  };
}

/**
 * Webhook Service Module for n8n, Twenty CRM, and DocuSeal
 */
export async function fireIroncladWebhook(
  event: WebhookLogItem['event'],
  payload: Record<string, unknown>,
  config: IntegrationConfig
): Promise<WebhookLogItem> {
  const timestamp = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const envelope = {
    source: 'ironclad-mindset-pwa',
    version: '1.0.0',
    event,
    dispatchedAtISO: new Date().toISOString(),
    crmTarget: config.twentyCrmWebhookUrl ? 'Twenty CRM Live' : 'Twenty CRM Schema Ready',
    docuSealHook: config.docuSealEmbedUrl,
    data: payload,
  };

  let status: WebhookLogItem['status'] = '200 OK (Local Sandbox)';

  if (config.n8nWebhookUrl) {
    try {
      const res = await fetch(config.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
      });
      if (res.ok) {
        status = '200 OK (Live)';
      }
    } catch (err) {
      console.warn('Webhook live POST fell back to sandbox log:', err);
    }
  }

  const logEntry: WebhookLogItem = {
    id: `wh-${Date.now()}`,
    timestamp,
    event,
    destination: event === 'DOCUSEAL_POLICY_SIGNOFF' ? 'DocuSeal + n8n' : 'n8n + Twenty CRM',
    status,
    payloadPreview: JSON.stringify(envelope, null, 2),
  };

  const existing = loadPersisted<WebhookLogItem[]>('webhook_logs', []);
  savePersisted('webhook_logs', [logEntry, ...existing].slice(0, 20));

  return logEntry;
}
