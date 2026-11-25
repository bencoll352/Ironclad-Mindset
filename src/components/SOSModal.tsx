import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  CigaretteOff,
  Clock,
  FastForward,
  Lock,
  PhoneCall,
  Play,
  RotateCcw,
  ShieldAlert,
  Utensils,
  Wind,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PippaIcon } from './PippaIcon';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  weeklySpendGBP: number;
  onEscalateToCornerman: (prompt: string) => void;
  onJumpToFuel: () => void;
  onTriggerWitchingHourWebhook: (haltState: string) => void;
  onCompleteReset?: (haltState: string) => void;
}

type SOSTab = 'breathing' | 'nicotine' | 'gambling';
type HALTKey = 'Hungry' | 'Angry' | 'Lonely' | 'Tired';

const HALT_PROTOCOLS: Record<
  HALTKey,
  {
    headline: string;
    science: string;
    immediateAction: string;
    buttonLabel: string;
  }
> = {
  Hungry: {
    headline: 'Low blood sugar often feels like a craving',
    science:
      'When your blood glucose drops after a long shift, your brain looks for fast energy. Eating a proper meal with protein and complex carbs takes the edge off within 15 minutes.',
    immediateAction:
      'Head to the kitchen: make the 10-minute Smashed Mackerel & Chickpea Bowl or sear a 12-minute Steak Skillet. Pour a cold ginger and lime spritz first.',
    buttonLabel: 'Open 15-minute shift meals',
  },
  Angry: {
    headline: 'High stress and tension after work',
    science:
      'Workplace frustration keeps your body in fight-or-flight mode. Drinking or using on frustration only disrupts your sleep and leaves the problem waiting tomorrow.',
    immediateAction:
      'Drop your shoulders. Complete 60 seconds of Box Breathing, splash cold water on your wrists, and step outside for 10 minutes without your phone.',
    buttonLabel: 'Talk it through with Pippa',
  },
  Lonely: {
    headline: 'Quiet hours after a busy shift',
    science:
      'Walking into a quiet flat after a noisy shift or site is a common trigger. Reaching out to someone breaks the isolation immediately.',
    immediateAction:
      'Check in with peers in The Locker Room or talk with Pippa right now.',
    buttonLabel: 'Open Pippa voice coach',
  },
  Tired: {
    headline: 'Decision fatigue and exhaustion',
    science:
      'Alcohol sedates you briefly but fragments deep sleep and wakes you early. Your body simply needs food, hydration, and proper rest.',
    immediateAction:
      'Change out of work clothes straight away, eat a simple meal, take a warm shower, and get an early night.',
    buttonLabel: 'Ask Pippa for a wind-down plan',
  },
};

const BREATH_PHASES = [
  { name: 'Inhale slowly (4s)', sub: 'Breathe in gently through your nose', scale: 1.18, borderColor: '#0284C7' },
  { name: 'Hold full (4s)', sub: 'Drop your shoulders and unclench your jaw', scale: 1.18, borderColor: '#7A263A' },
  { name: 'Exhale cleanly (4s)', sub: 'Release slowly out through your mouth', scale: 0.92, borderColor: '#0284C7' },
  { name: 'Hold steady (4s)', sub: 'Rest calmly before the next breath', scale: 0.92, borderColor: '#7A263A' },
];

const NICOTINE_STEPS = [
  { minSec: 120, title: '0–60s: Drink cold water & move rooms', detail: 'Break the physical location cue immediately and take 5 slow nasal inhales with long exhales.' },
  { minSec: 60, title: '60–120s: Keep your hands busy', detail: 'Chew sugar-free gum, grab a mug of tea, or squeeze your fists for 5 seconds and release.' },
  { minSec: 0, title: '120–180s: Watch the wave crest & drop', detail: 'Nicotine receptor spikes peak inside 3 minutes—every 180-second wave you surf weakens the habit loop.' },
];

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  weeklySpendGBP,
  onEscalateToCornerman,
  onJumpToFuel,
  onTriggerWitchingHourWebhook,
  onCompleteReset,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<SOSTab>('breathing');

  // Tab 1: 60s Box Breathing
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);
  const [phaseTick, setPhaseTick] = useState<number>(0);
  const [selectedHalt, setSelectedHalt] = useState<HALTKey>('Hungry');
  const [resetCompleted, setResetCompleted] = useState<boolean>(false);

  // Tab 2: 3-Min (180s) Nicotine Urge Surfer
  const [nicotineSeconds, setNicotineSeconds] = useState<number>(180);
  const [nicotineActive, setNicotineActive] = useState<boolean>(false);

  // Tab 3: Gambling Instant Friction Checklist
  const [frictionChecked, setFrictionChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(60);
      setIsBreathingActive(true);
      setPhaseTick(0);
      setResetCompleted(false);
      setNicotineSeconds(180);
      setNicotineActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'breathing' || !isBreathingActive || secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setPhaseTick((prev) => (prev + 1) % 16);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab, isBreathingActive, secondsLeft]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'nicotine' || !nicotineActive || nicotineSeconds <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setNicotineSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab, nicotineActive, nicotineSeconds]);

  if (!isOpen) return null;

  const phaseIndex = Math.floor(phaseTick / 4);
  const phaseCountdown = 4 - (phaseTick % 4);
  const currentPhase = BREATH_PHASES[phaseIndex];
  const singleNightCost = Math.max(25, Math.round(weeklySpendGBP * 0.45));

  const nicotineMins = Math.floor(nicotineSeconds / 60);
  const nicotineSecs = String(nicotineSeconds % 60).padStart(2, '0');
  const nicotinePct = Math.round(((180 - nicotineSeconds) / 180) * 100);

  const handleCompleteCravingReset = () => {
    setResetCompleted(true);
    onTriggerWitchingHourWebhook(selectedHalt);
    if (onCompleteReset) {
      onCompleteReset(selectedHalt);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#121518]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-modal-title"
      >
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.98, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-2xl shadow-lg overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Urgent Craving Reset Header */}
          <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E63946] text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#B91C1C] block">
                  Immediate multi-addiction craving reset • Protecting day {streakDays}
                </span>
                <h2
                  id="sos-modal-title"
                  className="font-display text-xl sm:text-2xl font-bold text-[#121518]"
                >
                  Craving Reset (Hold the Line)
                </h2>
              </div>
            </div>
            <button
              id="close-sos-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#121518] transition cursor-pointer"
              aria-label="Close Craving Reset modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-Tab Multi-Addiction Reset Bar */}
          <div className="px-5 pt-3 pb-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('breathing')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition ${
                activeTab === 'breathing'
                  ? 'bg-[#7A263A] text-white border-[#7A263A]'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              60s Box Breathing &amp; HALT
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('nicotine');
                setNicotineActive(true);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition ${
                activeTab === 'nicotine'
                  ? 'bg-[#7A263A] text-white border-[#7A263A]'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
              }`}
            >
              <CigaretteOff className="w-3.5 h-3.5" />
              3-Min Nicotine Urge Surfer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gambling')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition ${
                activeTab === 'gambling'
                  ? 'bg-[#7A263A] text-white border-[#7A263A]'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Gambling Instant Friction
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 overflow-y-auto iron-scroll space-y-6">
            {activeTab === 'breathing' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Step 1: 60-second Box Breathing */}
                  <div className="iron-surface p-5 flex flex-col items-center justify-between text-center">
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#121518] flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-[#0284C7]" /> Step 1: 4-4-4-4 box breathing
                      </span>
                      <span className="font-mono-metric text-xs font-semibold text-[#334155] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7A263A]" /> {secondsLeft}s left
                      </span>
                    </div>

                    <div className="relative my-5 flex items-center justify-center w-44 h-44">
                      <motion.div
                        animate={
                          prefersReducedMotion
                            ? { borderColor: currentPhase.borderColor }
                            : {
                                scale:
                                  isBreathingActive && secondsLeft > 0
                                    ? currentPhase.scale
                                    : 1,
                                borderColor: currentPhase.borderColor,
                              }
                        }
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        className="w-36 h-36 rounded-full bg-white border-4 flex flex-col items-center justify-center px-3"
                      >
                        <span className="font-mono-metric text-3xl font-bold text-[#121518]">
                          {secondsLeft > 0 ? `${phaseCountdown}s` : 'Done'}
                        </span>
                        <span className="text-xs font-semibold text-[#7A263A] mt-1">
                          {secondsLeft > 0 ? currentPhase.name : 'Breathing steady'}
                        </span>
                      </motion.div>
                    </div>

                    <p className="text-xs text-[#475569] mb-4">{currentPhase.sub}</p>

                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setIsBreathingActive((prev) => !prev)}
                        className="iron-btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#7A263A]" />
                        {isBreathingActive ? 'Pause timer' : 'Resume timer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSecondsLeft(60);
                          setPhaseTick(0);
                          setIsBreathingActive(true);
                        }}
                        className="iron-btn-ghost py-2 px-3 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset 60s
                      </button>
                    </div>
                  </div>

                  {/* Step 2: HALT Check */}
                  <div className="iron-surface p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#121518]">
                          Step 2: Quick HALT check
                        </span>
                        <span className="text-xs text-[#475569]">
                          Select what feels strongest
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4" role="group" aria-label="HALT states">
                        {(['Hungry', 'Angry', 'Lonely', 'Tired'] as HALTKey[]).map((key) => {
                          const active = selectedHalt === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedHalt(key)}
                              aria-pressed={active}
                              className={`py-2 px-2 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                                active
                                  ? 'bg-[#7A263A] text-white border-[#7A263A]'
                                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                              }`}
                            >
                              {key}
                            </button>
                          );
                        })}
                      </div>

                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-semibold text-[#7A263A]">
                          {HALT_PROTOCOLS[selectedHalt].headline}
                        </div>
                        <p className="text-xs text-[#334155] leading-relaxed">
                          {HALT_PROTOCOLS[selectedHalt].science}
                        </p>
                        <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#121518]">
                          <span className="font-semibold text-[#7A263A]">Next step: </span>
                          {HALT_PROTOCOLS[selectedHalt].immediateAction}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        id="complete-craving-reset-btn"
                        type="button"
                        onClick={handleCompleteCravingReset}
                        className="iron-btn-primary flex-1 py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {resetCompleted ? 'Craving Reset completed' : 'Complete Craving Reset'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedHalt === 'Hungry') {
                            onClose();
                            onJumpToFuel();
                          } else {
                            onClose();
                            onEscalateToCornerman(
                              `5 PM Craving Hit — I am feeling ${selectedHalt.toLowerCase()} right now on Day ${streakDays}. Talk me down mate.`
                            );
                          }
                        }}
                        className="iron-btn-secondary py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Utensils className="w-3.5 h-3.5 text-[#7A263A]" />
                        {HALT_PROTOCOLS[selectedHalt].buttonLabel}
                      </button>
                    </div>

                    {resetCompleted && (
                      <div
                        role="status"
                        className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Craving Reset logged. Well held, mate.
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Play the tape forward */}
                <div className="iron-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FastForward className="w-4 h-4 text-[#7A263A]" />
                    <span className="text-xs font-semibold text-[#121518]">
                      Step 3: Play the tape forward — tonight vs. tomorrow at 7:00am
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5">
                      <div className="text-xs font-semibold text-[#B91C1C] mb-1">
                        If you give in to a fleeting craving tonight
                      </div>
                      <p className="text-xs text-[#334155] leading-relaxed">
                        20 minutes of numbness followed by broken sleep, £{singleNightCost}+ spent, and waking up tomorrow resetting your {streakDays}-day streak with a heavy head.
                      </p>
                    </div>
                    <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5">
                      <div className="text-xs font-semibold text-[#0284C7] mb-1">
                        When you hold the line tonight
                      </div>
                      <p className="text-xs text-[#121518] leading-relaxed">
                        Tomorrow at 7:00am you wake up clear-headed, rested, £{singleNightCost} better off, and ready to log day {streakDays + 1}. Nobody ever woke up wishing they had caved the night before.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'nicotine' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 iron-surface p-6 flex flex-col items-center justify-between text-center space-y-4">
                  <div className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
                    <CigaretteOff className="w-4 h-4" /> 3-Minute Nicotine Urge Surfer
                  </div>
                  <div className="font-mono-metric text-5xl font-bold text-[#121518]">
                    {nicotineMins}:{nicotineSecs}
                  </div>
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0284C7] transition-all duration-300"
                      style={{ width: `${nicotinePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#475569]">
                    {nicotineSeconds === 0
                      ? 'Wave passed! Notice how the sharpest edge has dropped.'
                      : 'Most cigarette and vape cravings peak and drop inside 180 seconds.'}
                  </p>
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setNicotineActive((p) => !p)}
                      className="iron-btn-primary flex-1 py-2.5 px-3 text-xs cursor-pointer"
                    >
                      {nicotineActive ? 'Pause 3m surfer' : 'Start / Resume 3m'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNicotineSeconds(180);
                        setNicotineActive(true);
                      }}
                      className="iron-btn-secondary py-2.5 px-3 text-xs cursor-pointer"
                    >
                      Restart
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <h3 className="font-display text-lg font-bold text-[#121518]">
                    Outlast the 180-second spike step by step
                  </h3>
                  {NICOTINE_STEPS.map((st, i) => {
                    const active =
                      (i === 0 && nicotineSeconds > 120) ||
                      (i === 1 && nicotineSeconds <= 120 && nicotineSeconds > 60) ||
                      (i === 2 && nicotineSeconds <= 60);
                    return (
                      <div
                        key={st.title}
                        className={`p-4 rounded-xl border transition ${
                          active ? 'iron-surface-selected' : 'iron-card'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#7A263A]">
                          {st.title}
                        </div>
                        <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                          {st.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'gambling' && (
              <div className="space-y-4">
                <div className="iron-surface p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-display text-lg font-bold text-[#121518] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#7A263A]" /> Gambling Instant Circuit-Breaker
                    </h3>
                    <span className="text-xs font-medium text-[#0284C7]">
                      Payday &amp; 3 PM matchday protection
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    Put friction between the urge and your bank balance right now. Tick off each step to lock your accounts:
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'phone-away',
                        title: '1. Put the phone across the room for 10 minutes',
                        detail: 'Delete betting apps from your home screen and close live odds tabs immediately.',
                      },
                      {
                        id: 'bank-block',
                        title: '2. Turn on your UK Bank Card Gambling Block (48hr lock)',
                        detail: 'Available inside Monzo, Starling, Barclays, Lloyds, HSBC, NatWest, and Santander apps.',
                      },
                      {
                        id: 'gamstop',
                        title: '3. Register with GAMSTOP & install Gamban',
                        detail: 'GAMSTOP blocks all GB-licensed online betting sites/apps; Gamban is free via GamCare.',
                      },
                    ].map((item) => {
                      const done = Boolean(frictionChecked[item.id]);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setFrictionChecked((prev) => ({
                              ...prev,
                              [item.id]: !done,
                            }))
                          }
                          className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                            done ? 'iron-surface-selected' : 'bg-white border-[#CBD5E1]'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              done ? 'text-[#0284C7]' : 'text-[#94A3B8]'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-semibold text-[#121518]">
                              {item.title}
                            </div>
                            <div className="text-xs text-[#475569] mt-0.5">
                              {item.detail}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href="tel:08088020133"
                      className="iron-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call GamCare 24/7 (0808 8020 133)
                    </a>
                    <a
                      href="https://www.gamstop.co.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="iron-btn-secondary py-2.5 px-4 text-xs"
                    >
                      Open GAMSTOP
                    </a>
                    <a
                      href="https://www.gamcare.org.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="iron-btn-ghost py-2.5 px-4 text-xs"
                    >
                      Free Gamban via GamCare
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: One-tap escalation + Medical safety */}
            <div className="iron-surface p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-[#121518]">
                  One-tap support — you do not have to white-knuckle this alone
                </span>
                <span className="text-xs text-[#475569]">
                  24/7 voice coach and free UK helplines
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEscalateToCornerman(
                      `5 PM Craving Hit — Talk Me Down. I'm on Day ${streakDays} and feeling ${selectedHalt.toLowerCase()}.`
                    );
                  }}
                  className="iron-btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PippaIcon className="w-4 h-4" />
                  Talk to Pippa
                </button>

                <a
                  href="tel:116123"
                  className="iron-btn-secondary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#7A263A]" />
                  Call Samaritans (116 123)
                </a>

                <a
                  href="tel:111"
                  className="iron-btn-secondary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#E63946]" />
                  NHS 111 Withdrawal Advice
                </a>
              </div>
              <p className="text-[11px] text-[#475569]">
                <strong>UK medical safety notice:</strong> Never stop heavy daily alcohol or substance use suddenly without medical advice — contact NHS 111, your GP, or 999 in an emergency.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
