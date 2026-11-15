import {
  BookOpen,
  Bot,
  ChefHat,
  Send,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { askIroncladCornerman } from '../services/integrations';
import {
  ChatMessage,
  CornermanCitation,
  IntegrationConfig,
} from '../types/ironclad';

interface TheCornermanModuleProps {
  streakDays: number;
  config: IntegrationConfig;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onOpenPlaybookCitation: (playbookId: string) => void;
  onOpenRecipeCitation: (recipeId: string) => void;
}

const QUICK_ACTION_CHIPS = [
  '5 PM Craving Hit — Talk Me Down',
  "What's in the Fridge? (Give me a 15-min dopamine meal)",
  'UK Pub / Matchday Sober Script (How to turn down a pint)',
  'Work Stress & Burnout Reframe (CBT Check)',
];

export const TheCornermanModule: React.FC<TheCornermanModuleProps> = ({
  streakDays,
  config,
  messages,
  onAddMessage,
  onOpenPlaybookCitation,
  onOpenRecipeCitation,
}) => {
  const [input, setInput] = useState<string>('');
  const [fridgeIngredients, setFridgeIngredients] = useState<string>(
    'Eggs, Cavolo Nero, Tinned Cannellini Beans'
  );
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendPrompt = async (promptText: string, isFridge = false) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: isFridge
        ? `Chef, build me a 15-min gut-repairing dopamine meal using these 3 fridge ingredients: ${promptText}`
        : promptText,
    };

    onAddMessage(userMsg);
    setIsThinking(true);

    const reply = await askIroncladCornerman(
      promptText,
      streakDays,
      config,
      isFridge
    );

    const botMsg: ChatMessage = {
      id: `msg-c-${Date.now() + 1}`,
      sender: 'cornerman',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: reply.text,
      citations: reply.citations,
      isGeneratedRecipe: isFridge,
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

  const handleCitationClick = (cit: CornermanCitation) => {
    if (cit.type === 'Playbook') {
      onOpenPlaybookCitation(cit.referenceId);
    } else {
      onOpenRecipeCitation(cit.referenceId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Persona + 3-Ingredient Fridge Generator + RAG Vault Status */}
      <div className="lg:col-span-4 space-y-5">
        {/* Persona Card */}
        <div className="forge-card-claret rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7A263A] border-2 border-[#1BB1E7] flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-[#F8F9FA]" />
            </div>
            <div>
              <span className="text-[11px] font-mono-metric uppercase text-[#1BB1E7] block">
                24/7 AI MENTOR & HEAD CHEF
              </span>
              <h1 className="font-display text-xl font-bold text-[#F8F9FA] uppercase">
                THE IRONCLAD CORNERMAN
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#F8F9FA]/90 leading-relaxed">
            “Mate, whether it’s Friday 4:55 PM when the pub starts calling, or 3:00 AM when your head won’t shut up—I’m in your corner. Zero corporate fluff, zero judgment. Just lived recovery tactics and proper chef nutrition.”
          </p>

          <div className="bg-[#121518]/80 border border-[#2E353D] rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">RAG Knowledge Vault:</span>
              <span className="text-emerald-400 font-mono-metric font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 5 Playbooks + 5 Recipes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Engine Mode:</span>
              <span className="text-[#1BB1E7] font-mono-metric">
                {config.geminiApiKey ? 'Gemini 2.5 Live + RAG' : 'Embedded RAG Mentor'}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Ingredient Fridge-to-Recipe Generator */}
        <div className="forge-card-sky rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold">
            <ChefHat className="w-4 h-4" /> 3-INGREDIENT FRIDGE DOPAMINE GENERATOR
          </div>
          <h2 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
            WHAT’S IN YOUR FRIDGE RIGHT NOW?
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Type any 3 random ingredients from your fridge or cupboard. The Cornerman will build an instant, gut-repairing 12-minute shift meal.
          </p>

          <form onSubmit={handleFridgeSubmit} className="space-y-2.5">
            <input
              id="fridge-ingredients-input"
              type="text"
              value={fridgeIngredients}
              onChange={(e) => setFridgeIngredients(e.target.value)}
              placeholder="e.g., Eggs, Spinach, Tinned Chickpeas"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
            />
            <button
              id="generate-fridge-recipe-btn"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1BB1E7] hover:bg-[#1BB1E7]/90 text-[#121518] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              BUILD 12-MIN DOPAMINE RECIPE
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Main Cornerman Chat Interface */}
      <div className="lg:col-span-8 forge-card rounded-2xl flex flex-col h-[680px] overflow-hidden">
        {/* Header + 4 Quick-Action Prompt Chips */}
        <div className="p-4 sm:p-5 bg-[#121518]/90 border-b border-[#2E353D] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-metric uppercase text-[#94A3B8]">
              QUICK-ACTION TACTICAL PROMPTS (TAP TO DISPATCH)
            </span>
            <span className="text-xs font-mono-metric text-[#1BB1E7]">
              Day {streakDays} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_ACTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendPrompt(chip, false)}
                className="text-left px-3 py-2 rounded-xl bg-[#1E2328] hover:bg-[#7A263A]/40 border border-[#2E353D] hover:border-[#1BB1E7]/60 text-xs font-medium text-[#F8F9FA] transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="truncate">“{chip}”</span>
                <Send className="w-3 h-3 text-[#1BB1E7] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'cornerman';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 space-y-3 ${
                    isBot
                      ? 'bg-[#121518] border border-[#2E353D] text-[#F8F9FA]'
                      : 'bg-[#7A263A] text-white border border-[#1BB1E7]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
                    <span className="font-mono-metric font-bold uppercase text-[#1BB1E7]">
                      {isBot ? 'IRONCLAD CORNERMAN • HEAD CHEF MENTOR' : 'YOU'}
                    </span>
                    <span className="font-mono-metric">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* RAG Citation Badges */}
                  {isBot && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t border-[#2E353D] space-y-1.5">
                      <span className="text-[10px] font-mono-metric uppercase text-[#94A3B8] block">
                        VERIFIED IRONCLAD RAG SOURCES (CLICK TO OPEN):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit) => (
                          <button
                            key={cit.id}
                            onClick={() => handleCitationClick(cit)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E2328] hover:bg-[#7A263A]/50 border border-[#1BB1E7]/40 text-[11px] font-mono-metric text-[#1BB1E7] transition cursor-pointer"
                          >
                            {cit.type === 'Playbook' ? (
                              <BookOpen className="w-3 h-3" />
                            ) : (
                              <Utensils className="w-3 h-3" />
                            )}
                            {cit.title}
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
            <div className="flex items-center gap-2 text-xs text-[#1BB1E7] font-mono-metric p-3 bg-[#121518] rounded-xl border border-[#2E353D] w-fit">
              <Bot className="w-4 h-4 animate-pulse" />
              Cornerman is checking the Playbooks & recipe pass...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleChatSubmit}
          className="p-4 bg-[#121518] border-t border-[#2E353D] flex items-center gap-2.5"
        >
          <input
            id="cornerman-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to your Cornerman (e.g., '5 PM craving hit after shift' or 'How do I handle a wedding bar?')..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#1E2328] border border-[#2E353D] text-xs sm:text-sm text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
          />
          <button
            id="cornerman-send-btn"
            type="submit"
            className="py-3 px-5 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#1BB1E7]" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
