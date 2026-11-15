import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Copy,
  Crown,
  Flame,
  Hammer,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { FOUNDER_MANIFESTO, MILESTONE_BADGES } from '../data/ironcladData';
import { DailyForgeLog, NonNegotiableTask } from '../types/ironclad';

interface TheForgeModuleProps {
  streakDays: number;
  onIncrementStreak: () => void;
  onSetStreakDays: (days: number) => void;
  weeklySpendGBP: number;
  onChangeWeeklySpend: (spend: number) => void;
  tasks: NonNegotiableTask[];
  onToggleTask: (id: string) => void;
  onAddCustomTask: (label: string) => void;
  forgeLogs: DailyForgeLog[];
  onLogDailyForge: (mood: number, sleep: number, craving: number, notes: string) => void;
  heatmapDays: boolean[];
  onToggleHeatmapDay: (index: number) => void;
}

export const TheForgeModule: React.FC<TheForgeModuleProps> = ({
  streakDays,
  onIncrementStreak,
  weeklySpendGBP,
  onChangeWeeklySpend,
  tasks,
  onToggleTask,
  onAddCustomTask,
  forgeLogs,
  onLogDailyForge,
  heatmapDays,
  onToggleHeatmapDay,
}) => {
  const [manifestoExpanded, setManifestoExpanded] = useState<boolean>(true);
  const [copiedManifesto, setCopiedManifesto] = useState<boolean>(false);

  // Daily Check-in Sliders
  const [mood, setMood] = useState<number>(8);
  const [sleep, setSleep] = useState<number>(8);
  const [craving, setCraving] = useState<number>(2);
  const [shiftNote, setShiftNote] = useState<string>('');
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  const moneySavedGBP = ((streakDays / 7) * weeklySpendGBP).toFixed(2);
  const unitsAvoided = Math.round(streakDays * 4.2);
  const emptyCaloriesAvoided = (streakDays * 820).toLocaleString();

  const handleForgePlusOne = () => {
    onIncrementStreak();
    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#7A263A', '#1BB1E7', '#F8F9FA'],
      });
    } catch {
      // Fallback if canvas-confetti is blocked in headless env
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(FOUNDER_MANIFESTO.socialLaunchScript);
    setCopiedManifesto(true);
    setTimeout(() => setCopiedManifesto(false), 2500);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddCustomTask(newTaskText.trim());
    setNewTaskText('');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogDailyForge(mood, sleep, craving, shiftNote);
    setShiftNote('');
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = `w-5 h-5 ${unlocked ? 'text-[#1BB1E7]' : 'text-[#94A3B8]/50'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={cls} />;
      case 'Shield':
        return <Shield className={cls} />;
      case 'Hammer':
        return <Hammer className={cls} />;
      case 'Award':
        return <Award className={cls} />;
      case 'Crown':
        return <Crown className={cls} />;
      default:
        return <Flame className={cls} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE & MANIFESTO STORY BANNER */}
      <div className="forge-card-claret rounded-2xl p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono-metric uppercase tracking-wider text-[#1BB1E7]">
              <Hammer className="w-3.5 h-3.5" /> THE IRONCLAD MANIFESTO • FOUNDER’S LAUNCH SCRIPT
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#F8F9FA] tracking-wide">
              “{FOUNDER_MANIFESTO.headline}”
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              {FOUNDER_MANIFESTO.subheadline}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCopyScript}
              className="py-2 px-3 rounded-lg bg-[#121518]/80 hover:bg-[#121518] border border-[#2E353D] text-xs font-semibold text-[#1BB1E7] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedManifesto ? 'Copied Script!' : 'Copy Launch Script'}
            </button>
            <button
              id="toggle-manifesto-btn"
              onClick={() => setManifestoExpanded((prev) => !prev)}
              className="py-2 px-3 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center gap-1 transition cursor-pointer"
            >
              {manifestoExpanded ? (
                <>
                  Hide Story <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read Full Story <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {manifestoExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-[#7A263A]/40 space-y-4"
          >
            <blockquote className="bg-[#121518]/85 border-l-4 border-[#1BB1E7] p-4 rounded-r-xl text-xs sm:text-sm text-[#F8F9FA]/95 whitespace-pre-line leading-relaxed italic">
              {FOUNDER_MANIFESTO.socialLaunchScript}
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FOUNDER_MANIFESTO.missionPillars.map((pillar, i) => (
                <div
                  key={i}
                  className="bg-[#121518]/70 border border-[#2E353D] rounded-xl p-3.5"
                >
                  <div className="text-xs font-display uppercase tracking-wider text-[#1BB1E7] font-bold">
                    {pillar.title}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. INTERACTIVE SOBRIETY & RESILIENCE COUNTER + MILESTONE BADGES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Counter & +1 Day Forged Card */}
        <div className="lg:col-span-7 forge-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] tracking-wider block">
                LIVE SOBRIETY & RESILIENCE TELEMETRY
              </span>
              <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
                YOUR IRONCLAD STREAK COUNTER
              </h2>
            </div>

            <motion.button
              id="forge-plus-one-day-btn"
              whileTap={{ scale: 0.95 }}
              onClick={handleForgePlusOne}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-[#7A263A] to-[#9E334D] hover:from-[#8F2D45] hover:to-[#B03956] text-white font-display text-base tracking-wider uppercase shadow-lg border border-[#1BB1E7]/50 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#1BB1E7]" />
              +1 DAY FORGED
            </motion.button>
          </div>

          {/* 3 Primary Telemetry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#121518] border border-[#7A263A]/70 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>DAYS ALCOHOL-FREE</span>
                <Flame className="w-4 h-4 text-[#1BB1E7]" />
              </div>
              <div className="font-mono-metric text-3xl sm:text-4xl font-bold text-[#F8F9FA] mt-1">
                {streakDays}
              </div>
              <div className="text-[11px] text-[#1BB1E7] mt-1 font-medium">
                {streakDays >= 30
                  ? 'Dopamine Baseline Restored'
                  : `${30 - streakDays} days to 30-Day Hammer`}
              </div>
            </div>

            <div className="bg-[#121518] border border-[#1BB1E7]/40 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>MONEY SAVED (£)</span>
                <Coins className="w-4 h-4 text-[#1BB1E7]" />
              </div>
              <div className="font-mono-metric text-3xl sm:text-4xl font-bold text-emerald-400 mt-1">
                £{moneySavedGBP}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1">
                Based on £{weeklySpendGBP}/wk former spend
              </div>
            </div>

            <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>EMPTY CALORIES / UNITS</span>
                <Zap className="w-4 h-4 text-[#1BB1E7]" />
              </div>
              <div className="font-mono-metric text-2xl sm:text-3xl font-bold text-[#F8F9FA] mt-1">
                {emptyCaloriesAvoided} <span className="text-xs font-normal text-[#94A3B8]">kcal</span>
              </div>
              <div className="text-[11px] text-[#1BB1E7] mt-1">
                {unitsAvoided} UK alcohol units dodged
              </div>
            </div>
          </div>

          {/* Former Weekly Spend Slider */}
          <div className="bg-[#121518]/80 border border-[#2E353D] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-semibold text-[#F8F9FA]">
                Former Weekly Pub / Booze Spend:{' '}
              </span>
              <span className="font-mono-metric font-bold text-[#1BB1E7]">
                £{weeklySpendGBP} / week
              </span>
              <span className="text-[#94A3B8] block text-[11px]">
                 equals £{(weeklySpendGBP * 52).toLocaleString()} tax-free cash saved per year
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={250}
              step={5}
              value={weeklySpendGBP}
              onChange={(e) => onChangeWeeklySpend(Number(e.target.value))}
              className="iron-slider w-full sm:w-48"
              aria-label="Former Weekly Spend GBP"
            />
          </div>

          {/* Unlockable Iron Milestone Badges */}
          <div>
            <div className="text-xs font-mono-metric uppercase text-[#94A3B8] mb-2.5">
              UNLOCKABLE IRON MILESTONE BADGES ({MILESTONE_BADGES.filter((b) => streakDays >= b.daysRequired).length}/{MILESTONE_BADGES.length} UNLOCKED)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {MILESTONE_BADGES.map((badge) => {
                const unlocked = streakDays >= badge.daysRequired;
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-3 border transition flex flex-col justify-between ${
                      unlocked
                        ? 'bg-gradient-to-b from-[#7A263A]/45 to-[#121518] border-[#1BB1E7]/60 shadow-md'
                        : 'bg-[#121518]/50 border-[#2E353D] opacity-60'
                    }`}
                    title={badge.description}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      {renderBadgeIcon(badge.iconName, unlocked)}
                      <span
                        className={`text-[10px] font-mono-metric px-1.5 py-0.5 rounded ${
                          unlocked
                            ? 'bg-[#1BB1E7]/20 text-[#1BB1E7] font-bold'
                            : 'bg-[#1E2328] text-[#94A3B8]'
                        }`}
                      >
                        {unlocked ? 'FORGED' : `DAY ${badge.daysRequired}`}
                      </span>
                    </div>
                    <div>
                      <div className="font-display text-xs font-bold uppercase text-[#F8F9FA]">
                        {badge.title}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                        {badge.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 28-DAY CONSISTENCY HEATMAP GRID */}
        <div className="lg:col-span-5 forge-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 28-DAY CONSISTENCY HEATMAP
              </span>
              <span className="text-xs font-mono-metric text-[#94A3B8]">
                {heatmapDays.filter(Boolean).length}/28 Days Forged
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
              LOOP-STYLE STREAK GRID
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Tap any day cell to toggle completion. Never break the chain two days in a row.
            </p>

            <div className="grid grid-cols-7 gap-2 mt-4">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                <div
                  key={idx}
                  className="text-center text-[10px] font-mono-metric text-[#94A3B8]"
                >
                  {d}
                </div>
              ))}
              {heatmapDays.map((completed, idx) => {
                const isToday = idx === 27;
                return (
                  <button
                    key={idx}
                    onClick={() => onToggleHeatmapDay(idx)}
                    className={`h-10 rounded-lg font-mono-metric text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
                      completed
                        ? isToday
                          ? 'bg-[#1BB1E7] text-[#121518] border-white shadow-[0_0_12px_rgba(27,177,231,0.5)]'
                          : 'bg-[#7A263A] text-[#F8F9FA] border-[#1BB1E7]/50 hover:bg-[#9E334D]'
                        : 'bg-[#121518] text-[#94A3B8] border-[#2E353D] hover:border-[#94A3B8]'
                    }`}
                    title={`Day ${idx + 1} (${completed ? 'Forged' : 'Missed'})`}
                  >
                    <span>D{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[#F8F9FA]">
                <span className="w-3 h-3 rounded-sm bg-[#7A263A] border border-[#1BB1E7]/60 inline-block" />
                Forged Day
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#F8F9FA]">
                <span className="w-3 h-3 rounded-sm bg-[#1BB1E7] inline-block" />
                Today Active
              </span>
            </div>
            <span className="font-mono-metric text-emerald-400 font-bold">
              {Math.round((heatmapDays.filter(Boolean).length / 28) * 100)}% Consistency
            </span>
          </div>
        </div>
      </div>

      {/* 3. 60-SECOND DAILY CHECK-IN, VIKUNJA NON-NEGOTIABLES & 7-DAY TREND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Check-In + Non-Negotiables */}
        <div className="lg:col-span-6 forge-card rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <span className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
              60-SECOND SHIFT DEBRIEF & VIKUNJA NON-NEGOTIABLES
            </span>
            <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
              DAILY FORGE CHECK-IN
            </h2>
          </div>

          {/* 3 Daily Non-Negotiables + Custom Task */}
          <div className="space-y-2">
            <div className="text-xs font-mono-metric uppercase text-[#94A3B8]">
              TODAY’S IRONCLAD NON-NEGOTIABLES ({tasks.filter((t) => t.completed).length}/{tasks.length})
            </div>
            {tasks.map((task) => (
              <label
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                  task.completed
                    ? 'bg-[#7A263A]/25 border-[#1BB1E7]/50 text-[#F8F9FA]'
                    : 'bg-[#121518] border-[#2E353D] text-[#94A3B8] hover:text-[#F8F9FA]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    task.completed
                      ? 'bg-[#1BB1E7] border-[#1BB1E7] text-[#121518]'
                      : 'border-[#94A3B8]'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium flex-1 ${
                    task.completed ? 'line-through opacity-90' : ''
                  }`}
                >
                  {task.label}
                </span>
              </label>
            ))}

            {/* Custom Non-Negotiable Form */}
            <form onSubmit={handleAddTaskSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add custom non-negotiable (e.g., 2L water on pass, call Mum)..."
                className="flex-1 px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#1BB1E7] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>

          {/* 3 Interactive Sliders */}
          <form onSubmit={handleLogSubmit} className="space-y-4 pt-2 border-t border-[#2E353D]">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#F8F9FA]">Mood & Mental Clarity</span>
                  <span className="font-mono-metric font-bold text-[#1BB1E7]">{mood} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="iron-slider w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#F8F9FA]">Sleep Quality (Deep REM)</span>
                  <span className="font-mono-metric font-bold text-[#1BB1E7]">{sleep} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="iron-slider w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#F8F9FA]">Craving Intensity (5 PM Spike)</span>
                  <span
                    className={`font-mono-metric font-bold ${
                      craving >= 7 ? 'text-[#E63946]' : 'text-emerald-400'
                    }`}
                  >
                    {craving} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={craving}
                  onChange={(e) => setCraving(Number(e.target.value))}
                  className="iron-slider w-full"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="Optional 1-line shift note (e.g., Smashed mackerel bowl after late close)..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                />
              </div>
            </div>

            <button
              id="log-daily-forge-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-sm tracking-wider uppercase shadow-md transition cursor-pointer"
            >
              LOG DAILY FORGE TELEMETRY
            </button>

            {loggedSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Today’s Forge check-in saved & plotted to your 7-Day Trend Chart.
              </div>
            )}
          </form>
        </div>

        {/* 7-DAY TREND CHART & RECENT LOGS */}
        <div className="lg:col-span-6 forge-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> 7-DAY NEUROCHEMICAL RECOVERY CHART
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#1BB1E7]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1BB1E7] inline-block" /> Mood
                </span>
                <span className="flex items-center gap-1 text-[#7A263A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9E334D] inline-block" /> Sleep
                </span>
                <span className="flex items-center gap-1 text-[#E63946]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] inline-block" /> Craving
                </span>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
              MOOD & SLEEP VS. CRAVING INTENSITY
            </h3>
          </div>

          {/* Interactive Bar/Column Comparison Chart */}
          <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4">
            <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4">
              {forgeLogs.slice(-7).map((entry, idx) => (
                <div
                  key={`${entry.date}-${idx}`}
                  className="flex flex-col items-center h-full justify-end group"
                >
                  <div className="flex items-end gap-1 w-full justify-center h-32">
                    {/* Mood Bar */}
                    <div
                      style={{ height: `${entry.mood * 10}%` }}
                      className="w-2.5 sm:w-3 rounded-t bg-[#1BB1E7] transition-all"
                      title={`Mood: ${entry.mood}/10`}
                    />
                    {/* Sleep Bar */}
                    <div
                      style={{ height: `${entry.sleep * 10}%` }}
                      className="w-2.5 sm:w-3 rounded-t bg-[#9E334D] transition-all"
                      title={`Sleep: ${entry.sleep}/10`}
                    />
                    {/* Craving Bar */}
                    <div
                      style={{ height: `${entry.craving * 10}%` }}
                      className="w-2.5 sm:w-3 rounded-t bg-[#E63946]/85 transition-all"
                      title={`Craving: ${entry.craving}/10`}
                    />
                  </div>
                  <div className="text-[11px] font-mono-metric text-[#F8F9FA] mt-2">
                    {entry.dayLabel}
                  </div>
                  <div className="text-[9px] font-mono-metric text-[#94A3B8]">
                    M{entry.mood}•C{entry.craving}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Shift Debrief Notes */}
          <div className="space-y-2">
            <div className="text-xs font-mono-metric uppercase text-[#94A3B8]">
              RECENT SHIFT & RECOVERY DEBRIEFS
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {forgeLogs
                .slice()
                .reverse()
                .slice(0, 4)
                .map((log, i) => (
                  <div
                    key={`${log.date}-${i}`}
                    className="bg-[#121518] border border-[#2E353D] rounded-lg p-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono-metric font-bold text-[#1BB1E7]">
                        {log.dayLabel} ({log.date}):{' '}
                      </span>
                      <span className="text-[#F8F9FA]">
                        {log.notes || 'Held the line. Non-negotiables completed.'}
                      </span>
                    </div>
                    <span className="font-mono-metric text-[11px] whitespace-nowrap px-2 py-0.5 rounded bg-[#1E2328] text-[#94A3B8]">
                      Mood {log.mood}/10 • Craving {log.craving}/10
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
