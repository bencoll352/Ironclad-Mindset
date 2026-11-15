import confetti from 'canvas-confetti';
import {
  Anchor,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Crown,
  Download,
  Flame,
  Hammer,
  Lock,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FOUNDER_MANIFESTO } from '../data/ironcladData';
import {
  build28DayHeatmapFromDatedEntries,
  DatedCheckIn,
} from '../db/checkinsDb';
import {
  EarnedBadgeRecord,
  evaluateMilestoneProgress,
  IronMilestoneWithState,
} from '../services/milestones';
import { NonNegotiableTask } from '../types/ironclad';

interface TheForgeModuleProps {
  streakDays: number;
  earnedBadges: EarnedBadgeRecord[];
  onIncrementStreak: () => void;
  onSetStreakDays: (days: number) => void;
  onResetStreakKeepBadges: () => void;
  weeklySpendGBP: number;
  onChangeWeeklySpend: (spend: number) => void;
  tasks: NonNegotiableTask[];
  onToggleTask: (id: string) => void;
  onAddCustomTask: (label: string) => void;
  checkIns: DatedCheckIn[];
  onSaveCheckIn: (
    input: Omit<DatedCheckIn, 'updatedAt'>
  ) => Promise<void>;
  onDeleteCheckIn: (date: string) => Promise<void>;
  onClearAllCheckIns: () => Promise<void>;
  onExportCheckIns: () => Promise<string>;
  onRestoreCheckIns: (jsonText: string) => Promise<{ restoredCount: number }>;
}

const TRIGGER_SUGGESTIONS = [
  'After-shift fatigue',
  'Friday 5pm transition',
  'Pub or social invite',
  'Work stress',
  'Quiet evening alone',
];

const HELPED_SUGGESTIONS = [
  'Cooked a proper meal',
  'Craving Reset breathing',
  '0.0% drink swap',
  '15-minute walk outside',
  'Spoke with Cornerman',
];

export const TheForgeModule: React.FC<TheForgeModuleProps> = ({
  streakDays,
  earnedBadges,
  onIncrementStreak,
  onResetStreakKeepBadges,
  weeklySpendGBP,
  onChangeWeeklySpend,
  tasks,
  onToggleTask,
  onAddCustomTask,
  checkIns,
  onSaveCheckIn,
  onDeleteCheckIn,
  onClearAllCheckIns,
  onExportCheckIns,
  onRestoreCheckIns,
}) => {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Check-in form state
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [alcoholFree, setAlcoholFree] = useState<boolean>(true);
  const [cravingIntensity, setCravingIntensity] = useState<number>(2);
  const [mood, setMood] = useState<number>(8);
  const [trigger, setTrigger] = useState<string>('');
  const [whatHelped, setWhatHelped] = useState<string>('');
  const [privateNote, setPrivateNote] = useState<string>('');
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Secondary Founder Story state (collapsed by default)
  const [manifestoExpanded, setManifestoExpanded] = useState<boolean>(false);
  const [copiedManifesto, setCopiedManifesto] = useState<boolean>(false);

  // Backup / Restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkInFormRef = useRef<HTMLFormElement>(null);

  // Evaluate all 12 Iron Milestones
  const milestoneSummary = useMemo(
    () => evaluateMilestoneProgress(streakDays, earnedBadges),
    [streakDays, earnedBadges]
  );

  // Generate 28-day heatmap strictly from actual dated entries
  const heatmapCells = useMemo(
    () => build28DayHeatmapFromDatedEntries(checkIns, todayISO),
    [checkIns, todayISO]
  );

  // Trend chart data from logged dated check-ins (sorted chronologically, last 14 entries)
  const trendData = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((entry) => ({
        dateLabel: entry.date.slice(5), // MM-DD
        fullDate: entry.date,
        craving:
          typeof entry.cravingIntensity === 'number'
            ? entry.cravingIntensity
            : 0,
        mood: typeof entry.mood === 'number' ? entry.mood : null,
      }));
  }, [checkIns]);

  const moneySavedGBP = ((streakDays / 7) * weeklySpendGBP).toFixed(0);

  const loadDateIntoForm = (dateISO: string) => {
    setSelectedDate(dateISO);
    const existing = checkIns.find((c) => c.date === dateISO);
    if (existing) {
      setAlcoholFree(existing.alcoholFree);
      setCravingIntensity(existing.cravingIntensity ?? 2);
      setMood(existing.mood ?? 8);
      setTrigger(existing.trigger || '');
      setWhatHelped(existing.whatHelped || '');
      setPrivateNote(existing.privateNote || '');
    } else {
      setAlcoholFree(true);
      setCravingIntensity(2);
      setMood(8);
      setTrigger('');
      setWhatHelped('');
      setPrivateNote('');
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNewTodayCheckIn =
      selectedDate === todayISO &&
      !checkIns.some((c) => c.date === todayISO);

    await onSaveCheckIn({
      date: selectedDate,
      alcoholFree,
      cravingIntensity,
      mood,
      trigger: trigger.trim() || undefined,
      whatHelped: whatHelped.trim() || undefined,
      privateNote: privateNote.trim() || undefined,
      completedTasks: tasks.filter((t) => t.completed).length,
    });

    if (!alcoholFree && selectedDate === todayISO) {
      onResetStreakKeepBadges();
      setSavedNotice(
        `Check-in saved for ${selectedDate}. Active streak reset to Day 0 while keeping your ${milestoneSummary.unlockedCount} earned milestones safe.`
      );
    } else if (isNewTodayCheckIn && alcoholFree) {
      onIncrementStreak();
      setSavedNotice(`Logged ${selectedDate} in The Forge and added +1 alcohol-free day.`);
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#7A263A', '#0284C7', '#121518'],
        });
      } catch {
        // Ignore in headless environment
      }
    } else {
      setSavedNotice(`Saved check-in for ${selectedDate}.`);
    }

    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleExportClick = async () => {
    const json = await onExportCheckIns();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironclad-checkins-${todayISO}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedNotice('Exported on-device check-ins backup file.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleRestoreFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { restoredCount } = await onRestoreCheckIns(text);
      setSavedNotice(`Restored ${restoredCount} dated check-ins without duplicates.`);
      setTimeout(() => setSavedNotice(null), 4000);
    } catch {
      setSavedNotice('Could not restore file—please check it is a valid Ironclad JSON backup.');
    }
    e.target.value = '';
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddCustomTask(newTaskText.trim());
    setNewTaskText('');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(FOUNDER_MANIFESTO.socialLaunchScript);
    setCopiedManifesto(true);
    setTimeout(() => setCopiedManifesto(false), 2500);
  };

  const renderBadgeIcon = (badge: IronMilestoneWithState) => {
    const cls =
      badge.status === 'earned'
        ? 'w-4 h-4 text-[#7A263A]'
        : badge.status === 'next'
        ? 'w-4 h-4 text-[#0284C7]'
        : 'w-4 h-4 text-[#475569]';
    switch (badge.iconName) {
      case 'Flame':
        return <Flame className={cls} />;
      case 'Shield':
        return <Shield className={cls} />;
      case 'Anchor':
        return <Anchor className={cls} />;
      case 'Compass':
        return <Compass className={cls} />;
      case 'Zap':
        return <Zap className={cls} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={cls} />;
      case 'Award':
        return <Award className={cls} />;
      case 'Hammer':
        return <Hammer className={cls} />;
      case 'Star':
        return <Star className={cls} />;
      case 'Crown':
        return <Crown className={cls} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. TOP DASHBOARD SUMMARY: CURRENT STREAK, LOG TODAY & NEXT BADGE  */}
      {/* ================================================================= */}
      <section
        aria-label="Daily sobriety summary"
        className="iron-card p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <span className="text-xs font-semibold text-[#7A263A]">
              Daily dashboard
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#121518] mt-0.5">
              The Forge
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              One day, one shift, and one meal at a time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="forge-plus-one-day-btn"
              type="button"
              onClick={() => {
                onIncrementStreak();
                setSavedNotice('Added +1 alcohol-free day to your streak.');
                setTimeout(() => setSavedNotice(null), 3000);
              }}
              className="iron-btn-primary py-2.5 px-4 text-sm flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Log +1 alcohol-free day
            </button>

            <button
              id="reset-streak-keep-badges-btn"
              type="button"
              onClick={() => {
                onResetStreakKeepBadges();
                setSavedNotice(
                  `Active streak reset to Day 0. Your ${milestoneSummary.unlockedCount} earned Iron Milestones are preserved.`
                );
                setTimeout(() => setSavedNotice(null), 4000);
              }}
              className="iron-btn-secondary py-2.5 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
              title="Resets active streak to 0 while keeping all earned milestone badges"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#7A263A]" />
              Reset active streak
            </button>
          </div>
        </div>

        {/* 3 Core Metrics: Current Streak, Next Milestone, Money Saved */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="iron-surface p-4">
            <div className="text-xs font-medium text-[#475569]">
              Current alcohol-free streak
            </div>
            <div
              id="current-streak-value"
              className="font-mono-metric text-3xl sm:text-4xl font-bold text-[#121518] mt-1"
            >
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </div>
            <div className="text-xs text-[#334155] mt-1">
              {milestoneSummary.unlockedCount} of {milestoneSummary.totalCount} Iron Milestones earned
            </div>
          </div>

          <div className="iron-surface-selected p-4">
            <div className="text-xs font-semibold text-[#0284C7]">
              Next milestone
            </div>
            {milestoneSummary.allUnlocked ? (
              <>
                <div
                  id="next-milestone-heading"
                  className="font-display text-xl font-bold text-[#121518] mt-1"
                >
                  All 12 of 12 Iron Milestones unlocked
                </div>
                <div className="text-xs text-[#334155] mt-1">
                  365 Unbreakable achieved—keep stacking one day at a time.
                </div>
              </>
            ) : milestoneSummary.nextMilestone ? (
              <>
                <div
                  id="next-milestone-heading"
                  className="font-display text-xl font-bold text-[#121518] mt-1"
                >
                  {milestoneSummary.nextMilestone.title} (Day{' '}
                  {milestoneSummary.nextMilestone.daysRequired})
                </div>
                <div
                  id="next-milestone-countdown"
                  className="text-xs font-semibold text-[#0284C7] mt-1"
                >
                  {milestoneSummary.nextMilestone.daysRemaining}{' '}
                  {milestoneSummary.nextMilestone.daysRemaining === 1
                    ? 'day'
                    : 'days'}{' '}
                  remaining
                </div>
              </>
            ) : null}
          </div>

          <div className="iron-surface p-4">
            <div className="flex items-center justify-between text-xs font-medium text-[#475569]">
              <span>Estimated money saved</span>
              <span>£{weeklySpendGBP}/wk baseline</span>
            </div>
            <div className="font-mono-metric text-3xl sm:text-4xl font-bold text-[#7A263A] mt-1">
              £{moneySavedGBP}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label
                htmlFor="weekly-spend-slider"
                className="text-[11px] text-[#475569] whitespace-nowrap"
              >
                Weekly spend:
              </label>
              <input
                id="weekly-spend-slider"
                type="range"
                min={15}
                max={250}
                step={5}
                value={weeklySpendGBP}
                onChange={(e) => onChangeWeeklySpend(Number(e.target.value))}
                className="iron-slider w-full"
              />
            </div>
          </div>
        </div>

        {/* Daily Dashboard Milestones Strip (1–7, 14, 30, 90, 180, 365 days) */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#121518]">
              Milestones ({milestoneSummary.unlockedCount} of {milestoneSummary.totalCount} unlocked)
            </span>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('iron-milestones-section')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-xs font-medium text-[#0284C7] hover:underline cursor-pointer"
            >
              View full badge details
            </button>
          </div>

          <div
            id="daily-dashboard-milestones"
            className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2"
          >
            {milestoneSummary.milestones.map((badge) => {
              const isEarned = badge.status === 'earned';
              const isNext = badge.status === 'next';
              const dayLabel = `${badge.daysRequired} ${
                badge.daysRequired === 1 ? 'day' : 'days'
              }`;

              let pillClasses =
                'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1]';
              if (isEarned) {
                pillClasses =
                  'bg-[#FDF2F4] border-[#7A263A]/40 text-[#7A263A] font-semibold';
              } else if (isNext) {
                pillClasses =
                  'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-semibold ring-1 ring-[#0284C7]/40';
              }

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() =>
                    document
                      .getElementById('iron-milestones-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  title={`${badge.title} (${dayLabel}) — ${
                    isEarned
                      ? 'Earned'
                      : isNext
                      ? `Next (${badge.daysRemaining}d left)`
                      : `Locked (${badge.daysRemaining}d left)`
                  }`}
                  className={`rounded-lg border px-2 py-2 text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${pillClasses}`}
                >
                  <span className="font-mono-metric text-xs leading-tight">
                    {dayLabel}
                  </span>
                  <span className="text-[10px] leading-none opacity-90">
                    {isEarned ? 'Earned' : isNext ? 'Next' : 'Locked'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. LOG TODAY (QUICK ON-DEVICE DEXIE CHECK-IN & NON-NEGOTIABLES)   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section
          aria-label="Log today check-in"
          className="lg:col-span-6 iron-card p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="font-display text-xl font-bold text-[#121518]">
                Log today
              </h2>
              <p className="text-xs text-[#475569]">
                Saved privately on this device. Editing a date updates it in place.
              </p>
            </div>
            <span className="font-mono-metric text-xs font-semibold text-[#7A263A] bg-[#FDF2F4] px-2.5 py-1 rounded-md border border-[#7A263A]/20">
              {selectedDate}
            </span>
          </div>

          <form
            ref={checkInFormRef}
            onSubmit={handleCheckInSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="checkin-date-input"
                  className="block text-xs font-medium text-[#334155] mb-1"
                >
                  Check-in date
                </label>
                <input
                  id="checkin-date-input"
                  type="date"
                  value={selectedDate}
                  max={todayISO}
                  onChange={(e) => loadDateIntoForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#334155] mb-1">
                  Status for this date
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlcoholFree(true)}
                    aria-pressed={alcoholFree}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      alcoholFree
                        ? 'bg-[#7A263A] text-white border-[#7A263A]'
                        : 'bg-white text-[#334155] border-[#CBD5E1]'
                    }`}
                  >
                    Alcohol-free
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlcoholFree(false)}
                    aria-pressed={!alcoholFree}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      !alcoholFree
                        ? 'bg-[#DC2626] text-white border-[#DC2626]'
                        : 'bg-white text-[#334155] border-[#CBD5E1]'
                    }`}
                  >
                    Setback
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label
                    htmlFor="checkin-craving-slider"
                    className="font-medium text-[#334155]"
                  >
                    Craving intensity (optional)
                  </label>
                  <span className="font-mono-metric font-semibold text-[#7A263A]">
                    {cravingIntensity}/10
                  </span>
                </div>
                <input
                  id="checkin-craving-slider"
                  type="range"
                  min={0}
                  max={10}
                  value={cravingIntensity}
                  onChange={(e) => setCravingIntensity(Number(e.target.value))}
                  className="iron-slider w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label
                    htmlFor="checkin-mood-slider"
                    className="font-medium text-[#334155]"
                  >
                    Overall mood (optional)
                  </label>
                  <span className="font-mono-metric font-semibold text-[#0284C7]">
                    {mood}/10
                  </span>
                </div>
                <input
                  id="checkin-mood-slider"
                  type="range"
                  min={1}
                  max={10}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="iron-slider w-full"
                />
              </div>
            </div>

            {/* Optional Trigger & What Helped */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="checkin-trigger-input"
                  className="block text-xs font-medium text-[#334155] mb-1"
                >
                  Main trigger (optional)
                </label>
                <input
                  id="checkin-trigger-input"
                  type="text"
                  list="trigger-suggestions"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g., After-shift fatigue"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
                <datalist id="trigger-suggestions">
                  {TRIGGER_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="checkin-helped-input"
                  className="block text-xs font-medium text-[#334155] mb-1"
                >
                  What helped (optional)
                </label>
                <input
                  id="checkin-helped-input"
                  type="text"
                  list="helped-suggestions"
                  value={whatHelped}
                  onChange={(e) => setWhatHelped(e.target.value)}
                  placeholder="e.g., Cooked a proper meal"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
                <datalist id="helped-suggestions">
                  {HELPED_SUGGESTIONS.map((h) => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label
                htmlFor="checkin-private-note"
                className="block text-xs font-medium text-[#334155] mb-1"
              >
                Private note (kept on this device only — never sent to Cornerman or workplace tools)
              </label>
              <input
                id="checkin-private-note"
                type="text"
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                placeholder="Write a quick reflection for yourself..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
              />
            </div>

            <button
              id="log-daily-forge-btn"
              type="submit"
              className="iron-btn-primary w-full py-3 px-4 text-sm cursor-pointer"
            >
              Save check-in for {selectedDate}
            </button>

            {savedNotice && (
              <div
                role="status"
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{savedNotice}</span>
              </div>
            )}
          </form>

          {/* Daily Non-Negotiables */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
            <div className="text-xs font-semibold text-[#334155]">
              Daily habits ({tasks.filter((t) => t.completed).length} of {tasks.length} complete)
            </div>
            {tasks.map((task) => (
              <label
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition cursor-pointer select-none ${
                  task.completed
                    ? 'bg-[#FDF2F4] border-[#7A263A]/30 text-[#121518]'
                    : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    task.completed
                      ? 'bg-[#7A263A] border-[#7A263A] text-white'
                      : 'border-[#94A3B8] bg-white'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                </div>
                <span className={`flex-1 ${task.completed ? 'line-through text-[#475569]' : 'font-medium'}`}>
                  {task.label}
                </span>
              </label>
            ))}

            <form onSubmit={handleAddTaskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a personal daily habit..."
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
              />
              <button
                type="submit"
                className="iron-btn-secondary px-3 py-2 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. 28-DAY HEATMAP FROM DATED ENTRIES & RECHARTS TRENDS VIEW     */}
        {/* =============================================================== */}
        <section
          aria-label="Check-in history and trends"
          className="lg:col-span-6 iron-card p-5 sm:p-6 flex flex-col justify-between space-y-5"
        >
          {/* 28-Day Heatmap from actual dated entries */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-xl font-bold text-[#121518] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7A263A]" />
                Last 28 days (from dated check-ins)
              </h2>
              <span className="font-mono-metric text-xs font-semibold text-[#334155]">
                {heatmapCells.filter((c) => c.logged && c.alcoholFree).length} of 28 logged alcohol-free
              </span>
            </div>
            <p className="text-xs text-[#475569] mb-3">
              Select any date below to view or edit that day’s check-in.
            </p>

            <div className="grid grid-cols-7 gap-1.5">
              {heatmapCells.map((cell) => {
                const isSelected = cell.date === selectedDate;
                let cellStyle =
                  'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#94A3B8]';
                if (cell.logged && cell.alcoholFree) {
                  cellStyle = 'bg-[#7A263A] text-white border-[#7A263A]';
                } else if (cell.logged && !cell.alcoholFree) {
                  cellStyle = 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
                }

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => loadDateIntoForm(cell.date)}
                    aria-label={`Check-in date ${cell.date}: ${
                      cell.logged
                        ? cell.alcoholFree
                          ? 'Alcohol-free'
                          : 'Setback logged'
                        : 'Not logged'
                    }`}
                    className={`h-11 rounded-lg border text-xs transition flex flex-col items-center justify-center cursor-pointer ${cellStyle} ${
                      isSelected ? 'ring-2 ring-[#0284C7] ring-offset-1' : ''
                    }`}
                  >
                    <span className="text-[9px] opacity-80">{cell.weekdayShort}</span>
                    <span className="font-mono-metric font-semibold leading-none mt-0.5">
                      {cell.dayOfMonth}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Logged Craving & Mood Trend View */}
          <div className="pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-[#121518]">
                  Self-reported craving and mood trends
                </h3>
                <p className="text-xs text-[#475569]">
                  Plotted directly from your logged check-in dates
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[#0284C7] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] inline-block" /> Mood
                </span>
                <span className="flex items-center gap-1 text-[#7A263A] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A263A] inline-block" /> Craving
                </span>
              </div>
            </div>

            {trendData.length === 0 ? (
              <div className="iron-surface p-6 text-center text-xs text-[#475569]">
                No check-ins logged yet. Save your first check-in on the left to see your trend chart.
              </div>
            ) : (
              <div className="h-44 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      stroke="#CBD5E1"
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      stroke="#CBD5E1"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#121518',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      name="Mood (1-10)"
                      stroke="#0284C7"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0284C7' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="craving"
                      name="Craving (0-10)"
                      stroke="#7A263A"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#7A263A' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Dated Check-in History List + Export / Restore / Delete Controls */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#334155]">
                Recent dated check-ins ({checkIns.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="export-checkins-btn"
                  type="button"
                  onClick={handleExportClick}
                  className="iron-btn-secondary py-1.5 px-2.5 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-[#7A263A]" /> Export JSON
                </button>
                <button
                  id="restore-checkins-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="iron-btn-secondary py-1.5 px-2.5 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-[#0284C7]" /> Restore JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleRestoreFileChange}
                  className="hidden"
                />
                {checkIns.length > 0 && (
                  <button
                    id="clear-all-checkins-btn"
                    type="button"
                    onClick={() => onClearAllCheckIns()}
                    className="iron-btn-secondary py-1.5 px-2.5 text-[11px] text-[#DC2626] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {checkIns
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((entry) => (
                  <div
                    key={entry.date}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 flex items-start justify-between gap-2 text-xs"
                  >
                    <div
                      onClick={() => loadDateIntoForm(entry.date)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-metric font-semibold text-[#121518]">
                          {entry.date}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            entry.alcoholFree
                              ? 'bg-[#FDF2F4] text-[#7A263A]'
                              : 'bg-[#FEF2F2] text-[#B91C1C]'
                          }`}
                        >
                          {entry.alcoholFree ? 'Alcohol-free' : 'Setback'}
                        </span>
                        {typeof entry.cravingIntensity === 'number' && (
                          <span className="text-[11px] text-[#475569]">
                            Craving {entry.cravingIntensity}/10
                          </span>
                        )}
                      </div>
                      {(entry.trigger || entry.whatHelped || entry.privateNote) && (
                        <div className="text-[#334155] mt-1">
                          {entry.trigger && <span>Trigger: {entry.trigger}. </span>}
                          {entry.whatHelped && <span>Helped: {entry.whatHelped}. </span>}
                          {entry.privateNote && <span>Note: {entry.privateNote}</span>}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCheckIn(entry.date)}
                      className="p-1 text-[#475569] hover:text-[#DC2626] cursor-pointer"
                      aria-label={`Delete check-in for ${entry.date}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================= */}
      {/* 4. IRON MILESTONES (ALL 12 BADGES: 1,2,3,4,5,6,7,14,30,90,180,365)*/}
      {/* ================================================================= */}
      <section
        id="iron-milestones-section"
        aria-label="Iron Milestones"
        className="iron-card p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#121518]">
              Iron Milestones
            </h2>
            <p className="text-xs text-[#475569]">
              Earned badges are saved permanently—even if your active streak resets.
            </p>
          </div>
          <span
            id="iron-milestones-count"
            className="font-mono-metric text-xs font-bold px-3 py-1 rounded-full bg-[#FDF2F4] text-[#7A263A] border border-[#7A263A]/30"
          >
            {milestoneSummary.unlockedCount} of {milestoneSummary.totalCount} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {milestoneSummary.milestones.map((badge) => {
            const isEarned = badge.status === 'earned';
            const isNext = badge.status === 'next';

            let cardClasses =
              'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]';
            if (isEarned) {
              cardClasses =
                'bg-white border-[#7A263A] text-[#121518] shadow-2xs';
            } else if (isNext) {
              cardClasses =
                'bg-[#F0F9FF] border-[#0284C7] text-[#121518] ring-1 ring-[#0284C7]';
            }

            return (
              <div
                key={badge.id}
                data-milestone-days={badge.daysRequired}
                data-milestone-status={badge.status}
                className={`rounded-xl p-3.5 border flex flex-col justify-between transition ${cardClasses}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono-metric text-sm font-bold text-[#121518]">
                      Day {badge.daysRequired}
                    </span>
                    {isEarned ? (
                      renderBadgeIcon(badge)
                    ) : isNext ? (
                      renderBadgeIcon(badge)
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-xs text-[#121518]">
                      {badge.title}
                    </div>
                    <div className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                      {badge.subtitle}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                  {isEarned ? (
                    <span className="text-[11px] font-semibold text-[#7A263A] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Earned
                    </span>
                  ) : isNext ? (
                    <span className="text-[11px] font-semibold text-[#0284C7]">
                      Next • {badge.daysRemaining}d left
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#475569]">
                      Locked • {badge.daysRemaining}d left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. SECONDARY EXPANDABLE SECTION: FOUNDER STORY & MANIFESTO        */}
      {/* ================================================================= */}
      <section
        aria-label="Founder story"
        className="iron-surface p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[#7A263A]">
              Why we built Ironclad Mindset
            </span>
            <h2 className="font-display text-lg font-bold text-[#121518] mt-0.5">
              “{FOUNDER_MANIFESTO.headline}”
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              {FOUNDER_MANIFESTO.subheadline}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCopyScript}
              className="iron-btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#7A263A]" />
              {copiedManifesto ? 'Copied script' : 'Copy launch script'}
            </button>
            <button
              id="toggle-manifesto-btn"
              type="button"
              onClick={() => setManifestoExpanded((prev) => !prev)}
              aria-expanded={manifestoExpanded}
              className="iron-btn-secondary py-2 px-3 text-xs flex items-center gap-1 cursor-pointer"
            >
              {manifestoExpanded ? (
                <>
                  Hide story <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read founder story <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {manifestoExpanded && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-4">
            <blockquote className="bg-white border-l-4 border-[#7A263A] p-4 rounded-r-xl text-xs sm:text-sm text-[#121518] whitespace-pre-line leading-relaxed">
              {FOUNDER_MANIFESTO.socialLaunchScript}
            </blockquote>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FOUNDER_MANIFESTO.missionPillars.map((pillar, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-3.5"
                >
                  <div className="text-xs font-semibold text-[#7A263A]">
                    {pillar.title}
                  </div>
                  <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
