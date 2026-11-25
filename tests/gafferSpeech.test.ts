import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_GAFFER_VOICE_PREFS,
  loadGafferVoicePrefs,
  prepareTextForUkSpeech,
  rankUkVoices,
  saveGafferVoicePrefs,
  selectBestUkVoice,
  SpeechVoiceLike,
  splitIntoSpeechSentences,
} from '../src/services/gafferSpeech';

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

describe('The Gaffer UK English Speech Engine', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('prioritizes warm, natural British female voices over US, male, and robotic voices', () => {
    const sampleVoices: SpeechVoiceLike[] = [
      { name: 'eSpeak English (Great Britain)', lang: 'en-GB', voiceURI: 'espeak-uk' },
      { name: 'Microsoft David - English (United States)', lang: 'en-US', voiceURI: 'us-david' },
      { name: 'Google UK English Male', lang: 'en-GB', voiceURI: 'google-uk-male' },
      { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'google-uk-female' },
      { name: 'Microsoft Sonia Online (Natural) - English (United Kingdom)', lang: 'en-GB', voiceURI: 'ms-sonia' },
      { name: 'French Voice', lang: 'fr-FR', voiceURI: 'fr-1' },
    ];

    const ranked = rankUkVoices(sampleVoices);
    expect(ranked.some((v) => v.lang === 'fr-FR')).toBe(false);
    expect(ranked[0].voiceURI).toBe('ms-sonia');
    expect(ranked[1].voiceURI).toBe('google-uk-female');

    const best = selectBestUkVoice(sampleVoices);
    expect(best?.voiceURI).toBe('ms-sonia');
  });

  it('respects an explicitly selected voiceURI when present', () => {
    const sampleVoices: SpeechVoiceLike[] = [
      { name: 'Microsoft Sonia Online (Natural)', lang: 'en-GB', voiceURI: 'ms-sonia' },
      { name: 'Serena (Enhanced)', lang: 'en-GB', voiceURI: 'apple-serena' },
    ];

    const selected = selectBestUkVoice(sampleVoices, 'apple-serena');
    expect(selected?.voiceURI).toBe('apple-serena');
  });

  it('normalizes UK currency, percentages, times, markdown, and UK helplines for natural speech', () => {
    const raw =
      "Good shout, mate. **Step 1** at 5pm: cook a £1.85 skillet (or stick to the £40 weekly shop) with a 0.0% spritz.\n• Call NHS 111 or Samaritans on 116 123 — you're not alone.";

    const spoken = prepareTextForUkSpeech(raw);
    expect(spoken).not.toContain('**');
    expect(spoken).not.toContain('•');
    expect(spoken).toContain('5 p.m.');
    expect(spoken).toContain('1 pound 85');
    expect(spoken).toContain('40 pounds');
    expect(spoken).toContain('zero point zero percent');
    expect(spoken).toContain('N H S 1 1 1');
    expect(spoken).toContain('1 1 6, 1 2 3');
  });

  it('splits prepared speech text into natural sentences for low-latency playback', () => {
    const text =
      "I hear you, mate. Finishing a brutal shift leaves your nervous system wired. Pause for 60 seconds and run the Craving Reset below.";
    const sentences = splitIntoSpeechSentences(text);
    expect(sentences.length).toBe(3);
    expect(sentences[0]).toBe('I hear you, mate.');
  });

  it('persists and loads Gaffer voice preferences safely', () => {
    expect(loadGafferVoicePrefs()).toEqual(DEFAULT_GAFFER_VOICE_PREFS);

    saveGafferVoicePrefs({
      voiceURI: 'apple-serena',
      rate: 1.05,
      pitch: 1.0,
      autoSpeak: false,
    });

    expect(loadGafferVoicePrefs()).toEqual({
      voiceURI: 'apple-serena',
      rate: 1.05,
      pitch: 1.0,
      autoSpeak: false,
    });
  });
});
