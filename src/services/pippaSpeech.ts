/**
 * Pippa UK English Speech & Real-Time Voice Conversation Engine
 *
 * Supports three voice backends seamlessly:
 * 1. "neural" (Default): Built-in Kokoro-82M neural UK female TTS running locally in the browser
 *    via WebGPU/WASM (human quality, zero server required, cached in browser after one-time download).
 * 2. "voicebox": Optional local Voicebox server (https://github.com/jamiepine/voicebox)
 *    at http://127.0.0.1:17493 for cloned/Chatterbox/Qwen3/Kokoro voices.
 * 3. "browser": Instant zero-download system UK English (en-GB) speechSynthesis fallback.
 */

export type PippaVoiceEngine = 'neural' | 'voicebox' | 'browser';

export type KokoroUkVoiceId = 'bf_emma' | 'bf_isabella' | 'bf_alice' | 'bf_lily';

export interface KokoroUkVoiceOption {
  id: KokoroUkVoiceId;
  label: string;
  description: string;
}

export const KOKORO_UK_FEMALE_VOICES: KokoroUkVoiceOption[] = [
  {
    id: 'bf_emma',
    label: 'Emma (UK Female · Warm & Clear)',
    description: 'Default upbeat, grounded British female coach voice',
  },
  {
    id: 'bf_alice',
    label: 'Alice (UK Female · Bright & Friendly)',
    description: 'Crisp, encouraging British conversational tone',
  },
  {
    id: 'bf_isabella',
    label: 'Isabella (UK Female · Calm & Steady)',
    description: 'Relaxed, grounding British tone for late nights',
  },
  {
    id: 'bf_lily',
    label: 'Lily (UK Female · Gentle & Supportive)',
    description: 'Soft, reassuring British voice for stressful moments',
  },
];

export interface VoiceboxProfile {
  id: string;
  name: string;
  language?: string;
}

export interface PippaVoicePreferences {
  engine: PippaVoiceEngine;
  neuralVoiceId: KokoroUkVoiceId;
  voiceboxUrl: string;
  voiceboxProfileId: string;
  browserVoiceURI: string;
  rate: number; // 0.85 - 1.2
  pitch: number; // 0.92 - 1.1
  autoSpeak: boolean;
}

export const DEFAULT_PIPPA_VOICE_PREFS: PippaVoicePreferences = {
  engine: 'neural',
  neuralVoiceId: 'bf_emma',
  voiceboxUrl: 'http://127.0.0.1:17493',
  voiceboxProfileId: '',
  browserVoiceURI: '',
  rate: 1.0,
  pitch: 1.02,
  autoSpeak: true,
};

const VOICE_PREFS_STORAGE_KEY = 'ironclad_mindset_v1_pippa_voice_prefs';

export function loadPippaVoicePrefs(): PippaVoicePreferences {
  try {
    const raw = localStorage.getItem(VOICE_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PIPPA_VOICE_PREFS;
    const parsed = JSON.parse(raw) as Partial<PippaVoicePreferences>;
    const validEngine: PippaVoiceEngine =
      parsed.engine === 'neural' ||
      parsed.engine === 'voicebox' ||
      parsed.engine === 'browser'
        ? parsed.engine
        : DEFAULT_PIPPA_VOICE_PREFS.engine;
    const validNeuralVoice: KokoroUkVoiceId = KOKORO_UK_FEMALE_VOICES.some(
      (v) => v.id === parsed.neuralVoiceId
    )
      ? (parsed.neuralVoiceId as KokoroUkVoiceId)
      : DEFAULT_PIPPA_VOICE_PREFS.neuralVoiceId;

    return {
      engine: validEngine,
      neuralVoiceId: validNeuralVoice,
      voiceboxUrl:
        typeof parsed.voiceboxUrl === 'string' && parsed.voiceboxUrl.trim()
          ? parsed.voiceboxUrl.trim()
          : DEFAULT_PIPPA_VOICE_PREFS.voiceboxUrl,
      voiceboxProfileId:
        typeof parsed.voiceboxProfileId === 'string'
          ? parsed.voiceboxProfileId
          : '',
      browserVoiceURI:
        typeof parsed.browserVoiceURI === 'string' ? parsed.browserVoiceURI : '',
      rate:
        typeof parsed.rate === 'number' && parsed.rate >= 0.75 && parsed.rate <= 1.35
          ? parsed.rate
          : DEFAULT_PIPPA_VOICE_PREFS.rate,
      pitch:
        typeof parsed.pitch === 'number' && parsed.pitch >= 0.8 && parsed.pitch <= 1.25
          ? parsed.pitch
          : DEFAULT_PIPPA_VOICE_PREFS.pitch,
      autoSpeak:
        typeof parsed.autoSpeak === 'boolean'
          ? parsed.autoSpeak
          : DEFAULT_PIPPA_VOICE_PREFS.autoSpeak,
    };
  } catch {
    return DEFAULT_PIPPA_VOICE_PREFS;
  }
}

export function savePippaVoicePrefs(prefs: PippaVoicePreferences): void {
  try {
    localStorage.setItem(VOICE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota issues
  }
}

export interface SpeechVoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  localService?: boolean;
  default?: boolean;
}

const UK_FEMALE_VOICE_NAMES = [
  'sonia',
  'libby',
  'maisie',
  'google uk english female',
  'serena',
  'kate',
  'martha',
  'stephanie',
  'hazel',
  'susan',
  'emma',
  'amy',
  'fiona',
  'charlotte',
  'claire',
  'lucy',
  'alice',
  'pippa',
  'female',
];

const UK_MALE_VOICE_NAMES = [
  'ryan',
  'thomas',
  'oliver',
  'daniel',
  'george',
  'arthur',
  'alfie',
  'elliot',
  'google uk english male',
  'male',
];

function isUkEnglishLang(lang: string): boolean {
  const normalized = (lang || '').replace('_', '-').toLowerCase();
  return normalized === 'en-gb' || normalized.startsWith('en-gb-');
}

function isEnglishLang(lang: string): boolean {
  const normalized = (lang || '').replace('_', '-').toLowerCase();
  return normalized === 'en' || normalized.startsWith('en-');
}

export function scoreUkVoice(voice: SpeechVoiceLike): number {
  const nameLower = (voice.name || '').toLowerCase();
  const isUk = isUkEnglishLang(voice.lang);
  const isEn = isEnglishLang(voice.lang);

  if (!isEn) return -1000;

  let score = isUk ? 200 : 10;

  if (/\b(natural|neural|online|premium|enhanced|siri|google)\b/i.test(nameLower)) {
    score += 120;
  }

  if (nameLower.includes('sonia')) score += 90;
  if (nameLower.includes('libby')) score += 85;
  if (nameLower.includes('google uk english female')) score += 82;
  if (nameLower.includes('serena') || nameLower.includes('kate') || nameLower.includes('martha')) {
    score += 78;
  }
  if (nameLower.includes('hazel') || nameLower.includes('maisie') || nameLower.includes('stephanie')) {
    score += 74;
  }

  const looksFemale = UK_FEMALE_VOICE_NAMES.some((n) => nameLower.includes(n));
  const looksMale = UK_MALE_VOICE_NAMES.some((n) => nameLower.includes(n));

  if (looksFemale) {
    score += 60;
  } else if (looksMale) {
    score -= 25;
  }

  if (/\b(espeak|festival|mbrola|flite|android)\b/i.test(nameLower)) {
    score -= 80;
  }

  return score;
}

export function rankUkVoices<T extends SpeechVoiceLike>(voices: T[]): T[] {
  return [...voices]
    .filter((v) => isEnglishLang(v.lang))
    .sort((a, b) => scoreUkVoice(b) - scoreUkVoice(a));
}

export function selectBestUkVoice<T extends SpeechVoiceLike>(
  voices: T[],
  preferredVoiceURI?: string
): T | null {
  if (!voices.length) return null;

  if (preferredVoiceURI) {
    const exact = voices.find((v) => v.voiceURI === preferredVoiceURI);
    if (exact) return exact;
  }

  const ranked = rankUkVoices(voices);
  return ranked[0] ?? voices[0] ?? null;
}

export function formatVoiceLabel(voice: SpeechVoiceLike): string {
  const cleanName = voice.name
    .replace(/^Microsoft\s+/i, '')
    .replace(/\s*Online\s*\(Natural\)/i, ' (Natural)')
    .replace(/\s*-\s*English\s*\(United Kingdom\)/i, '')
    .trim();
  const tag = isUkEnglishLang(voice.lang) ? 'UK' : voice.lang;
  return `${cleanName} [${tag}]`;
}

/**
 * Converts markdown/app text into clean, natural spoken UK English.
 */
export function prepareTextForUkSpeech(rawText: string): string {
  let text = String(rawText || '');

  text = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');

  text = text.replace(/^\s*[•*-]\s+/gm, '');
  text = text.replace(/^\s*(\d+)\.\s+/gm, 'Step $1. ');

  text = text.replace(/(\d+)\s*[–-]\s*(\d+)\s*mins?\b/gi, '$1 to $2 minutes');
  text = text.replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes');

  text = text.replace(/£(\d+)\.(\d{2})/g, (_, pounds, pence) => {
    const pNum = Number(pounds);
    return `${pNum} ${pNum === 1 ? 'pound' : 'pounds'} ${pence}`;
  });
  text = text.replace(/£(\d+)/g, (_, pounds) => {
    const pNum = Number(pounds);
    return `${pNum} ${pNum === 1 ? 'pound' : 'pounds'}`;
  });

  text = text.replace(/\b0\.0%/g, 'zero point zero percent');
  text = text.replace(/\b(\d{1,2}):(\d{2})\s*(am|pm)\b/gi, '$1:$2 $3');
  text = text.replace(/\b(\d{1,2})\s*(am|pm)\b/gi, (_, h, meridiem) => {
    const spaced = meridiem.toLowerCase() === 'pm' ? 'p.m.' : 'a.m.';
    return `${h} ${spaced}`;
  });

  text = text.replace(/\bNHS\s*111\b/gi, 'N H S 1 1 1');
  text = text.replace(/\b116\s*123\b/g, '1 1 6, 1 2 3');
  text = text.replace(/\b0800\s*58\s*58\s*58\b/g, '0 800, 5 8, 5 8, 5 8');
  text = text.replace(/\b85258\b/g, '8 5 2 5 8');
  text = text.replace(/\b999\b/g, '9 9 9');
  text = text.replace(/\bCBT\b/g, 'C B T');
  text = text.replace(/\bA&E\b/g, 'A and E');

  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, '. ');
  text = text.replace(/\.\s*\./g, '.');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

export function splitIntoSpeechSentences(spokenText: string): string[] {
  const cleaned = spokenText.trim();
  if (!cleaned) return [];

  const rawChunks = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /[a-z0-9]/i.test(s));

  const merged: string[] = [];
  for (const chunk of rawChunks) {
    if (merged.length > 0 && merged[merged.length - 1].length < 12) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${chunk}`;
    } else {
      merged.push(chunk);
    }
  }

  return merged.length > 0 ? merged : [cleaned];
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function isNeuralTtsEnvironmentSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof WebAssembly !== 'undefined' &&
    ('AudioContext' in window || 'webkitAudioContext' in window)
  );
}

// ============================================================================
// KOKORO-82M IN-BROWSER NEURAL UK VOICE LOADER & WEB AUDIO PLAYBACK
// ============================================================================

export type NeuralModelState = 'idle' | 'loading' | 'ready' | 'error';

export interface NeuralModelStatus {
  state: NeuralModelState;
  progress: number; // 0 - 100
  detail: string;
}

interface KokoroInstanceLike {
  generate: (
    text: string,
    opts?: { voice?: KokoroUkVoiceId; speed?: number }
  ) => Promise<{ audio: Float32Array; sampling_rate: number }>;
}

let kokoroInstance: KokoroInstanceLike | null = null;
let kokoroLoadPromise: Promise<KokoroInstanceLike> | null = null;
let neuralStatus: NeuralModelStatus = {
  state: 'idle',
  progress: 0,
  detail: 'Neural UK voice not loaded yet',
};
const neuralStatusListeners = new Set<(s: NeuralModelStatus) => void>();

function notifyNeuralStatus(next: NeuralModelStatus) {
  neuralStatus = next;
  neuralStatusListeners.forEach((cb) => cb(next));
}

export function getNeuralModelStatus(): NeuralModelStatus {
  return neuralStatus;
}

export function subscribeNeuralModelStatus(
  cb: (s: NeuralModelStatus) => void
): () => void {
  neuralStatusListeners.add(cb);
  cb(neuralStatus);
  return () => {
    neuralStatusListeners.delete(cb);
  };
}

export function isNeuralModelReady(): boolean {
  return kokoroInstance !== null;
}

export async function preloadNeuralUkVoice(): Promise<KokoroInstanceLike | null> {
  if (kokoroInstance) return kokoroInstance;
  if (!isNeuralTtsEnvironmentSupported()) {
    notifyNeuralStatus({
      state: 'error',
      progress: 0,
      detail: 'WebAssembly / Web Audio unavailable in this browser.',
    });
    return null;
  }

  if (kokoroLoadPromise) {
    return kokoroLoadPromise;
  }

  notifyNeuralStatus({
    state: 'loading',
    progress: 5,
    detail: 'Loading Pippa’s neural UK voice (one-time ~86 MB, cached offline)…',
  });

  kokoroLoadPromise = (async () => {
    try {
      const { KokoroTTS } = await import('kokoro-js');
      const hasWebGpu =
        typeof navigator !== 'undefined' &&
        'gpu' in navigator &&
        Boolean((navigator as { gpu?: unknown }).gpu);

      const fileProgress = new Map<string, number>();

      const tts = await KokoroTTS.from_pretrained(
        'onnx-community/Kokoro-82M-v1.0-ONNX',
        {
          dtype: 'q8',
          device: hasWebGpu ? 'webgpu' : 'wasm',
          progress_callback: (info: { status?: string; file?: string; progress?: number }) => {
            if (typeof info?.progress === 'number' && info.file) {
              fileProgress.set(info.file, info.progress);
              const vals = Array.from(fileProgress.values());
              const avg = Math.round(
                vals.reduce((acc, v) => acc + v, 0) / Math.max(1, vals.length)
              );
              notifyNeuralStatus({
                state: 'loading',
                progress: Math.min(99, Math.max(5, avg)),
                detail: `Downloading neural UK voice (${Math.min(99, Math.max(5, avg))}%)…`,
              });
            }
          },
        }
      );

      kokoroInstance = tts as unknown as KokoroInstanceLike;
      notifyNeuralStatus({
        state: 'ready',
        progress: 100,
        detail: 'Neural UK female voice ready (Kokoro-82M)',
      });
      return kokoroInstance;
    } catch (err) {
      kokoroLoadPromise = null;
      notifyNeuralStatus({
        state: 'error',
        progress: 0,
        detail:
          err instanceof Error
            ? `Neural voice unavailable (${err.message}). Using browser UK voice.`
            : 'Neural voice unavailable. Using browser UK voice.',
      });
      throw err;
    }
  })();

  try {
    return await kokoroLoadPromise;
  } catch {
    return null;
  }
}

let sharedAudioContext: AudioContext | null = null;
let activeAudioSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new Ctor();
  }
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Call inside a user gesture (button click) to ensure Web Audio playback is unlocked on iOS/Chrome.
 */
export function unlockPippaAudioContext(): void {
  getAudioContext();
}

function playFloat32Audio(
  samples: Float32Array,
  sampleRate: number,
  token: number
): Promise<void> {
  return new Promise((resolve) => {
    if (token !== activeSpeakToken) {
      resolve();
      return;
    }
    const ctx = getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }

    try {
      const buffer = ctx.createBuffer(1, samples.length, sampleRate);
      buffer.getChannelData(0).set(samples);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      activeAudioSource = source;
      source.onended = () => {
        if (activeAudioSource === source) {
          activeAudioSource = null;
        }
        resolve();
      };
      source.start();
    } catch {
      resolve();
    }
  });
}

async function playAudioArrayBuffer(
  arrayBuffer: ArrayBuffer,
  token: number
): Promise<void> {
  if (token !== activeSpeakToken) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const decoded = await ctx.decodeAudioData(arrayBuffer);
  if (token !== activeSpeakToken) return;

  await new Promise<void>((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = decoded;
    source.connect(ctx.destination);
    activeAudioSource = source;
    source.onended = () => {
      if (activeAudioSource === source) {
        activeAudioSource = null;
      }
      resolve();
    };
    source.start();
  });
}

// ============================================================================
// LOCAL VOICEBOX INTEGRATION (https://github.com/jamiepine/voicebox)
// ============================================================================

export async function fetchVoiceboxProfiles(
  voiceboxUrl: string
): Promise<VoiceboxProfile[]> {
  const base = (voiceboxUrl || '').replace(/\/$/, '');
  if (!base) return [];
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${base}/profiles`, { signal: controller.signal });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    const list = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { profiles?: unknown[] }).profiles)
        ? (data as { profiles: unknown[] }).profiles
        : [];
    return list
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        id: String(item.id || item.profile_id || ''),
        name: String(item.name || 'Voicebox Profile'),
        language: typeof item.language === 'string' ? item.language : 'en',
      }))
      .filter((p) => p.id.length > 0);
  } catch {
    return [];
  } finally {
    window.clearTimeout(timer);
  }
}

async function generateVoiceboxAudio(
  voiceboxUrl: string,
  profileId: string,
  text: string
): Promise<ArrayBuffer | null> {
  const base = (voiceboxUrl || '').replace(/\/$/, '');
  if (!base || !profileId) return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${base}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        text,
        profile_id: profileId,
        language: 'en',
      }),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = (await res.json()) as { audio_url?: string; id?: string };
      if (json.audio_url) {
        const audioUrl = json.audio_url.startsWith('http')
          ? json.audio_url
          : `${base}${json.audio_url.startsWith('/') ? '' : '/'}${json.audio_url}`;
        const audioRes = await fetch(audioUrl);
        return audioRes.ok ? await audioRes.arrayBuffer() : null;
      }
      if (json.id) {
        const audioRes = await fetch(`${base}/audio/${json.id}`);
        return audioRes.ok ? await audioRes.arrayBuffer() : null;
      }
      return null;
    }
    return await res.arrayBuffer();
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

// ============================================================================
// UNIFIED PLAYBACK & SPEECH RECOGNITION
// ============================================================================

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error?: string; message?: string }) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export function getInstalledSpeechVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    return window.speechSynthesis.getVoices();
  } catch {
    return [];
  }
}

export function subscribeToVoiceList(
  onVoicesReady: (voices: SpeechSynthesisVoice[]) => void
): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};

  const emit = () => {
    const voices = getInstalledSpeechVoices();
    if (voices.length > 0) {
      onVoicesReady(voices);
    }
  };

  emit();

  const synth = window.speechSynthesis;
  const handler = () => emit();
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', handler);
  } else {
    synth.onvoiceschanged = handler;
  }

  const retryTimer = window.setTimeout(emit, 350);

  return () => {
    window.clearTimeout(retryTimer);
    if (typeof synth.removeEventListener === 'function') {
      synth.removeEventListener('voiceschanged', handler);
    } else if (synth.onvoiceschanged === handler) {
      synth.onvoiceschanged = null;
    }
  };
}

let activeSpeakToken = 0;

export function stopUkSpeech(): void {
  activeSpeakToken += 1;
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
      activeAudioSource.disconnect();
    } catch {
      // Ignore already-stopped nodes
    }
    activeAudioSource = null;
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

export interface SpeakUkOptions {
  text: string;
  prefs: PippaVoicePreferences;
  voices?: SpeechSynthesisVoice[];
  onStart?: () => void;
  onSentence?: (sentence: string, index: number, total: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

function speakViaBrowserFallback(
  sentences: string[],
  token: number,
  options: SpeakUkOptions
): void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech playback is not supported in this browser.');
    options.onEnd?.();
    return;
  }

  const availableVoices = options.voices?.length
    ? options.voices
    : getInstalledSpeechVoices();
  const chosenVoice = selectBestUkVoice(
    availableVoices,
    options.prefs.browserVoiceURI
  );

  let started = false;
  let index = 0;

  const speakNext = () => {
    if (token !== activeSpeakToken) return;
    if (index >= sentences.length) {
      options.onEnd?.();
      return;
    }

    const sentence = sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = chosenVoice?.lang || 'en-GB';
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    utterance.rate = options.prefs.rate;
    utterance.pitch = options.prefs.pitch;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (token !== activeSpeakToken) return;
      if (!started) {
        started = true;
        options.onStart?.();
      }
      options.onSentence?.(sentence, index, sentences.length);
    };

    utterance.onend = () => {
      if (token !== activeSpeakToken) return;
      index += 1;
      speakNext();
    };

    utterance.onerror = (ev) => {
      if (token !== activeSpeakToken) return;
      if (ev.error === 'interrupted' || ev.error === 'canceled') {
        return;
      }
      options.onError?.('Could not play UK voice audio on this device.');
      options.onEnd?.();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      options.onError?.('Speech synthesis failed to start.');
      options.onEnd?.();
    }
  };

  speakNext();
}

/**
 * Speaks Pippa's reply using:
 * 1) Local Voicebox server if selected & profile set
 * 2) In-browser Kokoro-82M neural UK female voice (bf_emma / bf_alice / bf_isabella / bf_lily)
 * 3) Instant browser UK speechSynthesis fallback if neural model is still loading or unavailable
 */
export function speakUkText(options: SpeakUkOptions): () => void {
  stopUkSpeech();
  const token = ++activeSpeakToken;
  unlockPippaAudioContext();

  const prepared = prepareTextForUkSpeech(options.text);
  const sentences = splitIntoSpeechSentences(prepared);
  if (sentences.length === 0) {
    options.onEnd?.();
    return () => {};
  }

  const runAsync = async () => {
    // Tier 1: Optional Local Voicebox (jamiepine/voicebox)
    if (
      options.prefs.engine === 'voicebox' &&
      options.prefs.voiceboxProfileId
    ) {
      options.onStart?.();
      for (let i = 0; i < sentences.length; i += 1) {
        if (token !== activeSpeakToken) return;
        options.onSentence?.(sentences[i], i, sentences.length);
        const buf = await generateVoiceboxAudio(
          options.prefs.voiceboxUrl,
          options.prefs.voiceboxProfileId,
          sentences[i]
        );
        if (token !== activeSpeakToken) return;
        if (buf) {
          await playAudioArrayBuffer(buf, token);
        } else {
          // Fall back seamlessly to neural or browser if Voicebox isn't running
          if (i === 0) {
            const tts = kokoroInstance;
            if (tts) {
              const out = await tts.generate(sentences[i], {
                voice: options.prefs.neuralVoiceId,
                speed: options.prefs.rate,
              });
              await playFloat32Audio(out.audio, out.sampling_rate, token);
              continue;
            }
            speakViaBrowserFallback(sentences, token, options);
            return;
          }
        }
      }
      if (token === activeSpeakToken) {
        options.onEnd?.();
      }
      return;
    }

    // Tier 2: Built-in Kokoro-82M Neural UK Female Voice
    if (options.prefs.engine === 'neural') {
      // If not loaded yet, start background download and speak immediately with browser fallback so user never waits
      if (!kokoroInstance) {
        void preloadNeuralUkVoice();
        speakViaBrowserFallback(sentences, token, options);
        return;
      }

      const tts = kokoroInstance;
      options.onStart?.();
      try {
        // Pipeline sentence synthesis: generate next sentence while playing current
        let nextPromise: Promise<{
          audio: Float32Array;
          sampling_rate: number;
        }> | null = tts.generate(sentences[0], {
          voice: options.prefs.neuralVoiceId,
          speed: options.prefs.rate,
        });

        for (let i = 0; i < sentences.length; i += 1) {
          if (token !== activeSpeakToken || !nextPromise) return;
          const generated = await nextPromise;
          if (token !== activeSpeakToken) return;

          nextPromise =
            i + 1 < sentences.length
              ? tts.generate(sentences[i + 1], {
                  voice: options.prefs.neuralVoiceId,
                  speed: options.prefs.rate,
                })
              : null;

          options.onSentence?.(sentences[i], i, sentences.length);
          await playFloat32Audio(generated.audio, generated.sampling_rate, token);
        }

        if (token === activeSpeakToken) {
          options.onEnd?.();
        }
        return;
      } catch {
        if (token !== activeSpeakToken) return;
        speakViaBrowserFallback(sentences, token, options);
        return;
      }
    }

    // Tier 3: Browser system UK voice
    speakViaBrowserFallback(sentences, token, options);
  };

  void runAsync();

  return () => {
    if (token === activeSpeakToken) {
      stopUkSpeech();
      options.onEnd?.();
    }
  };
}

export interface UkRecognizerController {
  start: () => boolean;
  stop: () => void;
  abort: () => void;
}

export interface CreateUkRecognizerOptions {
  continuous?: boolean;
  onStart?: () => void;
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (friendlyError: string, rawCode?: string) => void;
}

export function createUkSpeechRecognizer(
  options: CreateUkRecognizerOptions
): UkRecognizerController | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'en-GB';
  recognition.continuous = options.continuous ?? true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onresult = (event) => {
    let interim = '';
    let finalChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0]?.transcript || '';
      if (result.isFinal) {
        finalChunk += `${text} `;
      } else {
        interim += text;
      }
    }

    if (interim.trim()) {
      options.onInterim?.(interim.trim());
    }
    if (finalChunk.trim()) {
      options.onFinal?.(finalChunk.trim());
    }
  };

  recognition.onerror = (ev) => {
    const code = ev.error || 'unknown';
    if (code === 'no-speech' || code === 'aborted') {
      return;
    }
    const messages: Record<string, string> = {
      'not-allowed':
        'Microphone permission was blocked. Allow microphone access in your browser to talk to Pippa.',
      'service-not-allowed':
        'Speech recognition is disabled in this browser context. Try Chrome, Edge, or Safari over HTTPS.',
      network:
        'Browser speech recognition needs an active connection to transcribe your voice.',
      'audio-capture': 'No working microphone was found on this device.',
    };
    options.onError?.(
      messages[code] ||
        'Voice recognition paused unexpectedly. Tap the mic to try again.',
      code
    );
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  return {
    start: () => {
      try {
        recognition.start();
        return true;
      } catch {
        return false;
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
    },
  };
}
