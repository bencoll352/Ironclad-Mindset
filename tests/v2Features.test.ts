import { describe, expect, it } from 'vitest';
import { requestCornermanCompanion } from '../src/services/cornermanEngine';
import {
  analyzePatternRadar,
  ILLUSTRATIVE_TREND_SAMPLE,
} from '../src/services/patternRadar';
import { searchIroncladResources } from '../src/services/searchIndex';
import {
  CLEAN_BRITISH_VOICE_PRESETS,
  createVoiceEngineAdapter,
  resolveBrowserVoiceForCleanPreset,
} from '../src/services/voiceEngine';

describe('Ironclad v2.0 Pattern Radar Analytics', () => {
  it('returns illustrative sample fallback state when 0 check-ins exist', () => {
    const summary = analyzePatternRadar([]);
    expect(summary.hasRealData).toBe(false);
    expect(summary.headlineInsight).toContain('illustrative 7-day curve');
    expect(ILLUSTRATIVE_TREND_SAMPLE.length).toBe(7);
  });

  it('detects Friday high-craving triggers and strongest coping move locally', () => {
    const summary = analyzePatternRadar([
      {
        date: '2026-11-20', // Friday
        trackId: 'alcohol',
        alcoholFree: true,
        cravingIntensity: 8,
        mood: 5,
        trigger: 'After-shift fatigue',
        whatHelped: 'Move the Iron',
        completedTasks: 3,
        updatedAt: '2026-11-20T18:00:00Z',
      },
      {
        date: '2026-11-13', // Friday
        trackId: 'gambling',
        alcoholFree: true,
        cravingIntensity: 7,
        mood: 6,
        trigger: 'After-shift fatigue',
        whatHelped: 'Move the Iron',
        completedTasks: 2,
        updatedAt: '2026-11-13T18:00:00Z',
      },
      {
        date: '2026-11-18', // Wednesday
        trackId: 'alcohol',
        alcoholFree: true,
        cravingIntensity: 3,
        mood: 8,
        trigger: 'Quiet evening alone',
        whatHelped: 'Cooked a proper meal',
        completedTasks: 3,
        updatedAt: '2026-11-18T20:00:00Z',
      },
    ]);

    expect(summary.hasRealData).toBe(true);
    expect(summary.topTrigger).toBe('After-shift fatigue');
    expect(summary.bestCopingTool).toBe('Move the Iron');
    expect(summary.fridayHighCravingRatePct).toBe(100);
    expect(summary.headlineInsight).toContain('Fridays');
  });
});

describe('Ironclad v2.0 Offline Orama Search Index', () => {
  it('finds Playbook 6, recipes, exercises, and UK lifelines', async () => {
    const pbResults = await searchIroncladResources('Chimp Mind Management', 'Playbook');
    expect(pbResults.some((r) => r.id === 'playbook-6')).toBe(true);

    const recipeResults = await searchIroncladResources('Mackerel');
    expect(recipeResults.some((r) => r.kind === 'Recipe')).toBe(true);

    const moveResults = await searchIroncladResources('Bodyweight');
    expect(moveResults.some((r) => r.moduleId === 'move')).toBe(true);

    const lifelineResults = await searchIroncladResources('GamCare');
    expect(lifelineResults.some((r) => r.kind === 'Lifeline')).toBe(true);
  });
});

describe('Ironclad v2.0 VoiceEngine Clean British Presets', () => {
  it('exposes clean human labels without raw OS voice strings', () => {
    expect(CLEAN_BRITISH_VOICE_PRESETS.length).toBeGreaterThanOrEqual(2);
    for (const p of CLEAN_BRITISH_VOICE_PRESETS) {
      expect(p.label).not.toMatch(/Google UK|\[UK\]|Microsoft/i);
    }

    const fakeVoices = [
      { name: 'Google UK English Male', lang: 'en-GB', voiceURI: 'gb-m' },
      { name: 'Microsoft Sonia Online - English (United Kingdom)', lang: 'en-GB', voiceURI: 'gb-f' },
    ] as SpeechSynthesisVoice[];

    expect(
      resolveBrowserVoiceForCleanPreset('uk-female-warm', fakeVoices)?.voiceURI
    ).toBe('gb-f');
    expect(
      resolveBrowserVoiceForCleanPreset('uk-male-grounded', fakeVoices)?.voiceURI
    ).toBe('gb-m');

    const adapter = createVoiceEngineAdapter();
    expect(adapter.id).toBe('web-speech-and-kokoro');
  });
});

describe('Ironclad v2.0 Cross-Addiction Coaching (Pippa)', () => {
  it('coaches across gambling, smoking/vaping, and cocaine triggers cleanly', async () => {
    const gamblingReply = await requestCornermanCompanion({
      messages: [{ role: 'user', text: 'Payday / Matchday gambling urge' }],
      streakDays: 5,
    });
    expect(gamblingReply.reply).toMatch(/GAMSTOP|GamCare|0808/i);
    expect(gamblingReply.action).toBe('START_CRAVING_RESET');

    const smokeReply = await requestCornermanCompanion({
      messages: [{ role: 'user', text: '3-min smoke / vape craving' }],
      streakDays: 5,
    });
    expect(smokeReply.reply).toMatch(/3|180|nicotine|water/i);
    expect(smokeReply.action).toBe('START_CRAVING_RESET');

    const drugReply = await requestCornermanCompanion({
      messages: [{ role: 'user', text: 'Night-out / cocaine trigger' }],
      streakDays: 5,
    });
    expect(drugReply.reply).toMatch(/FRANK|0300 123 6600|Move the Iron|leave/i);
  });
});
