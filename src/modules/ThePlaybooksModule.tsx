import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Copy,
  FileSignature,
  Printer,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PLAYBOOKS } from '../data/ironcladData';
import { CBTWorksheetEntry, Playbook } from '../types/ironclad';

interface ThePlaybooksModuleProps {
  cbtEntries: CBTWorksheetEntry[];
  onSaveCBTEntry: (entry: CBTWorksheetEntry) => void;
  onAskCornermanAboutPlaybook: (playbook: Playbook) => void;
  onTriggerDocuSealWebhook: (companyName: string) => void;
  initialOpenPlaybookId?: string | null;
}

export const ThePlaybooksModule: React.FC<ThePlaybooksModuleProps> = ({
  cbtEntries,
  onSaveCBTEntry,
  onAskCornermanAboutPlaybook,
  onTriggerDocuSealWebhook,
  initialOpenPlaybookId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Playbook 4 (HALT & CBT Worksheet) state
  const [haltStates, setHaltStates] = useState<
    ('Hungry' | 'Angry' | 'Lonely' | 'Tired')[]
  >(['Hungry', 'Tired']);
  const [triggerSituation, setTriggerSituation] = useState<string>('');
  const [cravingRating, setCravingRating] = useState<number>(7);
  const [automaticThought, setAutomaticThought] = useState<string>('');
  const [cognitiveDistortion, setCognitiveDistortion] = useState<string>(
    'Short-Term Magnification ("Just one or two pints to switch off")'
  );
  const [ironcladReframe, setIroncladReframe] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [cbtSavedBanner, setCbtSavedBanner] = useState<boolean>(false);

  // Playbook 5 DocuSeal state
  const [b2bCompanySignName, setB2bCompanySignName] = useState<string>(
    'East London Kitchens Ltd'
  );
  const [docuSealSignedBanner, setDocuSealSignedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (initialOpenPlaybookId) {
      const found = PLAYBOOKS.find((p) => p.id === initialOpenPlaybookId);
      if (found) setActivePlaybook(found);
    }
  }, [initialOpenPlaybookId]);

  const filteredPlaybooks = PLAYBOOKS.filter((pb) => {
    const q = searchQuery.toLowerCase();
    return (
      pb.title.toLowerCase().includes(q) ||
      pb.subtitle.toLowerCase().includes(q) ||
      pb.category.toLowerCase().includes(q) ||
      pb.summary.toLowerCase().includes(q)
    );
  });

  const handleCopyPlaybook = (pb: Playbook) => {
    const text = [
      `IRONCLAD MINDSET — PLAYBOOK ${pb.number}: ${pb.title.toUpperCase()}`,
      pb.subtitle,
      '',
      `SUMMARY: ${pb.summary}`,
      '',
      'KEY TAKEAWAYS:',
      ...pb.keyTakeaways.map((k) => `• ${k}`),
      '',
      ...pb.sections.flatMap((s) => [
        `--- ${s.heading} ---`,
        ...s.body,
        ...(s.actionPoints ? s.actionPoints.map((a) => `Action: ${a}`) : []),
        '',
      ]),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(pb.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAutoGenerateReframe = () => {
    const haltList = haltStates.length > 0 ? haltStates.join(' & ') : 'exhausted';
    const generated = `My brain is currently ${haltList} after a high-pressure shift. "${
      automaticThought || 'Having a drink to switch off'
    }" is a temporary 20-minute trap that steals tomorrow's dopamine and sleep. Eating 35g+ of protein, hydrating with a cold ginger ACV spritz, and getting 8 hours of proper rest will actually fix the root cause.`;
    setIroncladReframe(generated);
  };

  const handleCBTFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerSituation.trim() && !automaticThought.trim()) return;

    const entry: CBTWorksheetEntry = {
      id: `cbt-${Date.now()}`,
      createdAt: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      haltStates,
      triggerSituation:
        triggerSituation.trim() || 'End-of-shift pressure & fatigue',
      cravingRating,
      automaticThought:
        automaticThought.trim() || 'I need a pint to bring my shoulders down.',
      cognitiveDistortion,
      ironcladReframe:
        ironcladReframe.trim() ||
        'My nervous system needs protein, electrolytes, and real rest—not a 3 AM cortisol spike.',
      actionTaken:
        actionTaken.trim() ||
        'Completed HALT check, cooked a 12-min skillet meal, held the line.',
    };

    onSaveCBTEntry(entry);
    setTriggerSituation('');
    setAutomaticThought('');
    setIroncladReframe('');
    setActionTaken('');
    setCbtSavedBanner(true);
    setTimeout(() => setCbtSavedBanner(false), 3000);
  };

  const toggleHaltState = (state: 'Hungry' | 'Angry' | 'Lonely' | 'Tired') => {
    setHaltStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  return (
    <div className="space-y-6">
      {/* Vault Header & Search Bar */}
      <div className="forge-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> INTERACTIVE DOCUMENT VAULT & CBT WORKSHEETS
          </span>
          <h1 className="font-display text-2xl font-bold text-[#F8F9FA] uppercase mt-0.5">
            THE 5 IRONCLAD PLAYBOOKS
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Complete field manuals for your first 30 days, £40 mood-food shopping, UK matchdays, live CBT trigger reframing, and B2B workplace policy.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search playbooks, CBT, pub scripts, B2B..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
          />
        </div>
      </div>

      {/* Playbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlaybooks.map((pb) => (
          <div
            key={pb.id}
            className="forge-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#1BB1E7]/60 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-metric font-bold uppercase px-2.5 py-1 rounded bg-[#7A263A] text-white border border-[#1BB1E7]/40">
                  PLAYBOOK 0{pb.number} • {pb.category}
                </span>
                <span className="text-[11px] font-mono-metric text-[#94A3B8]">
                  {pb.readTime}
                </span>
              </div>

              <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase leading-snug">
                {pb.title}
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {pb.summary}
              </p>

              <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-mono-metric uppercase text-[#1BB1E7]">
                  CORE TAKEAWAYS:
                </div>
                <ul className="space-y-1 text-xs text-[#F8F9FA]/90">
                  {pb.keyTakeaways.map((kt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#1BB1E7] font-bold">•</span>
                      <span>{kt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setActivePlaybook(pb)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#1BB1E7]" />
                {pb.isInteractiveCBT
                  ? 'OPEN INTERACTIVE CBT WORKSHEET'
                  : 'READ FULL PLAYBOOK'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyPlaybook(pb)}
                  className="py-2 px-3 rounded-lg bg-[#121518] hover:bg-[#1E2328] border border-[#2E353D] text-[11px] font-mono-metric text-[#94A3B8] hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#1BB1E7]" />
                  {copiedId === pb.id ? 'Copied!' : 'Copy Text'}
                </button>
                <button
                  onClick={() => onAskCornermanAboutPlaybook(pb)}
                  className="py-2 px-3 rounded-lg bg-[#121518] hover:bg-[#1E2328] border border-[#2E353D] text-[11px] font-mono-metric text-[#1BB1E7] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask Cornerman
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Saved HALT & CBT Trigger Journal Entries Preview */}
      <div className="forge-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
              PLAYBOOK 4 LIVE JOURNAL ARCHIVE
            </span>
            <h2 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
              YOUR SAVED HALT & CBT TRIGGER REFRAMES ({cbtEntries.length})
            </h2>
          </div>
          <button
            onClick={() =>
              setActivePlaybook(
                PLAYBOOKS.find((p) => p.id === 'playbook-4') || PLAYBOOKS[3]
              )
            }
            className="py-2 px-4 rounded-xl bg-[#1BB1E7] text-[#121518] font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            + Log New Trigger Reframe
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cbtEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.haltStates.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded bg-[#7A263A]/40 border border-[#7A263A] text-white font-mono-metric text-[10px] uppercase"
                    >
                      HALT: {h}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-[#E63946]/20 text-[#E63946] font-mono-metric text-[10px]">
                    Craving {entry.cravingRating}/10
                  </span>
                </div>
                <span className="font-mono-metric text-[11px] text-[#94A3B8]">
                  {entry.createdAt}
                </span>
              </div>

              <div>
                <span className="text-[#94A3B8] font-semibold">Trigger: </span>
                <span className="text-[#F8F9FA]">{entry.triggerSituation}</span>
              </div>
              <div>
                <span className="text-[#E63946] font-semibold">
                  Automatic Thought:{' '}
                </span>
                <span className="italic text-[#94A3B8]">
                  “{entry.automaticThought}”
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1E2328] border-l-2 border-[#1BB1E7]">
                <span className="text-[#1BB1E7] font-bold">
                  Ironclad Reframe:{' '}
                </span>
                <span className="text-[#F8F9FA]">{entry.ironcladReframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL PLAYBOOK READER MODAL (Including Interactive Playbook 4 Worksheet & Playbook 5 DocuSeal Hook) */}
      <AnimatePresence>
        {activePlaybook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-[#121518] border border-[#1BB1E7]/50 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              {/* Reader Modal Header */}
              <div className="bg-[#1E2328] border-b border-[#2E353D] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
                    IRONCLAD PLAYBOOK 0{activePlaybook.number} • {activePlaybook.category}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F9FA] uppercase">
                    {activePlaybook.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={() => handleCopyPlaybook(activePlaybook)}
                    className="py-2 px-3 rounded-lg bg-[#121518] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    {copiedId === activePlaybook.id ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-3 rounded-lg bg-[#121518] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    Print / Save PDF
                  </button>
                  <button
                    onClick={() => {
                      const pb = activePlaybook;
                      setActivePlaybook(null);
                      onAskCornermanAboutPlaybook(pb);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#7A263A] hover:bg-[#9E334D] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    Ask Cornerman About This Guide
                  </button>
                  <button
                    onClick={() => setActivePlaybook(null)}
                    className="p-2 rounded-lg bg-[#121518] hover:bg-[#2E353D] text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reader Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                <div className="forge-card-claret rounded-xl p-4 space-y-2">
                  <p className="text-xs sm:text-sm text-[#F8F9FA] leading-relaxed">
                    {activePlaybook.summary}
                  </p>
                </div>

                {activePlaybook.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="forge-card rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
                        {sec.heading}
                      </h3>
                      {sec.badge && (
                        <span className="text-[11px] font-mono-metric px-2.5 py-0.5 rounded bg-[#1BB1E7]/15 text-[#1BB1E7] border border-[#1BB1E7]/30">
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5 text-xs sm:text-sm text-[#F8F9FA]/90 leading-relaxed">
                      {sec.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    {sec.actionPoints && sec.actionPoints.length > 0 && (
                      <div className="pt-3 border-t border-[#2E353D] space-y-1.5">
                        <div className="text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold">
                          IRONCLAD FIELD ACTIONS:
                        </div>
                        <ul className="space-y-1 text-xs text-emerald-300">
                          {sec.actionPoints.map((ap, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{ap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Interactive CBT Trigger Worksheet inside Playbook 4 */}
                {activePlaybook.isInteractiveCBT && (
                  <form
                    onSubmit={handleCBTFormSubmit}
                    className="forge-card-sky rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold">
                          LIVE INTERACTIVE WORKSHEET
                        </span>
                        <h3 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
                          LOG A TRIGGER & GENERATE YOUR BALANCED REFRAME
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoGenerateReframe}
                        className="py-1.5 px-3 rounded-lg bg-[#1BB1E7] text-[#121518] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto-Generate Chef CBT Reframe
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block">
                        1. Active HALT Vulnerability States (Select all that apply)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['Hungry', 'Angry', 'Lonely', 'Tired'] as const).map(
                          (st) => {
                            const active = haltStates.includes(st);
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => toggleHaltState(st)}
                                className={`py-2 rounded-lg font-display text-xs uppercase border transition cursor-pointer ${
                                  active
                                    ? 'bg-[#7A263A] text-white border-[#1BB1E7]'
                                    : 'bg-[#121518] text-[#94A3B8] border-[#2E353D]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                          2. Trigger Situation (Where are you / What happened?)
                        </label>
                        <input
                          type="text"
                          value={triggerSituation}
                          onChange={(e) => setTriggerSituation(e.target.value)}
                          placeholder="e.g., Finished 12-hour Friday service, lads going to the pub"
                          className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                          3. Craving Intensity ({cravingRating}/10)
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={cravingRating}
                          onChange={(e) =>
                            setCravingRating(Number(e.target.value))
                          }
                          className="iron-slider w-full mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                          4. Automatic Permissive Thought
                        </label>
                        <input
                          type="text"
                          value={automaticThought}
                          onChange={(e) => setAutomaticThought(e.target.value)}
                          placeholder="e.g., 'I deserve two pints to switch my head off'"
                          className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                          5. Cognitive Distortion Trap
                        </label>
                        <select
                          value={cognitiveDistortion}
                          onChange={(e) =>
                            setCognitiveDistortion(e.target.value)
                          }
                          className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                        >
                          <option>
                            Short-Term Magnification ("Just one or two pints to switch off")
                          </option>
                          <option>
                            All-or-Nothing Thinking ("Today was ruined anyway")
                          </option>
                          <option>
                            Emotional Reasoning ("I feel stressed so I need a sedative")
                          </option>
                          <option>
                            Reward Fallacy ("I grafted hard so poison is my reward")
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono-metric uppercase text-[#1BB1E7] block mb-1">
                        6. Balanced Ironclad Reframe (Prefrontal Cortex Truth)
                      </label>
                      <textarea
                        rows={2}
                        value={ironcladReframe}
                        onChange={(e) => setIroncladReframe(e.target.value)}
                        placeholder="Click 'Auto-Generate Chef CBT Reframe' above or write your grounded truth..."
                        className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                        7. Immediate Replacement Action Taken
                      </label>
                      <input
                        type="text"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g., Drank Witching Hour ginger spritz & cooked 12-min steak skillet"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-sm uppercase tracking-wider cursor-pointer"
                    >
                      SAVE CBT REFRAME TO MY IRONCLAD JOURNAL
                    </button>

                    {cbtSavedBanner && (
                      <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Trigger reframe saved to your Playbook 4 Journal Archive!
                      </div>
                    )}
                  </form>
                )}

                {/* DocuSeal Policy Sign-Off Hook inside Playbook 5 */}
                {activePlaybook.isB2BPolicy && (
                  <div className="forge-card-sky rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold">
                      <FileSignature className="w-4 h-4" /> DOCUSEAL WORKPLACE CHARTER ADOPTION HOOK
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
                      DIGITALLY SIGN & DEPLOY THIS POLICY FOR YOUR UK TEAM
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Enter your company or venue name below to trigger a DocuSeal workplace charter sign-off pack and log it to your n8n / Twenty CRM pipeline.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={b2bCompanySignName}
                        onChange={(e) => setB2bCompanySignName(e.target.value)}
                        placeholder="Your UK Company / Kitchen / Site Name"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerDocuSealWebhook(b2bCompanySignName);
                          setDocuSealSignedBanner(true);
                        }}
                        className="py-2.5 px-5 rounded-xl bg-[#1BB1E7] text-[#121518] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileSignature className="w-4 h-4" />
                        Launch DocuSeal Charter Sign-Off
                      </button>
                    </div>
                    {docuSealSignedBanner && (
                      <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> DocuSeal Workplace Policy Sign-Off session initialized for{' '}
                        <strong>{b2bCompanySignName}</strong> & webhook dispatched to n8n!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
