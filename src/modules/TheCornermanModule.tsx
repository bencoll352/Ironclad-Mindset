import {
  AlertCircle,
  BookOpen,
  ChefHat,
  HeartHandshake,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Square,
  Utensils,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PippaIcon } from '../components/PippaIcon';
import {
  buildFridgeCompanionRecipe,
  CornermanActionId,
  requestCornermanCompanion,
  ValidatedCornermanCitation,
} from '../services/cornermanEngine';
import {
  createUkSpeechRecognizer,
  fetchVoiceboxProfiles,
  getNeuralModelStatus,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  KOKORO_UK_FEMALE_VOICES,
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
  subscribeToVoiceList,
  UkRecognizerController,
  unlockPippaAudioContext,
  VoiceboxProfile,
} from '../services/pippaSpeech';
import {
  CLEAN_BRITISH_VOICE_PRESETS,
  resolveBrowserVoiceForCleanPreset,
} from '../services/voiceEngine';
import { ChatMessage, IntegrationConfig } from '../types/ironclad';

interface TheCornermanModuleProps {
  streakDays: number;
  config: IntegrationConfig;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onResetConversation: () => void;
  onStartCravingReset: () => void;
  onOpenHaltWorksheet: () => void;
  onViewLifelines: () => void;
  onOpenPlaybookCitation: (playbookId: string, sectionIndex?: number) => void;
  onOpenRecipeCitation: (recipeId: string) => void;
  forceProviderUnavailable?: boolean;
}

const QUICK_ACTION_CHIPS = [
  '5pm craving hit — talk me down',
  'Payday / Matchday gambling urge',
  '3-min smoke / vape craving',
  'Night-out / cocaine trigger',
  "What's in the fridge? (15-min meal)",
  'UK pub or matchday sober script',
  'Work stress & burnout check',
];

const ACTION_BUTTON_LABELS: Record<CornermanActionId, string> = {
  START_CRAVING_RESET: 'Start Craving Reset',
  OPEN_HALT_WORKSHEET: 'Open HALT worksheet',
  VIEW_LIFELINES: 'View Lifelines',
  OPEN_PLAYBOOK_1: 'Open Playbook 1: First 30 days',
  OPEN_PLAYBOOK_2: 'Open Playbook 2: £40 mood-food guide',
  OPEN_PLAYBOOK_3: 'Open Playbook 3: Matchday & pub guide',
  OPEN_PLAYBOOK_4: 'Open Playbook 4: HALT & CBT worksheet',
  OPEN_PLAYBOOK_5: 'Open Playbook 5: Workplace charter',
  OPEN_PLAYBOOK_6: 'Open Playbook 6: Mind management',
};

export const TheCornermanModule: React.FC<TheCornermanModuleProps> = ({
  streakDays,
  config,
  messages,
  onAddMessage,
  onResetConversation,
  onStartCravingReset,
  onOpenHaltWorksheet,
  onViewLifelines,
  onOpenPlaybookCitation,
  onOpenRecipeCitation,
  forceProviderUnavailable = false,
}) => {
  const [input, setInput] = useState<string>('');
  const [fridgeIngredients, setFridgeIngredients] = useState<string>(
    'Eggs, Cavolo Nero, Tinned Cannellini Beans'
  );
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voice & real-time speech state
  const [voicePrefs, setVoicePrefs] = useState<PippaVoicePreferences>(() =>
    loadPippaVoicePrefs()
  );
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [neuralStatus, setNeuralStatus] = useState<NeuralModelStatus>(() =>
    getNeuralModelStatus()
  );
  const [voiceboxProfiles, setVoiceboxProfiles] = useState<VoiceboxProfile[]>([]);
  const [voiceboxLoading, setVoiceboxLoading] = useState<boolean>(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const ttsSupported = useMemo(() => isSpeechSynthesisSupported(), []);
  const sttSupported = useMemo(() => isSpeechRecognitionSupported(), []);

  // Refs for fresh state inside async recognition / TTS callbacks
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const voicePrefsRef = useRef<PippaVoicePreferences>(voicePrefs);
  voicePrefsRef.current = voicePrefs;
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>(availableVoices);
  availableVoicesRef.current = availableVoices;
  const isLiveCallRef = useRef<boolean>(isLiveCallActive);
  isLiveCallRef.current = isLiveCallActive;
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  isSpeakingRef.current = isSpeaking;
  const isThinkingRef = useRef<boolean>(isThinking);
  isThinkingRef.current = isThinking;

  const recognizerRef = useRef<UkRecognizerController | null>(null);
  const dictateRecognizerRef = useRef<UkRecognizerController | null>(null);
  const pendingUtteranceRef = useRef<string>('');
  const silenceTimerRef = useRef<number | null>(null);

  const [cleanPresetId, setCleanPresetId] = useState<string>('uk-female-warm');

  const activeCleanPreset = useMemo(
    () =>
      CLEAN_BRITISH_VOICE_PRESETS.find((p) => p.id === cleanPresetId) ||
      CLEAN_BRITISH_VOICE_PRESETS[0],
    [cleanPresetId]
  );

  useEffect(() => {
    const unsubVoices = subscribeToVoiceList((voices) => {
      setAvailableVoices(voices);
    });
    const unsubNeural = subscribeNeuralModelStatus((status) => {
      setNeuralStatus(status);
    });
    return () => {
      unsubVoices();
      unsubNeural();
      stopUkSpeech();
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      recognizerRef.current?.abort();
      dictateRecognizerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const list = chatBottomRef.current?.parentElement;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking, liveTranscript]);

  const updateVoicePrefs = (patch: Partial<PippaVoicePreferences>) => {
    setVoicePrefs((prev) => {
      const next = { ...prev, ...patch };
      savePippaVoicePrefs(next);
      return next;
    });
  };

  const handleLoadVoiceboxProfiles = async (urlOverride?: string) => {
    setVoiceboxLoading(true);
    const profiles = await fetchVoiceboxProfiles(urlOverride || voicePrefs.voiceboxUrl);
    setVoiceboxProfiles(profiles);
    setVoiceboxLoading(false);
    if (profiles.length > 0 && !voicePrefs.voiceboxProfileId) {
      updateVoicePrefs({ voiceboxProfileId: profiles[0].id });
    } else if (profiles.length === 0) {
      setVoiceNotice(
        `Could not reach Voicebox at ${urlOverride || voicePrefs.voiceboxUrl}. Start Voicebox locally or use Pippa's built-in Neural UK voice.`
      );
    } else {
      setVoiceNotice(null);
    }
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startLiveRecognizer = useCallback(() => {
    if (
      !sttSupported ||
      !isLiveCallRef.current ||
      isSpeakingRef.current ||
      isThinkingRef.current
    ) {
      return;
    }
    if (recognizerRef.current) {
      return;
    }

    const controller = createUkSpeechRecognizer({
      continuous: true,
      onStart: () => {
        setIsListening(true);
        setVoiceNotice(null);
      },
      onInterim: (interim) => {
        if (isSpeakingRef.current) return;
        const combined = `${pendingUtteranceRef.current} ${interim}`.trim();
        setLiveTranscript(combined);
      },
      onFinal: (finalChunk) => {
        if (isSpeakingRef.current) return;
        pendingUtteranceRef.current = `${pendingUtteranceRef.current} ${finalChunk}`.trim();
        setLiveTranscript(pendingUtteranceRef.current);

        clearSilenceTimer();
        silenceTimerRef.current = window.setTimeout(() => {
          const toSend = pendingUtteranceRef.current.trim();
          if (toSend && isLiveCallRef.current) {
            pendingUtteranceRef.current = '';
            setLiveTranscript('');
            recognizerRef.current?.stop();
            recognizerRef.current = null;
            setIsListening(false);
            void sendPromptRef.current(toSend, false, true);
          }
        }, 900);
      },
      onEnd: () => {
        recognizerRef.current = null;
        setIsListening(false);
        if (isLiveCallRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
          window.setTimeout(() => {
            if (isLiveCallRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
              startLiveRecognizer();
            }
          }, 200);
        }
      },
      onError: (friendlyError, rawCode) => {
        setVoiceNotice(friendlyError);
        if (
          rawCode === 'not-allowed' ||
          rawCode === 'service-not-allowed' ||
          rawCode === 'audio-capture'
        ) {
          setIsLiveCallActive(false);
          isLiveCallRef.current = false;
          setIsListening(false);
          recognizerRef.current = null;
        }
      },
    });

    if (controller) {
      recognizerRef.current = controller;
      const started = controller.start();
      if (!started) {
        recognizerRef.current = null;
      }
    }
  }, [sttSupported]);

  const speakMessage = useCallback(
    (msgId: string, text: string) => {
      unlockPippaAudioContext();

      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
        setIsListening(false);
      }

      setSpeakingMessageId(msgId);
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      speakUkText({
        text,
        prefs: voicePrefsRef.current,
        voices: availableVoicesRef.current,
        onStart: () => {
          setSpeakingMessageId(msgId);
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        },
        onEnd: () => {
          setSpeakingMessageId(null);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          if (isLiveCallRef.current && !isThinkingRef.current) {
            window.setTimeout(() => {
              startLiveRecognizer();
            }, 220);
          }
        },
        onError: (errMsg) => {
          setVoiceNotice(errMsg);
          setSpeakingMessageId(null);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        },
      });
    },
    [startLiveRecognizer]
  );

  const handleStopSpeaking = useCallback(
    (resumeCallListening = true) => {
      stopUkSpeech();
      setSpeakingMessageId(null);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (resumeCallListening && isLiveCallRef.current && !isThinkingRef.current) {
        window.setTimeout(() => {
          startLiveRecognizer();
        }, 180);
      }
    },
    [startLiveRecognizer]
  );

  const executeAction = (action: CornermanActionId) => {
    switch (action) {
      case 'START_CRAVING_RESET':
        onStartCravingReset();
        break;
      case 'OPEN_HALT_WORKSHEET':
        onOpenHaltWorksheet();
        break;
      case 'VIEW_LIFELINES':
        onViewLifelines();
        break;
      case 'OPEN_PLAYBOOK_1':
        onOpenPlaybookCitation('playbook-1', 0);
        break;
      case 'OPEN_PLAYBOOK_2':
        onOpenPlaybookCitation('playbook-2', 0);
        break;
      case 'OPEN_PLAYBOOK_3':
        onOpenPlaybookCitation('playbook-3', 0);
        break;
      case 'OPEN_PLAYBOOK_4':
        onOpenPlaybookCitation('playbook-4', 0);
        break;
      case 'OPEN_PLAYBOOK_5':
        onOpenPlaybookCitation('playbook-5', 0);
        break;
      case 'OPEN_PLAYBOOK_6':
        onOpenPlaybookCitation('playbook-6', 0);
        break;
    }
  };

  const sendPrompt = async (
    promptText: string,
    isFridge = false,
    fromVoiceCall = false
  ) => {
    if (!promptText.trim()) return;

    const userText = isFridge
      ? `Pippa, build me a 15-minute meal using these 3 fridge ingredients: ${promptText}`
      : promptText.trim();

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: userText,
    };

    const updatedHistory = [...messagesRef.current, userMsg];
    onAddMessage(userMsg);
    setIsThinking(true);
    isThinkingRef.current = true;

    if (isFridge) {
      const built = buildFridgeCompanionRecipe(promptText);
      const botMsg: ChatMessage = {
        id: `msg-c-${Date.now() + 1}`,
        sender: 'cornerman',
        timestamp: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        text: built.reply,
        citations: built.citations,
        action: built.action,
        isGeneratedRecipe: true,
      };
      onAddMessage(botMsg);
      setIsThinking(false);
      isThinkingRef.current = false;

      if (fromVoiceCall || voicePrefsRef.current.autoSpeak) {
        speakMessage(botMsg.id, botMsg.text);
      }
      return;
    }

    const boundedTurns = updatedHistory.slice(-8).map((m) => ({
      role: m.sender,
      text: m.text,
    }));

    const result = await requestCornermanCompanion({
      messages: boundedTurns,
      streakDays,
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      forceProviderUnavailable,
    });

    if (result.statusNotice) {
      setProviderNotice(result.statusNotice);
    }

    const botMsg: ChatMessage = {
      id: `msg-c-${Date.now() + 1}`,
      sender: 'cornerman',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: result.reply,
      citations: result.citations,
      action: result.action,
      statusNotice: result.statusNotice,
      isSafetyEscalation: result.providerStatus === 'safety_escalation',
    };

    onAddMessage(botMsg);
    setIsThinking(false);
    isThinkingRef.current = false;

    if (fromVoiceCall || voicePrefsRef.current.autoSpeak) {
      speakMessage(botMsg.id, botMsg.text);
    } else if (isLiveCallRef.current) {
      startLiveRecognizer();
    }
  };

  const sendPromptRef = useRef(sendPrompt);
  sendPromptRef.current = sendPrompt;

  const handleToggleLiveVoiceCall = () => {
    unlockPippaAudioContext();

    if (isLiveCallActive) {
      clearSilenceTimer();
      pendingUtteranceRef.current = '';
      setLiveTranscript('');
      setIsLiveCallActive(false);
      isLiveCallRef.current = false;
      setIsListening(false);
      recognizerRef.current?.stop();
      recognizerRef.current = null;
      handleStopSpeaking(false);
      return;
    }

    if (voicePrefsRef.current.engine === 'neural' && neuralStatus.state === 'idle') {
      void preloadNeuralUkVoice();
    }

    if (!sttSupported) {
      setVoiceNotice(
        'Real-time microphone listening requires Chrome, Edge, or Safari over HTTPS. You can still type and hear Pippa speak in UK English.'
      );
      return;
    }

    if (dictateRecognizerRef.current) {
      dictateRecognizerRef.current.stop();
      dictateRecognizerRef.current = null;
      setIsDictating(false);
    }

    setVoiceNotice(null);
    setIsLiveCallActive(true);
    isLiveCallRef.current = true;
    startLiveRecognizer();
  };

  const handleCommitLiveUtteranceNow = () => {
    const text = (pendingUtteranceRef.current || liveTranscript).trim();
    if (!text) return;
    clearSilenceTimer();
    pendingUtteranceRef.current = '';
    setLiveTranscript('');
    recognizerRef.current?.stop();
    recognizerRef.current = null;
    setIsListening(false);
    void sendPrompt(text, false, true);
  };

  const handleToggleDictation = () => {
    unlockPippaAudioContext();

    if (isDictating) {
      dictateRecognizerRef.current?.stop();
      dictateRecognizerRef.current = null;
      setIsDictating(false);
      return;
    }

    if (!sttSupported) {
      setVoiceNotice(
        'Voice dictation is not supported in this browser. Try Chrome, Edge, or Safari.'
      );
      return;
    }

    handleStopSpeaking(false);
    setVoiceNotice(null);

    const baseInput = input.trim();
    let committed = baseInput ? `${baseInput} ` : '';

    const controller = createUkSpeechRecognizer({
      continuous: false,
      onStart: () => setIsDictating(true),
      onInterim: (interim) => {
        setInput(`${committed}${interim}`.trim());
      },
      onFinal: (finalChunk) => {
        committed = `${committed}${finalChunk} `;
        setInput(committed.trim());
      },
      onEnd: () => {
        dictateRecognizerRef.current = null;
        setIsDictating(false);
      },
      onError: (friendlyError) => {
        setVoiceNotice(friendlyError);
        dictateRecognizerRef.current = null;
        setIsDictating(false);
      },
    });

    if (controller) {
      dictateRecognizerRef.current = controller;
      controller.start();
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockPippaAudioContext();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    if (isDictating) {
      dictateRecognizerRef.current?.stop();
      dictateRecognizerRef.current = null;
      setIsDictating(false);
    }
    await sendPrompt(text, false, isLiveCallActive);
  };

  const handleFridgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockPippaAudioContext();
    if (!fridgeIngredients.trim()) return;
    await sendPrompt(fridgeIngredients, true, isLiveCallActive);
  };

  const handleCitationClick = (cit: ValidatedCornermanCitation) => {
    if (cit.type === 'PlaybookSection' && cit.playbookId) {
      onOpenPlaybookCitation(cit.playbookId, cit.sectionIndex);
    } else if (cit.type === 'Recipe' && cit.recipeId) {
      onOpenRecipeCitation(cit.recipeId);
    }
  };

  const activeVoiceSummary =
    voicePrefs.engine === 'voicebox'
      ? `Voicebox (${
          voiceboxProfiles.find((p) => p.id === voicePrefs.voiceboxProfileId)?.name ||
          'Local server'
        })`
      : activeCleanPreset.label;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Pippa Overview, Human Neural Voice Controls, Built-in Tools, Fridge Generator */}
      <div className="lg:col-span-4 space-y-5">
        <section className="iron-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PippaIcon
                variant="badge"
                isSpeaking={isSpeaking}
                className="w-12 h-12"
              />
              <div>
                <span className="text-xs font-semibold text-[#7A263A]">
                  24/7 UK voice &amp; recovery coach
                </span>
                <h1 className="font-display text-xl font-bold text-[#121518]">
                  Pippa
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowVoiceSettings((prev) => !prev)}
              className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] cursor-pointer"
              aria-label="Toggle UK voice settings"
              aria-expanded={showVoiceSettings}
              title="UK Voice Settings"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#7A263A]" />
            </button>
          </div>

          <p className="text-xs text-[#334155] leading-relaxed">
            Have a real back-and-forth voice chat with <strong>Pippa</strong> in human UK English—built for alcohol, drugs, smoking/vaping, gambling urges, and rough shifts.
          </p>

          {/* Primary Real-Time Voice Call Trigger */}
          <div className="space-y-2.5">
            <button
              id="pippa-live-call-btn"
              type="button"
              onClick={handleToggleLiveVoiceCall}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border ${
                isLiveCallActive
                  ? 'bg-[#E63946] hover:bg-[#C81E2B] text-white border-[#E63946]'
                  : 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-[#0284C7]'
              }`}
            >
              {isLiveCallActive ? (
                <>
                  <PhoneOff className="w-4 h-4" />
                  End Live Voice Call
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  Start Live Voice Call (UK English)
                </>
              )}
            </button>

            {/* Human Neural Voice Preload / Status Indicator */}
            {voicePrefs.engine === 'neural' && neuralStatus.state === 'idle' && (
              <button
                id="pippa-load-neural-btn"
                type="button"
                onClick={() => {
                  unlockPippaAudioContext();
                  void preloadNeuralUkVoice();
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#FDF2F4] hover:bg-[#FCE7EB] border border-[#7A263A]/25 text-xs font-semibold text-[#7A263A] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Human Neural UK Voice (kokoro-js ready · ~86 MB)
              </button>
            )}

            {voicePrefs.engine === 'neural' && neuralStatus.state === 'loading' && (
              <div className="p-2.5 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#0369A1]">
                  <span>{neuralStatus.detail}</span>
                  <span>{neuralStatus.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E0F2FE] overflow-hidden">
                  <div
                    className="h-full bg-[#0284C7] transition-all duration-200"
                    style={{ width: `${neuralStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {voicePrefs.engine === 'neural' && neuralStatus.state === 'ready' && (
              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                Human Neural UK voice active (cached offline)
              </div>
            )}

            <div className="flex items-center justify-between px-1 text-[11px] text-[#475569]">
              <span className="truncate">
                Voice: <strong className="text-[#121518]">{activeVoiceSummary}</strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  updateVoicePrefs({ autoSpeak: !voicePrefs.autoSpeak })
                }
                className="inline-flex items-center gap-1 font-medium text-[#7A263A] hover:underline cursor-pointer flex-shrink-0"
              >
                {voicePrefs.autoSpeak ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Auto-speak On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#475569]" /> Auto-speak Off
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible UK Voice Settings */}
          {showVoiceSettings && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div>
                <span className="block text-[11px] font-semibold text-[#121518] mb-1.5">
                  Voice engine
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'neural', label: 'Neural UK' },
                      { id: 'voicebox', label: 'Voicebox' },
                      { id: 'browser', label: 'Fast OS' },
                    ] as { id: PippaVoiceEngine; label: string }[]
                  ).map((tab) => {
                    const active = voicePrefs.engine === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => updateVoicePrefs({ engine: tab.id })}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#7A263A] text-white border-[#7A263A]'
                            : 'bg-white text-[#334155] border-[#CBD5E1]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {voicePrefs.engine === 'neural' && (
                <div>
                  <label
                    htmlFor="pippa-neural-voice-select"
                    className="block text-[11px] font-semibold text-[#121518] mb-1"
                  >
                    Kokoro UK female voice
                  </label>
                  <select
                    id="pippa-neural-voice-select"
                    value={voicePrefs.neuralVoiceId}
                    onChange={(e) => {
                      const vid = e.target.value as KokoroUkVoiceId;
                      updateVoicePrefs({ neuralVoiceId: vid });
                      const matchPreset = CLEAN_BRITISH_VOICE_PRESETS.find(
                        (p) => p.neuralVoiceId === vid
                      );
                      if (matchPreset) setCleanPresetId(matchPreset.id);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  >
                    {KOKORO_UK_FEMALE_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {voicePrefs.engine === 'voicebox' && (
                <div className="space-y-2">
                  <label
                    htmlFor="pippa-voicebox-url"
                    className="block text-[11px] font-semibold text-[#121518]"
                  >
                    Local Voicebox server URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="pippa-voicebox-url"
                      type="url"
                      value={voicePrefs.voiceboxUrl}
                      onChange={(e) =>
                        updateVoicePrefs({ voiceboxUrl: e.target.value })
                      }
                      placeholder="http://127.0.0.1:17493"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                    />
                    <button
                      type="button"
                      onClick={() => void handleLoadVoiceboxProfiles()}
                      className="iron-btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                      title="Fetch Voicebox profiles"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${voiceboxLoading ? 'animate-spin' : ''}`}
                      />
                      Connect
                    </button>
                  </div>
                  {voiceboxProfiles.length > 0 && (
                    <select
                      aria-label="Voicebox voice profile"
                      value={voicePrefs.voiceboxProfileId}
                      onChange={(e) =>
                        updateVoicePrefs({ voiceboxProfileId: e.target.value })
                      }
                      className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                    >
                      {voiceboxProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {voicePrefs.engine === 'browser' && ttsSupported && (
                <div>
                  <label
                    htmlFor="pippa-browser-voice-select"
                    className="block text-[11px] font-semibold text-[#121518] mb-1"
                  >
                    British coach voice
                  </label>
                  <select
                    id="pippa-browser-voice-select"
                    value={cleanPresetId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setCleanPresetId(nextId);
                      const resolved = resolveBrowserVoiceForCleanPreset(
                        nextId,
                        availableVoices
                      );
                      updateVoicePrefs({
                        browserVoiceURI: resolved?.voiceURI || '',
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  >
                    {CLEAN_BRITISH_VOICE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#121518]">
                  Pace
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'Calm', rate: 0.92 },
                    { label: 'Natural', rate: 1.0 },
                    { label: 'Crisp', rate: 1.1 },
                  ].map((opt) => {
                    const selected = Math.abs(voicePrefs.rate - opt.rate) < 0.03;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => updateVoicePrefs({ rate: opt.rate })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                          selected
                            ? 'bg-[#7A263A] text-white border-[#7A263A]'
                            : 'bg-white text-[#334155] border-[#CBD5E1]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  speakMessage(
                    'voice-preview',
                    "Alright mate, I'm Pippa. Take a slow breath—we'll sort this together, one step at a time."
                  )
                }
                className="iron-btn-secondary w-full py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#7A263A]" />
                Test Pippa’s UK voice
              </button>
            </div>
          )}

          {/* Always-Available Independent Tools */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <div className="text-xs font-semibold text-[#121518]">
              Immediate built-in tools (always available offline)
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={onStartCravingReset}
                className="iron-btn-urgent py-2 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Start Craving Reset (60s / 3m / Friction)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onOpenHaltWorksheet}
                  className="iron-btn-ghost py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#7A263A]" />
                  Open HALT worksheet
                </button>
                <button
                  type="button"
                  onClick={onViewLifelines}
                  className="iron-btn-ghost py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#0284C7]" />
                  View Lifelines
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Ingredient Fridge Recipe Generator */}
        <section className="iron-surface p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A263A]">
            <ChefHat className="w-4 h-4" /> 3-ingredient fridge meal generator
          </div>
          <h2 className="font-display text-lg font-bold text-[#121518]">
            What’s in your fridge right now?
          </h2>
          <p className="text-xs text-[#475569]">
            Enter three ingredients from your fridge or cupboard to get a quick 12-minute recovery skillet recipe.
          </p>

          <form onSubmit={handleFridgeSubmit} className="space-y-2.5">
            <label htmlFor="fridge-ingredients-input" className="sr-only">
              Three fridge ingredients
            </label>
            <input
              id="fridge-ingredients-input"
              type="text"
              value={fridgeIngredients}
              onChange={(e) => setFridgeIngredients(e.target.value)}
              placeholder="e.g., Eggs, Spinach, Tinned Chickpeas"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
            />
            <button
              id="generate-fridge-recipe-btn"
              type="submit"
              className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Build 12-minute recipe
            </button>
          </form>
        </section>
      </div>

      {/* Right Column: Live Voice & Conversation Thread */}
      <section
        aria-label="Pippa conversation"
        className="lg:col-span-8 iron-card flex flex-col h-[700px] overflow-hidden"
      >
        {/* Top Bar: Quick Prompts & Start Over */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-[#121518]">
                Private session — clears when you leave
              </span>
              <span className="text-xs text-[#475569] block">
                Private check-in notes stay on your device and are never included in voice or chat requests.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking && (
                <button
                  type="button"
                  onClick={() => handleStopSpeaking(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  {isLiveCallActive ? 'Interrupt & Speak' : 'Stop voice'}
                </button>
              )}

              <button
                id="cornerman-start-over-btn"
                type="button"
                onClick={() => {
                  handleStopSpeaking(false);
                  setProviderNotice(null);
                  setVoiceNotice(null);
                  onResetConversation();
                }}
                className="iron-btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#7A263A]" />
                Start over
              </button>
            </div>
          </div>

          {/* Real-Time Live Voice Call Banner */}
          {(isLiveCallActive || isSpeaking) && (
            <div
              id="pippa-live-voice-bar"
              role="status"
              className={`px-3.5 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                isSpeaking
                  ? 'bg-[#FDF2F4] border-[#7A263A]/30'
                  : 'bg-[#F0F9FF] border-[#BAE6FD]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  aria-hidden="true"
                  className="flex items-center gap-0.5 h-5 px-1.5 flex-shrink-0"
                >
                  {[0, 1, 2, 3].map((bar) => (
                    <span
                      key={bar}
                      className={`w-1 rounded-full transition-all ${
                        isSpeaking
                          ? 'bg-[#7A263A] animate-pulse'
                          : isListening
                            ? 'bg-[#0284C7] animate-pulse'
                            : 'bg-[#94A3B8]'
                      }`}
                      style={{
                        height:
                          isSpeaking || isListening
                            ? `${10 + ((bar % 2) * 8)}px`
                            : '6px',
                        animationDelay: `${bar * 120}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#121518]">
                    {isSpeaking
                      ? 'Pippa is speaking (UK English)…'
                      : isThinking
                        ? 'Pippa is thinking…'
                        : isListening
                          ? 'Listening live — speak naturally, Pippa will reply'
                          : 'Live voice ready'}
                  </div>
                  {liveTranscript && (
                    <div className="text-xs text-[#0284C7] truncate font-medium">
                      “{liveTranscript}”
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {liveTranscript && !isSpeaking && (
                  <button
                    type="button"
                    onClick={handleCommitLiveUtteranceNow}
                    className="iron-btn-primary py-1.5 px-3 text-xs cursor-pointer"
                  >
                    Send now
                  </button>
                )}
                {isSpeaking && isLiveCallActive && (
                  <button
                    type="button"
                    onClick={() => handleStopSpeaking(true)}
                    className="iron-btn-secondary py-1.5 px-3 text-xs cursor-pointer"
                  >
                    Interrupt
                  </button>
                )}
              </div>
            </div>
          )}

          {voiceNotice && (
            <div
              role="status"
              className="px-3 py-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {voiceNotice}
              </span>
              <button
                type="button"
                onClick={() => setVoiceNotice(null)}
                className="text-[11px] font-semibold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {providerNotice && (
            <div
              id="cornerman-provider-notice"
              role="status"
              className="px-3 py-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#121518] flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                {providerNotice}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_ACTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendPrompt(chip, false, isLiveCallActive)}
                className="text-left px-3 py-2 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-medium text-[#121518] transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="truncate">{chip}</span>
                <Send className="w-3 h-3 text-[#7A263A] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div
          id="cornerman-messages-list"
          className="flex-1 p-4 sm:p-5 overflow-y-auto iron-scroll space-y-4 bg-white"
        >
          {messages.map((msg) => {
            const isBot = msg.sender === 'cornerman';
            const isThisMsgSpeaking = speakingMessageId === msg.id && isSpeaking;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 space-y-3 border ${
                    isBot
                      ? msg.isSafetyEscalation
                        ? 'bg-[#FEF2F2] border-[#FECACA] text-[#121518]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#121518]'
                      : 'bg-[#7A263A] border-[#7A263A] text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px]">
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        isBot ? 'text-[#7A263A]' : 'text-white/90'
                      }`}
                    >
                      {isBot && <PippaIcon className="w-3.5 h-3.5" />}
                      {isBot ? 'Pippa' : 'You'}
                    </span>

                    <div className="flex items-center gap-2">
                      {isBot && (
                        <button
                          type="button"
                          onClick={() =>
                            isThisMsgSpeaking
                              ? handleStopSpeaking(true)
                              : speakMessage(msg.id, msg.text)
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                            isThisMsgSpeaking
                              ? 'bg-[#7A263A] text-white border-[#7A263A]'
                              : 'bg-white hover:bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]'
                          }`}
                          aria-label={
                            isThisMsgSpeaking
                              ? 'Stop speaking message'
                              : 'Listen to Pippa in UK English'
                          }
                        >
                          {isThisMsgSpeaking ? (
                            <>
                              <Square className="w-2.5 h-2.5 fill-current" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#7A263A]" />
                              Listen
                            </>
                          )}
                        </button>
                      )}
                      <span
                        className={`font-mono-metric ${
                          isBot ? 'text-[#475569]' : 'text-white/80'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Direct Action Button */}
                  {isBot && msg.action && (
                    <div className="pt-2">
                      <button
                        type="button"
                        data-cornerman-action={msg.action}
                        onClick={() => msg.action && executeAction(msg.action)}
                        className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                          msg.action === 'START_CRAVING_RESET' ||
                          msg.action === 'VIEW_LIFELINES'
                            ? 'iron-btn-primary'
                            : 'iron-btn-secondary'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {ACTION_BUTTON_LABELS[msg.action]}
                      </button>
                    </div>
                  )}

                  {/* Validated Section-Level Citations */}
                  {isBot && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5">
                      <span className="text-[11px] font-medium text-[#475569] block">
                        Supporting guides and recipes:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit) => (
                          <button
                            key={cit.id}
                            type="button"
                            onClick={() => handleCitationClick(cit)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-[#F0F9FF] border border-[#CBD5E1] text-[11px] font-medium text-[#0284C7] transition cursor-pointer"
                          >
                            {cit.type === 'PlaybookSection' ? (
                              <BookOpen className="w-3 h-3" />
                            ) : (
                              <Utensils className="w-3 h-3" />
                            )}
                            <span>
                              {cit.title}
                              {cit.sectionHeading ? ` • ${cit.sectionHeading}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div
              role="status"
              className="flex items-center gap-2 text-xs text-[#334155] p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] w-fit"
            >
              <PippaIcon className="w-4 h-4 text-[#7A263A] animate-pulse" />
              Pippa is thinking...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form with Quick Voice Dictation */}
        <form
          onSubmit={handleChatSubmit}
          className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2"
        >
          <button
            id="pippa-mic-btn"
            type="button"
            onClick={handleToggleDictation}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              isDictating
                ? 'bg-[#DC2626] text-white border-[#DC2626] animate-pulse'
                : 'bg-white hover:bg-[#F1F5F9] text-[#7A263A] border-[#CBD5E1]'
            }`}
            aria-label={isDictating ? 'Stop voice dictation' : 'Speak a message to Pippa'}
            title={isDictating ? 'Stop speaking' : 'Speak message (UK English)'}
          >
            {isDictating ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <label htmlFor="cornerman-chat-input" className="sr-only">
            Message Pippa
          </label>
          <input
            id="cornerman-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isDictating
                ? 'Listening in UK English… speak now'
                : 'Talk or type to Pippa (e.g., "Just clocked off a rough shift, feeling tempted")...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs sm:text-sm text-[#121518]"
          />
          <button
            id="cornerman-send-btn"
            type="submit"
            className="iron-btn-primary py-2.5 px-4 sm:px-5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </div>
  );
};
