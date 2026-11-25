/**
 * VoiceEngine Abstraction Layer (/src/services/voiceEngine.ts)
 *
 * Provides a clean, provider-agnostic voice adapter for Pippa:
 * - Maps raw browser SpeechSynthesis voices to clean human labels (never exposes raw strings like "Google UK English Female [UK]")
 * - Wraps browser-native Kokoro-82M neural TTS (kokoro-js) + Web Speech API fallback
 * - Exposes clean drop-in hooks for `phonon-tts` (WASM/WebGPU) and `pipecat` real-time voice streaming
 * - Supports optional local Voicebox server (http://127.0.0.1:17493)
 */

import {
  createUkSpeechRecognizer,
  getInstalledSpeechVoices,
  KokoroUkVoiceId,
  loadPippaVoicePrefs,
  NeuralModelStatus,
  PippaVoiceEngine,
  PippaVoicePreferences,
  preloadNeuralUkVoice,
  savePippaVoicePrefs,
  speakUkText,
  stopUkSpeech,
  subscribeNeuralModelStatus,
  UkRecognizerController,
  unlockPippaAudioContext,
} from './pippaSpeech';

export interface CleanVoicePersonaOption {
  id: string;
  label: string;
  gender: 'female' | 'male';
  neuralVoiceId: KokoroUkVoiceId;
  browserKeywords: string[];
  description: string;
}

/**
 * Clean human-friendly British voice presets (zero raw OS/browser voice strings).
 */
export const CLEAN_BRITISH_VOICE_PRESETS: CleanVoicePersonaOption[] = [
  {
    id: 'uk-female-warm',
    label: 'British Female — Warm (Pippa)',
    gender: 'female',
    neuralVoiceId: 'bf_emma',
    browserKeywords: ['sonia', 'emma', 'google uk english female', 'serena', 'kate'],
    description: 'Upbeat, clear, grounded UK recovery coach (default)',
  },
  {
    id: 'uk-female-calm',
    label: 'British Female — Calm',
    gender: 'female',
    neuralVoiceId: 'bf_isabella',
    browserKeywords: ['libby', 'martha', 'hazel', 'fiona', 'stephanie'],
    description: 'Steady, soothing British voice for 3am & high stress',
  },
  {
    id: 'uk-female-friendly',
    label: 'British Female — Bright',
    gender: 'female',
    neuralVoiceId: 'bf_alice',
    browserKeywords: ['maisie', 'alice', 'claire', 'amy'],
    description: 'Crisp, encouraging conversational UK voice',
  },
  {
    id: 'uk-male-grounded',
    label: 'British Male — Grounded',
    gender: 'male',
    neuralVoiceId: 'bf_emma', // Neural female default unless browser male selected
    browserKeywords: ['ryan', 'george', 'daniel', 'oliver', 'google uk english male', 'arthur'],
    description: 'Calm, practical British male coach tone',
  },
];

export interface ExternalVoiceHooks {
  /** Optional drop-in hook for phonon-tts local WASM/WebGPU synthesis */
  phononSpeak?: (text: string, personaId: string) => Promise<void>;
  /** Optional drop-in hook for pipecat low-latency two-way voice streaming */
  pipecatStreamStart?: (onTranscript: (text: string, isFinal: boolean) => void) => Promise<() => void>;
}

export interface VoiceEngineAdapter {
  id: 'web-speech-and-kokoro' | 'phonon-tts' | 'pipecat';
  getPreferences: () => PippaVoicePreferences;
  savePreferences: (patch: Partial<PippaVoicePreferences>) => PippaVoicePreferences;
  getPresets: () => CleanVoicePersonaOption[];
  resolveBrowserVoiceURIForPreset: (
    presetId: string,
    voices?: SpeechSynthesisVoice[]
  ) => string;
  speak: (params: {
    text: string;
    presetId?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }) => () => void;
  stopSpeaking: () => void;
  preloadNeural: () => Promise<boolean>;
  subscribeNeuralStatus: (cb: (status: NeuralModelStatus) => void) => () => void;
  createRecognizer: typeof createUkSpeechRecognizer;
  unlockAudio: () => void;
}

export function resolveBrowserVoiceForCleanPreset(
  presetId: string,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const preset =
    CLEAN_BRITISH_VOICE_PRESETS.find((p) => p.id === presetId) ||
    CLEAN_BRITISH_VOICE_PRESETS[0];

  const ukVoices = voices.filter((v) =>
    (v.lang || '').replace('_', '-').toLowerCase().startsWith('en-gb')
  );
  const pool = ukVoices.length > 0 ? ukVoices : voices;

  for (const kw of preset.browserKeywords) {
    const match = pool.find((v) => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  return pool[0] || null;
}

export function createVoiceEngineAdapter(
  hooks?: ExternalVoiceHooks
): VoiceEngineAdapter {
  return {
    id: hooks?.pipecatStreamStart
      ? 'pipecat'
      : hooks?.phononSpeak
        ? 'phonon-tts'
        : 'web-speech-and-kokoro',
    getPreferences: () => loadPippaVoicePrefs(),
    savePreferences: (patch) => {
      const current = loadPippaVoicePrefs();
      const next = { ...current, ...patch };
      savePippaVoicePrefs(next);
      return next;
    },
    getPresets: () => CLEAN_BRITISH_VOICE_PRESETS,
    resolveBrowserVoiceURIForPreset: (presetId, voices) => {
      const list = voices ?? getInstalledSpeechVoices();
      return resolveBrowserVoiceForCleanPreset(presetId, list)?.voiceURI || '';
    },
    speak: ({ text, presetId, onStart, onEnd, onError }) => {
      if (hooks?.phononSpeak) {
        onStart?.();
        void hooks
          .phononSpeak(text, presetId || 'uk-female-warm')
          .then(() => onEnd?.())
          .catch(() => {
            onError?.('Phonon TTS playback failed; switching to fallback.');
            onEnd?.();
          });
        return () => stopUkSpeech();
      }

      const prefs = loadPippaVoicePrefs();
      const voices = getInstalledSpeechVoices();
      const preset = CLEAN_BRITISH_VOICE_PRESETS.find((p) => p.id === presetId);
      const effectiveEngine: PippaVoiceEngine =
        preset?.gender === 'male' && prefs.engine === 'neural'
          ? 'browser'
          : prefs.engine;
      const effectivePrefs: PippaVoicePreferences = {
        ...prefs,
        engine: effectiveEngine,
        neuralVoiceId: preset?.neuralVoiceId || prefs.neuralVoiceId,
        browserVoiceURI:
          (presetId
            ? resolveBrowserVoiceForCleanPreset(presetId, voices)?.voiceURI
            : '') || prefs.browserVoiceURI,
      };

      return speakUkText({
        text,
        prefs: effectivePrefs,
        voices,
        onStart,
        onEnd,
        onError,
      });
    },
    stopSpeaking: () => stopUkSpeech(),
    preloadNeural: async () => {
      const inst = await preloadNeuralUkVoice();
      return inst !== null;
    },
    subscribeNeuralStatus: (cb) => subscribeNeuralModelStatus(cb),
    createRecognizer: (opts): UkRecognizerController | null =>
      createUkSpeechRecognizer(opts),
    unlockAudio: () => unlockPippaAudioContext(),
  };
}
