import {
  AlertCircle,
  BookOpen,
  Bot,
  ChefHat,
  HeartHandshake,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Utensils,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  buildFridgeCompanionRecipe,
  CornermanActionId,
  requestCornermanCompanion,
  ValidatedCornermanCitation,
} from '../services/cornermanEngine';
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
  "What's in the fridge? (15-minute meal)",
  'UK pub or matchday sober script',
  'Work stress and burnout check',
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

  useEffect(() => {
    const list = chatBottomRef.current?.parentElement;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking]);

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
    }
  };

  const sendPrompt = async (promptText: string, isFridge = false) => {
    if (!promptText.trim()) return;

    const userText = isFridge
      ? `Chef, build me a 15-minute meal using these 3 fridge ingredients: ${promptText}`
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

    const updatedHistory = [...messages, userMsg];
    onAddMessage(userMsg);
    setIsThinking(true);

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
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await sendPrompt(text, false);
  };

  const handleFridgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridgeIngredients.trim()) return;
    await sendPrompt(fridgeIngredients, true);
  };

  const handleCitationClick = (cit: ValidatedCornermanCitation) => {
    if (cit.type === 'PlaybookSection' && cit.playbookId) {
      onOpenPlaybookCitation(cit.playbookId, cit.sectionIndex);
    } else if (cit.type === 'Recipe' && cit.recipeId) {
      onOpenRecipeCitation(cit.recipeId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Companion overview, Built-in independent tools, and 3-ingredient fridge generator */}
      <div className="lg:col-span-4 space-y-5">
        <section className="iron-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#7A263A] text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#7A263A]">
                24/7 recovery companion
              </span>
              <h1 className="font-display text-xl font-bold text-[#121518]">
                The Cornerman
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#334155] leading-relaxed">
            Plain, grounded support for after-shift cravings, pub plans, and stressful days. Chat history is kept only for your current session—tap <strong>Start over</strong> anytime to clear it.
          </p>

          {/* Always-Available Independent Tools (work with or without AI provider) */}
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
                Start Craving Reset (60s breathing)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onOpenHaltWorksheet}
                  className="iron-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#7A263A]" />
                  Open HALT worksheet
                </button>
                <button
                  type="button"
                  onClick={onViewLifelines}
                  className="iron-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* Right Column: Conversation Thread */}
      <section
        aria-label="Cornerman conversation"
        className="lg:col-span-8 iron-card flex flex-col h-[680px] overflow-hidden"
      >
        {/* Top Bar: Quick Prompts & Start Over */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-[#121518]">
                Session conversation (bounded context window)
              </span>
              <span className="text-xs text-[#475569] block">
                Private check-in notes are never included in chat requests.
              </span>
            </div>

            <button
              id="cornerman-start-over-btn"
              type="button"
              onClick={() => {
                setProviderNotice(null);
                onResetConversation();
              }}
              className="iron-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#7A263A]" />
              Start over
            </button>
          </div>

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
                onClick={() => sendPrompt(chip, false)}
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
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white"
        >
          {messages.map((msg) => {
            const isBot = msg.sender === 'cornerman';
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
                      className={`font-semibold ${
                        isBot ? 'text-[#7A263A]' : 'text-white/90'
                      }`}
                    >
                      {isBot ? 'Cornerman' : 'You'}
                    </span>
                    <span
                      className={`font-mono-metric ${
                        isBot ? 'text-[#475569]' : 'text-white/80'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Direct Action Button from Validated Structured Response */}
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
              <Bot className="w-4 h-4 text-[#7A263A] animate-pulse" />
              Cornerman is thinking...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleChatSubmit}
          className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2.5"
        >
          <label htmlFor="cornerman-chat-input" className="sr-only">
            Message Cornerman
          </label>
          <input
            id="cornerman-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Cornerman (e.g., 'I’ve just finished a brutal shift and I’m about to go to the pub')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs sm:text-sm text-[#121518]"
          />
          <button
            id="cornerman-send-btn"
            type="submit"
            className="iron-btn-primary py-2.5 px-5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </section>
    </div>
  );
};
