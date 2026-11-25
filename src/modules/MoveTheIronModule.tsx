import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Footprints,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  StretchHorizontal,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MoveTheIronModuleProps {
  onCompleteSession: (sessionLabel: string) => void;
}

type MoveTab = 'bodyweight' | 'walk' | 'mobility';

const BODYWEIGHT_EXERCISES = [
  {
    name: 'Press-Ups (or Incline Kitchen Counter Press-Ups)',
    cue: 'Brace your core, lower chest smoothly, drive away cleanly.',
  },
  {
    name: 'Bodyweight Squats',
    cue: 'Feet shoulder-width, sit back through heels, tall chest.',
  },
  {
    name: 'Forearm Plank Hold',
    cue: 'Squeeze glutes, breathe steadily through the nose.',
  },
  {
    name: 'Alternating Reverse Lunges',
    cue: 'Controlled step back, keep front knee stacked over ankle.',
  },
  {
    name: 'Shadow Boxing / Mountain Climbers',
    cue: 'Fast crisp hands or steady knees to burn off post-shift adrenaline.',
  },
];

const WALK_PROMPTS = [
  'Name 3 things you controlled on shift today—leave the rest behind.',
  'Notice 4 things you can see and 3 sounds around you to drop out of autopilot.',
  'Picture waking up at 7:00am tomorrow clear-headed and steady.',
];

const MOBILITY_STEPS = [
  {
    id: 'mob-1',
    area: 'Lower Back & Hips (2 mins)',
    move: 'Standing hip hinges + gentle knee-to-chest pulls after long hours standing.',
  },
  {
    id: 'mob-2',
    area: 'Tight Calves & Ankles (2 mins)',
    move: 'Wall calf stretch — 45 seconds each side to release kitchen/site leg ache.',
  },
  {
    id: 'mob-3',
    area: 'Neck & Upper Traps (2 mins)',
    move: 'Slow ear-to-shoulder tilts + 10 big backward shoulder rolls.',
  },
  {
    id: 'mob-4',
    area: 'Chest & Thoracic Opener (2 mins)',
    move: 'Doorframe chest stretch + 5 slow diaphragmatic breaths.',
  },
];

export const MoveTheIronModule: React.FC<MoveTheIronModuleProps> = ({
  onCompleteSession,
}) => {
  const [activeTab, setActiveTab] = useState<MoveTab>('bodyweight');

  // Tab 1: 20-Min Bodyweight Forge (4 rounds x 5 exercises x 60s = 20 mins)
  const [round, setRound] = useState<number>(1);
  const [exerciseIdx, setExerciseIdx] = useState<number>(0);
  const [intervalSec, setIntervalSec] = useState<number>(40);
  const [isWorkPhase, setIsWorkPhase] = useState<boolean>(true);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Tab 2: 15-Min Walk Timer
  const [walkSecondsLeft, setWalkSecondsLeft] = useState<number>(15 * 60);
  const [walkRunning, setWalkRunning] = useState<boolean>(false);

  // Tab 3: Mobility Checklist
  const [mobilityDone, setMobilityDone] = useState<Record<string, boolean>>({});
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!timerRunning || activeTab !== 'bodyweight') return;
    const id = window.setInterval(() => {
      setIntervalSec((prev) => {
        if (prev > 1) return prev - 1;
        // Switch phase
        if (isWorkPhase) {
          setIsWorkPhase(false);
          return 20;
        }
        setIsWorkPhase(true);
        setExerciseIdx((ex) => {
          if (ex + 1 < BODYWEIGHT_EXERCISES.length) return ex + 1;
          setRound((r) => (r < 4 ? r + 1 : 1));
          return 0;
        });
        return 40;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, activeTab, isWorkPhase]);

  useEffect(() => {
    if (!walkRunning || activeTab !== 'walk' || walkSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setWalkSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [walkRunning, activeTab, walkSecondsLeft]);

  const handleFinishSession = (label: string) => {
    setTimerRunning(false);
    setWalkRunning(false);
    onCompleteSession(label);
    setCompletionBanner(
      `${label} logged! Your daily movement non-negotiable in The Forge is marked complete.`
    );
    window.setTimeout(() => setCompletionBanner(null), 5000);
  };

  const currentExercise = BODYWEIGHT_EXERCISES[exerciseIdx];
  const walkMins = Math.floor(walkSecondsLeft / 60);
  const walkSecs = String(walkSecondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" /> Shift-end cortisol &amp; craving reset
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            Move the Iron
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Built for people coming off 10-hour shifts in kitchens, trades, or offices. Burn off stress in 8–20 minutes—no gym required.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bodyweight')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'bodyweight'
                ? 'bg-[#7A263A] text-white border-[#7A263A]'
                : 'bg-white text-[#334155] border-[#CBD5E1]'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> 20-Min Bodyweight
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('walk')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'walk'
                ? 'bg-[#7A263A] text-white border-[#7A263A]'
                : 'bg-white text-[#334155] border-[#CBD5E1]'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> 15-Min Walk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobility')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'mobility'
                ? 'bg-[#7A263A] text-white border-[#7A263A]'
                : 'bg-white text-[#334155] border-[#CBD5E1]'
            }`}
          >
            <StretchHorizontal className="w-3.5 h-3.5" /> 8-Min Mobility
          </button>
        </div>
      </section>

      {completionBanner && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{completionBanner}</span>
        </div>
      )}

      {activeTab === 'bodyweight' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 iron-card p-6 flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A263A]">
                Round {round} of 4 · Exercise {exerciseIdx + 1}/5
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  isWorkPhase
                    ? 'bg-[#FDF2F4] text-[#7A263A] border border-[#7A263A]/30'
                    : 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]'
                }`}
              >
                {isWorkPhase ? '40s WORK' : '20s REST'}
              </span>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="font-mono-metric text-6xl font-bold text-[#121518]">
                {intervalSec}s
              </div>
              <h2 className="font-display text-xl font-bold text-[#121518]">
                {currentExercise.name}
              </h2>
              <p className="text-xs text-[#475569]">{currentExercise.cue}</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning((p) => !p)}
                  className="iron-btn-primary flex-1 py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {timerRunning ? 'Pause circuit' : 'Start 40/20 timer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setRound(1);
                    setExerciseIdx(0);
                    setIsWorkPhase(true);
                    setIntervalSec(40);
                  }}
                  className="iron-btn-ghost py-2.5 px-3 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <button
                id="complete-move-session-btn"
                type="button"
                onClick={() => handleFinishSession('20-Min Bodyweight Forge')}
                className="iron-btn-secondary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                Complete Session (tick daily habit in The Forge)
              </button>
            </div>
          </section>

          <section className="lg:col-span-7 iron-surface p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-lg font-bold text-[#121518]">
              5-Move Circuit Order (Repeat 4 Rounds · 40s On / 20s Off)
            </h3>
            <div className="space-y-2.5">
              {BODYWEIGHT_EXERCISES.map((ex, idx) => {
                const isCurrent = idx === exerciseIdx;
                return (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => {
                      setExerciseIdx(idx);
                      setIsWorkPhase(true);
                      setIntervalSec(40);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      isCurrent ? 'iron-surface-selected' : 'bg-white border-[#E2E8F0]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#121518]">
                      {idx + 1}. {ex.name}
                    </div>
                    <div className="text-xs text-[#475569] mt-0.5">{ex.cue}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'walk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 iron-card p-6 text-center space-y-4">
            <div className="text-xs font-semibold text-[#0284C7] flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" /> 15-Minute Brisk Walk Head-Clearer
            </div>
            <div className="font-mono-metric text-5xl font-bold text-[#121518]">
              {walkMins}:{walkSecs}
            </div>
            <p className="text-xs text-[#475569]">
              Leave your boots, apron, or work stress at the door—walk briskly for 15 minutes before making any evening decision.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWalkRunning((p) => !p)}
                className="iron-btn-primary flex-1 py-2.5 px-4 text-xs cursor-pointer"
              >
                {walkRunning ? 'Pause walk' : 'Start 15-min walk'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalkRunning(false);
                  setWalkSecondsLeft(15 * 60);
                }}
                className="iron-btn-ghost py-2.5 px-3 text-xs cursor-pointer"
              >
                Reset
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleFinishSession('15-Min Brisk Walk Head-Clearer')}
              className="iron-btn-secondary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
              Complete Walk Session
            </button>
          </section>

          <section className="lg:col-span-7 iron-surface p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-lg font-bold text-[#121518] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7A263A]" /> Walk Mindset Reflection Prompts
            </h3>
            <div className="space-y-3">
              {WALK_PROMPTS.map((prompt, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs text-[#121518] leading-relaxed"
                >
                  <strong className="text-[#7A263A]">Prompt {idx + 1}: </strong>
                  {prompt}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'mobility' && (
        <section className="iron-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-[#121518]">
                8-Minute Post-Shift Kitchen &amp; Trade Mobility
              </h2>
              <p className="text-xs text-[#475569]">
                Tick off each 2-minute decompression stretch for lower back, tight calves, neck, and shoulders.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleFinishSession('8-Min Post-Shift Mobility')}
              className="iron-btn-primary py-2.5 px-4 text-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Complete Mobility Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOBILITY_STEPS.map((step) => {
              const checked = Boolean(mobilityDone[step.id]);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    setMobilityDone((prev) => ({ ...prev, [step.id]: !checked }))
                  }
                  className={`text-left p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    checked ? 'iron-surface-selected' : 'iron-surface'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      checked ? 'text-[#0284C7]' : 'text-[#94A3B8]'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#7A263A]">
                      {step.area}
                    </div>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {step.move}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
