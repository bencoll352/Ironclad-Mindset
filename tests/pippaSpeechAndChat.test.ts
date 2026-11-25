import { beforeEach, describe, expect, it } from 'vitest';
import {
  generateBuiltInCompanionResponse,
  requestCornermanCompanion,
} from '../src/services/cornermanEngine';
import {
  DEFAULT_PIPPA_VOICE_PREFS,
  KOKORO_UK_FEMALE_VOICES,
  loadPippaVoicePrefs,
  prepareTextForUkSpeech,
  rankUkVoices,
  savePippaVoicePrefs,
  selectBestUkVoice,
  SpeechVoiceLike,
  splitIntoSpeechSentences,
} from '../src/services/pippaSpeech';

const storageMap = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => {
    storageMap.set(k, String(v));
  },
  removeItem: (k: string) => {
    storageMap.delete(k);
  },
  clear: () => {
    storageMap.clear();
  },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
  get length() {
    return storageMap.size;
  },
};

describe('Pippa UK English Speech Engine', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('defaults to built-in Kokoro neural UK female voice (bf_emma) with optional Voicebox URL', () => {
    expect(DEFAULT_PIPPA_VOICE_PREFS.engine).toBe('neural');
    expect(DEFAULT_PIPPA_VOICE_PREFS.neuralVoiceId).toBe('bf_emma');
    expect(DEFAULT_PIPPA_VOICE_PREFS.voiceboxUrl).toBe('http://127.0.0.1:17493');
    expect(KOKORO_UK_FEMALE_VOICES.every((v) => v.id.startsWith('bf_'))).toBe(true);
  });

  it('prioritizes warm, natural British female browser voices for fallback', () => {
    const sampleVoices: SpeechVoiceLike[] = [
      { name: 'eSpeak English (Great Britain)', lang: 'en-GB', voiceURI: 'espeak-uk' },
      { name: 'Microsoft David - English (United States)', lang: 'en-US', voiceURI: 'us-david' },
      { name: 'Google UK English Male', lang: 'en-GB', voiceURI: 'google-uk-male' },
      { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'google-uk-female' },
      { name: 'Microsoft Sonia Online (Natural) - English (United Kingdom)', lang: 'en-GB', voiceURI: 'ms-sonia' },
    ];

    const ranked = rankUkVoices(sampleVoices);
    expect(ranked[0].voiceURI).toBe('ms-sonia');
    expect(ranked[1].voiceURI).toBe('google-uk-female');
    expect(selectBestUkVoice(sampleVoices)?.voiceURI).toBe('ms-sonia');
  });

  it('normalizes UK currency, percentages, times, and helplines for human speech', () => {
    const raw =
      "Step 1 at 5pm: cook a £1.85 skillet (or stick to the £40 weekly shop) with a 0.0% spritz.\n• Call NHS 111 or Samaritans on 116 123.";
    const spoken = prepareTextForUkSpeech(raw);
    expect(spoken).toContain('5 p.m.');
    expect(spoken).toContain('1 pound 85');
    expect(spoken).toContain('40 pounds');
    expect(spoken).toContain('zero point zero percent');
    expect(spoken).toContain('N H S 1 1 1');
    expect(spoken).toContain('1 1 6, 1 2 3');
  });

  it('splits speech into low-latency sentences', () => {
    const sentences = splitIntoSpeechSentences(
      'I hear you, mate. Finishing a brutal shift leaves your nervous system wired. Pause for 60 seconds.'
    );
    expect(sentences.length).toBe(3);
  });

  it('persists and loads Pippa voice preferences safely', () => {
    savePippaVoicePrefs({
      ...DEFAULT_PIPPA_VOICE_PREFS,
      engine: 'voicebox',
      voiceboxProfileId: 'prof-123',
      neuralVoiceId: 'bf_alice',
    });
    const loaded = loadPippaVoicePrefs();
    expect(loaded.engine).toBe('voicebox');
    expect(loaded.voiceboxProfileId).toBe('prof-123');
    expect(loaded.neuralVoiceId).toBe('bf_alice');
  });
});

describe('Pippa Multi-Turn Interactive Conversation Engine', () => {
  it('handles multi-turn back-and-forth without repeating the same reply', () => {
    const history: { role: 'user' | 'cornerman'; text: string }[] = [];

    // Turn 1: Greeting
    history.push({ role: 'user', text: 'Hey Pippa, how are you?' });
    const r1 = generateBuiltInCompanionResponse(history);
    expect(r1.citations.length).toBe(0);
    history.push({ role: 'cornerman', text: r1.reply });

    // Turn 2: Craving after shift
    history.push({
      role: 'user',
      text: "Just finished a brutal shift and I'm really tempted to hit the pub.",
    });
    const r2 = generateBuiltInCompanionResponse(history);
    expect(r2.action).toBe('START_CRAVING_RESET');
    expect(r2.reply).not.toBe(r1.reply);
    history.push({ role: 'cornerman', text: r2.reply });

    // Turn 3: Follow-up answer ("no, I already ate" or "yes")
    history.push({ role: 'user', text: 'already ate' });
    const r3 = generateBuiltInCompanionResponse(history);
    expect(r3.reply).not.toBe(r2.reply);
    expect(r3.reply.toLowerCase()).toContain('1 to 10');
    history.push({ role: 'cornerman', text: r3.reply });

    // Turn 4: Rating reply ("8 out of 10")
    history.push({ role: 'user', text: '8 out of 10' });
    const r4 = generateBuiltInCompanionResponse(history);
    expect(r4.reply).toContain('8 out of 10');
    expect(r4.reply).not.toBe(r3.reply);
    history.push({ role: 'cornerman', text: r4.reply });

    // Turn 5: Gratitude ("cheers Pippa, that helped")
    history.push({ role: 'user', text: 'Cheers Pippa, that helped' });
    const r5 = generateBuiltInCompanionResponse(history);
    expect(r5.reply).not.toBe(r4.reply);
    expect(r5.reply.toLowerCase()).not.toContain('popped in');
    expect(
      r5.reply.toLowerCase().includes('anytime') ||
        r5.reply.toLowerCase().includes('edge off')
    ).toBe(true);
  });

  it('handles open-ended personal conversation dynamically without canned repetition', () => {
    const r1 = generateBuiltInCompanionResponse([
      { role: 'user', text: 'My landlord is raising the rent next month' },
    ]);
    expect(r1.reply.toLowerCase()).toContain('landlord');

    const r2 = generateBuiltInCompanionResponse([
      { role: 'user', text: 'My landlord is raising the rent next month' },
      { role: 'cornerman', text: r1.reply },
      { role: 'user', text: 'Waiting for my MOT result at the garage' },
    ]);
    expect(r2.reply.toLowerCase()).toContain('waiting for my mot');
    expect(r2.reply).not.toBe(r1.reply);
  });

  it('preserves safety escalations and Promptfoo contracts', async () => {
    const withdrawal = await requestCornermanCompanion({
      messages: [
        { role: 'user', text: 'My hands are shaking badly after stopping cold turkey' },
      ],
      streakDays: 3,
    });
    expect(withdrawal.providerStatus).toBe('safety_escalation');
    expect(withdrawal.action).toBe('VIEW_LIFELINES');
    expect(withdrawal.reply).toContain('NHS 111');

    const outage = await requestCornermanCompanion({
      messages: [{ role: 'user', text: '5pm craving hit after work' }],
      streakDays: 3,
      forceProviderUnavailable: true,
    });
    expect(outage.statusNotice).toContain('unavailable');
    expect(outage.action).toBe('START_CRAVING_RESET');
  });
});
