/**
 * Browser-native UK English Speech Engine for "The Gaffer"
 *
 * Zero external server required:
 * - Selects the highest-quality human-sounding UK English (en-GB) female voice available on the device
 *   (Microsoft Sonia/Libby/Maisie Natural, Google UK English Female, Apple Serena/Kate/Martha/Hazel, etc.)
 * - Normalizes Markdown, UK currency (£), times, and UK phone numbers into natural spoken phrasing
 * - Streams speech sentence-by-sentence for low latency and avoids Chrome's long-utterance cutoff
 * - Wraps Web SpeechRecognition (en-GB) for real-time continuous voice conversation with barge-in support
 */

export interface GafferVoicePreferences {
  voiceURI: string;
  rate: number; // 0.85 - 1.2
  pitch: number; // 0.92 - 1.1
  autoSpeak: boolean;
}

export const DEFAULT_GAFFER_VOICE_PREFS: GafferVoicePreferences = {
  voiceURI: '',
  rate: 0.98,
  pitch: 1.02,
  autoSpeak: true,
};

const VOICE_PREFS_STORAGE_KEY = 'ironclad_mindset_v1_gaffer_voice_prefs';

export function loadGafferVoicePrefs(): GafferVoicePreferences {
  try {
    const raw = localStorage.getItem(VOICE_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_GAFFER_VOICE_PREFS;
    const parsed = JSON.parse(raw) as Partial<GafferVoicePreferences>;
    return {
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : '',
      rate:
        typeof parsed.rate === 'number' && parsed.rate >= 0.75 && parsed.rate <= 1.35
          ? parsed.rate
          : DEFAULT_GAFFER_VOICE_PREFS.rate,
      pitch:
        typeof parsed.pitch === 'number' && parsed.pitch >= 0.8 && parsed.pitch <= 1.25
          ? parsed.pitch
          : DEFAULT_GAFFER_VOICE_PREFS.pitch,
      autoSpeak:
        typeof parsed.autoSpeak === 'boolean'
          ? parsed.autoSpeak
          : DEFAULT_GAFFER_VOICE_PREFS.autoSpeak,
    };
  } catch {
    return DEFAULT_GAFFER_VOICE_PREFS;
  }
}

export function saveGafferVoicePrefs(prefs: GafferVoicePreferences): void {
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

/**
 * Scores voices to prioritize natural, warm, human-sounding UK English female voices first.
 */
export function scoreUkVoice(voice: SpeechVoiceLike): number {
  const nameLower = (voice.name || '').toLowerCase();
  const isUk = isUkEnglishLang(voice.lang);
  const isEn = isEnglishLang(voice.lang);

  if (!isEn) return -1000;

  let score = isUk ? 200 : 10;

  // Natural / Neural / Online / Google / Enhanced voices sound dramatically more human
  if (/\b(natural|neural|online|premium|enhanced|siri|google)\b/i.test(nameLower)) {
    score += 120;
  }

  // Exact top-tier UK female voices
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

  // Slight preference for non-espeak / non-robotic system voices
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
 * Prevents TTS engines from reading out symbols, bullet characters, or squashed digits.
 */
export function prepareTextForUkSpeech(rawText: string): string {
  let text = String(rawText || '');

  // Remove markdown bold/italic/code markers
  text = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');

  // Convert bullet lines into gentle spoken pauses
  text = text.replace(/^\s*[•*-]\s+/gm, '');

  // Convert numbered steps like "1. **Sear (0–4 mins):**" -> "Step 1. Sear, 0 to 4 minutes:"
  text = text.replace(/^\s*(\d+)\.\s+/gm, 'Step $1. ');

  // Normalize ranges like 0–4 mins -> 0 to 4 minutes
  text = text.replace(/(\d+)\s*[–-]\s*(\d+)\s*mins?\b/gi, '$1 to $2 minutes');
  text = text.replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes');

  // UK currency: £1.85 -> 1 pound 85, £40 -> 40 pounds
  text = text.replace(/£(\d+)\.(\d{2})/g, (_, pounds, pence) => {
    const pNum = Number(pounds);
    return `${pNum} ${pNum === 1 ? 'pound' : 'pounds'} ${pence}`;
  });
  text = text.replace(/£(\d+)/g, (_, pounds) => {
    const pNum = Number(pounds);
    return `${pNum} ${pNum === 1 ? 'pound' : 'pounds'}`;
  });

  // Natural UK alcohol-free & time abbreviations
  text = text.replace(/\b0\.0%/g, 'zero point zero percent');
  text = text.replace(/\b(\d{1,2}):(\d{2})\s*(am|pm)\b/gi, '$1:$2 $3');
  text = text.replace(/\b(\d{1,2})\s*(am|pm)\b/gi, (_, h, meridiem) => {
    const spaced = meridiem.toLowerCase() === 'pm' ? 'p.m.' : 'a.m.';
    return `${h} ${spaced}`;
  });

  // Clear pronunciation of UK crisis lines & clinical acronyms
  text = text.replace(/\bNHS\s*111\b/gi, 'N H S 1 1 1');
  text = text.replace(/\b116\s*123\b/g, '1 1 6, 1 2 3');
  text = text.replace(/\b0800\s*58\s*58\s*58\b/g, '0 800, 5 8, 5 8, 5 8');
  text = text.replace(/\b85258\b/g, '8 5 2 5 8');
  text = text.replace(/\b999\b/g, '9 9 9');
  text = text.replace(/\bCBT\b/g, 'C B T');
  text = text.replace(/\bA&E\b/g, 'A and E');

  // Em-dashes & line breaks become smooth breathing pauses
  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, '. ');
  text = text.replace(/\.\s*\./g, '.');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Splits normalized speech text into crisp sentences/clauses for fast time-to-first-audio
 * and reliable browser playback without long-utterance cutoffs.
 */
export function splitIntoSpeechSentences(spokenText: string): string[] {
  const cleaned = spokenText.trim();
  if (!cleaned) return [];

  const rawChunks = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /[a-z0-9]/i.test(s));

  // Merge tiny fragments (< 12 chars) with the next chunk for natural cadence
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

  // Some browsers populate voices slightly after mount without firing immediately
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
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}

export interface SpeakUkOptions {
  text: string;
  prefs: GafferVoicePreferences;
  voices?: SpeechSynthesisVoice[];
  onStart?: () => void;
  onSentence?: (sentence: string, index: number, total: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

/**
 * Speaks text sentence-by-sentence using the highest-ranked UK English voice.
 * Supports immediate cancellation (barge-in) via stopUkSpeech() or starting a new utterance.
 */
export function speakUkText(options: SpeakUkOptions): () => void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech playback is not supported in this browser.');
    options.onEnd?.();
    return () => {};
  }

  stopUkSpeech();
  const token = ++activeSpeakToken;

  const prepared = prepareTextForUkSpeech(options.text);
  const sentences = splitIntoSpeechSentences(prepared);
  if (sentences.length === 0) {
    options.onEnd?.();
    return () => {};
  }

  const availableVoices = options.voices?.length
    ? options.voices
    : getInstalledSpeechVoices();
  const chosenVoice = selectBestUkVoice(availableVoices, options.prefs.voiceURI);

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
      // 'interrupted' / 'canceled' happen normally during barge-in
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

/**
 * Creates a real-time UK English (en-GB) speech recognizer using the browser's native Web Speech API.
 */
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
        'Microphone permission was blocked. Allow microphone access in your browser to speak to The Gaffer.',
      'service-not-allowed':
        'Speech recognition is disabled in this browser context. Try Chrome, Edge, or Safari over HTTPS.',
      network:
        'Browser speech recognition needs an active connection to transcribe your voice.',
      'audio-capture':
        'No working microphone was found on this device.',
    };
    options.onError?.(
      messages[code] || 'Voice recognition paused unexpectedly. Tap the mic to try again.',
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
