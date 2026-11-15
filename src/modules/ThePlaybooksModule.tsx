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
  initialOpenSectionIndex?: number | null;
}

export const ThePlaybooksModule: React.FC<ThePlaybooksModuleProps> = ({
  cbtEntries,
  onSaveCBTEntry,
  onAskCornermanAboutPlaybook,
  onTriggerDocuSealWebhook,
  initialOpenPlaybookId,
  initialOpenSectionIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [highlightedSectionIdx, setHighlightedSectionIdx] = useState<
    number | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Playbook 4 (HALT & CBT Worksheet) state
  const [haltStates, setHaltStates] = useState<
    ('Hungry' | 'Angry' | 'Lonely' | 'Tired')[]
  >(['Hungry', 'Tired']);
  const [triggerSituation, setTriggerSituation] = useState<string>('');
  const [cravingRating, setCravingRating] = useState<number>(7);
  const [automaticThought, setAutomaticThought] = useState<string>('');
  const [cognitiveDistortion, setCognitiveDistortion] = useState<string>(
    'Short-term magnification ("Just one or two pints to switch off")'
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
      if (found) {
        setActivePlaybook(found);
        setHighlightedSectionIdx(
          typeof initialOpenSectionIndex === 'number'
            ? initialOpenSectionIndex
            : null
        );
      }
    }
  }, [initialOpenPlaybookId, initialOpenSectionIndex]);

  useEffect(() => {
    if (
      activePlaybook &&
      typeof highlightedSectionIdx === 'number'
    ) {
      const el = document.getElementById(
        `${activePlaybook.id}-section-${highlightedSectionIdx}`
      );
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
      }
    }
  }, [activePlaybook, highlightedSectionIdx]);

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
      `Ironclad Mindset — Playbook ${pb.number}: ${pb.title}`,
      pb.subtitle,
      '',
      `Summary: ${pb.summary}`,
      '',
      'Key takeaways:',
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
    const haltList =
      haltStates.length > 0 ? haltStates.join(' and ').toLowerCase() : 'tired';
    const generated = `I am feeling ${haltList} after a demanding shift. "${
      automaticThought || 'Having a drink to switch off'
    }" is a short-term urge that steals tomorrow's energy and sleep. Eating a hot meal, drinking a cold ginger spritz, and getting proper rest will actually help me recover.`;
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
        triggerSituation.trim() || 'End-of-shift pressure and fatigue',
      cravingRating,
      automaticThought:
        automaticThought.trim() || 'I need a pint to bring my shoulders down.',
      cognitiveDistortion,
      ironcladReframe:
        ironcladReframe.trim() ||
        'My body needs proper food, water, and rest—not borrowed calm from tomorrow.',
      actionTaken:
        actionTaken.trim() ||
        'Completed HALT check, cooked a 12-minute skillet meal, held the line.',
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
      {/* Header & Search */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Practical guides & interactive worksheets
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            The Playbooks
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Step-by-step guides for your first 30 days, £40 food shopping, UK matchdays, HALT & CBT reframing, and workplace policy.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <label htmlFor="playbook-search-input" className="sr-only">
            Search playbooks
          </label>
          <input
            id="playbook-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search playbooks, CBT, pub scripts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#121518]"
          />
        </div>
      </section>

      {/* Playbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlaybooks.map((pb) => (
          <article
            key={pb.id}
            className="iron-card p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FDF2F4] text-[#7A263A] border border-[#7A263A]/20">
                  Playbook {pb.number} • {pb.category}
                </span>
                <span className="text-xs text-[#475569]">{pb.readTime}</span>
              </div>

              <h2 className="font-display text-xl font-bold text-[#121518] leading-snug">
                {pb.title}
              </h2>
              <p className="text-xs text-[#334155] leading-relaxed">
                {pb.summary}
              </p>

              <div className="iron-surface p-3 space-y-1.5">
                <div className="text-xs font-semibold text-[#121518]">
                  Key takeaways
                </div>
                <ul className="space-y-1 text-xs text-[#334155]">
                  {pb.keyTakeaways.map((kt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#7A263A] font-bold">•</span>
                      <span>{kt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                id={`open-${pb.id}-btn`}
                type="button"
                onClick={() => {
                  setHighlightedSectionIdx(null);
                  setActivePlaybook(pb);
                }}
                className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                {pb.isInteractiveCBT
                  ? 'Open interactive HALT & CBT worksheet'
                  : 'Read full playbook'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPlaybook(pb)}
                  className="iron-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7A263A]" />
                  {copiedId === pb.id ? 'Copied' : 'Copy text'}
                </button>
                <button
                  type="button"
                  onClick={() => onAskCornermanAboutPlaybook(pb)}
                  className="iron-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#0284C7]" />
                  Ask Cornerman
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Saved HALT & CBT Journal Archive */}
      <section className="iron-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-[#7A263A]">
              Playbook 4 worksheet archive
            </span>
            <h2 className="font-display text-lg font-bold text-[#121518]">
              Saved HALT & CBT trigger reframes ({cbtEntries.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              setActivePlaybook(
                PLAYBOOKS.find((p) => p.id === 'playbook-4') || PLAYBOOKS[3]
              )
            }
            className="iron-btn-primary py-2 px-4 text-xs cursor-pointer"
          >
            + Log new trigger reframe
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cbtEntries.map((entry) => (
            <div
              key={entry.id}
              className="iron-surface p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.haltStates.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#121518] font-medium text-[11px]"
                    >
                      HALT: {h}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-[#FDF2F4] text-[#7A263A] font-semibold text-[11px]">
                    Craving {entry.cravingRating}/10
                  </span>
                </div>
                <span className="font-mono-metric text-[11px] text-[#475569]">
                  {entry.createdAt}
                </span>
              </div>

              <div>
                <span className="text-[#475569] font-semibold">Trigger: </span>
                <span className="text-[#121518]">{entry.triggerSituation}</span>
              </div>
              <div>
                <span className="text-[#B91C1C] font-semibold">
                  Automatic thought:{' '}
                </span>
                <span className="italic text-[#334155]">
                  “{entry.automaticThought}”
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border-l-4 border-[#7A263A] border border-[#E2E8F0]">
                <span className="text-[#7A263A] font-semibold">
                  Balanced reframe:{' '}
                </span>
                <span className="text-[#121518]">{entry.ironcladReframe}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playbook Reader Modal */}
      <AnimatePresence>
        {activePlaybook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#121518]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="playbook-reader-title"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-2xl shadow-lg overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#7A263A]">
                    Playbook {activePlaybook.number} • {activePlaybook.category}
                  </span>
                  <h2
                    id="playbook-reader-title"
                    className="font-display text-xl sm:text-2xl font-bold text-[#121518]"
                  >
                    {activePlaybook.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => handleCopyPlaybook(activePlaybook)}
                    className="iron-btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7A263A]" />
                    {copiedId === activePlaybook.id ? 'Copied' : 'Copy text'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="iron-btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#7A263A]" />
                    Print / Save PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pb = activePlaybook;
                      setActivePlaybook(null);
                      onAskCornermanAboutPlaybook(pb);
                    }}
                    className="iron-btn-primary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Ask Cornerman
                  </button>
                  <button
                    id="close-playbook-modal-btn"
                    type="button"
                    onClick={() => setActivePlaybook(null)}
                    className="p-2 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#121518] cursor-pointer"
                    aria-label="Close playbook reader"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                <div className="iron-surface p-4">
                  <p className="text-xs sm:text-sm text-[#121518] leading-relaxed">
                    {activePlaybook.summary}
                  </p>
                </div>

                {activePlaybook.sections.map((sec, idx) => {
                  const isHighlighted = highlightedSectionIdx === idx;
                  return (
                    <div
                      key={idx}
                      id={`${activePlaybook.id}-section-${idx}`}
                      className={`p-5 rounded-xl border space-y-3 ${
                        isHighlighted
                          ? 'bg-[#F0F9FF] border-[#0284C7] ring-1 ring-[#0284C7]'
                          : 'bg-white border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-display text-lg font-bold text-[#121518]">
                          {sec.heading}
                        </h3>
                        {sec.badge && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-[#F8FAFC] text-[#7A263A] border border-[#CBD5E1]">
                            {sec.badge}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2.5 text-xs sm:text-sm text-[#334155] leading-relaxed">
                        {sec.body.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                      {sec.actionPoints && sec.actionPoints.length > 0 && (
                        <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5">
                          <div className="text-xs font-semibold text-[#7A263A]">
                            Practical steps:
                          </div>
                          <ul className="space-y-1 text-xs text-[#121518]">
                            {sec.actionPoints.map((ap, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                                <span>{ap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Interactive HALT & CBT Worksheet inside Playbook 4 */}
                {activePlaybook.isInteractiveCBT && (
                  <form
                    onSubmit={handleCBTFormSubmit}
                    className="iron-surface p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#7A263A]">
                          Interactive worksheet
                        </span>
                        <h3 className="font-display text-lg font-bold text-[#121518]">
                          Log a trigger and generate a balanced reframe
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoGenerateReframe}
                        className="iron-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#7A263A]" />
                        Suggest balanced reframe
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-medium text-[#334155] block">
                        1. Active HALT states
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {(['Hungry', 'Angry', 'Lonely', 'Tired'] as const).map(
                          (st) => {
                            const active = haltStates.includes(st);
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => toggleHaltState(st)}
                                aria-pressed={active}
                                className={`py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                  active
                                    ? 'bg-[#7A263A] text-white border-[#7A263A]'
                                    : 'bg-white text-[#334155] border-[#CBD5E1]'
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
                        <label className="text-xs font-medium text-[#334155] block mb-1">
                          2. Trigger situation
                        </label>
                        <input
                          type="text"
                          value={triggerSituation}
                          onChange={(e) => setTriggerSituation(e.target.value)}
                          placeholder="e.g., Finished 12-hour Friday service, team going to the pub"
                          className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#334155] block mb-1">
                          3. Craving intensity ({cravingRating}/10)
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
                        <label className="text-xs font-medium text-[#334155] block mb-1">
                          4. Automatic thought
                        </label>
                        <input
                          type="text"
                          value={automaticThought}
                          onChange={(e) => setAutomaticThought(e.target.value)}
                          placeholder="e.g., 'I deserve two pints to switch my head off'"
                          className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#334155] block mb-1">
                          5. Thinking pattern
                        </label>
                        <select
                          value={cognitiveDistortion}
                          onChange={(e) =>
                            setCognitiveDistortion(e.target.value)
                          }
                          className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                        >
                          <option>
                            Short-term magnification ("Just one or two pints to switch off")
                          </option>
                          <option>
                            All-or-nothing thinking ("Today was ruined anyway")
                          </option>
                          <option>
                            Emotional reasoning ("I feel stressed so I need a drink")
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#334155] block mb-1">
                        6. Balanced reframe
                      </label>
                      <textarea
                        rows={2}
                        value={ironcladReframe}
                        onChange={(e) => setIroncladReframe(e.target.value)}
                        placeholder="Write your grounded reframe..."
                        className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#334155] block mb-1">
                        7. Practical next step
                      </label>
                      <input
                        type="text"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g., Drank ginger spritz & cooked 12-minute steak skillet"
                        className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="iron-btn-primary w-full py-2.5 text-xs cursor-pointer"
                    >
                      Save reframe to worksheet archive
                    </button>

                    {cbtSavedBanner && (
                      <div
                        role="status"
                        className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Saved to your Playbook 4 worksheet archive.
                      </div>
                    )}
                  </form>
                )}

                {/* DocuSeal Policy Hook inside Playbook 5 */}
                {activePlaybook.isB2BPolicy && (
                  <div className="iron-surface p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7A263A]">
                      <FileSignature className="w-4 h-4" /> DocuSeal workplace charter sign-off
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#121518]">
                      Deploy this policy for your UK team
                    </h3>
                    <p className="text-xs text-[#475569]">
                      Enter your company or venue name below to trigger a DocuSeal workplace charter sign-off pack.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={b2bCompanySignName}
                        onChange={(e) => setB2bCompanySignName(e.target.value)}
                        placeholder="Company or venue name"
                        className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerDocuSealWebhook(b2bCompanySignName);
                          setDocuSealSignedBanner(true);
                        }}
                        className="iron-btn-primary py-2 px-5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileSignature className="w-4 h-4" />
                        Launch DocuSeal charter sign-off
                      </button>
                    </div>
                    {docuSealSignedBanner && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" /> DocuSeal sign-off initialized for{' '}
                        <strong>{b2bCompanySignName}</strong>.
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
