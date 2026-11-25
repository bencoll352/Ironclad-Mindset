import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  FastForward,
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
      'Workplace frustration keeps your body in fight-or-flight mode. Drinking on frustration only disrupts your sleep and leaves the problem waiting tomorrow.',
    immediateAction:
      'Drop your shoulders. Complete 60 seconds of Box Breathing, splash cold water on your wrists, and step outside for 10 minutes without your phone.',
    buttonLabel: 'Talk it through with Pippa',
  },
  Lonely: {
    headline: 'Quiet hours after a busy shift',
    science:
      'Walking into a quiet flat after a noisy shift or site is a common trigger. Reaching out to someone breaks the isolation immediately.',
    immediateAction:
      'Check in with peers in the Locker Room or talk with Pippa right now.',
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
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);
  const [phaseTick, setPhaseTick] = useState<number>(0);
  const [selectedHalt, setSelectedHalt] = useState<HALTKey>('Hungry');
  const [resetCompleted, setResetCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(60);
      setIsBreathingActive(true);
      setPhaseTick(0);
      setResetCompleted(false);
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
    if (!isOpen || !isBreathingActive || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setPhaseTick((prev) => (prev + 1) % 16);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isBreathingActive, secondsLeft]);

  if (!isOpen) return null;

  const phaseIndex = Math.floor(phaseTick / 4);
  const phaseCountdown = 4 - (phaseTick % 4);
  const currentPhase = BREATH_PHASES[phaseIndex];
  const singleNightCost = Math.max(25, Math.round(weeklySpendGBP * 0.45));

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
        className="fixed inset-0 z-50 bg-[#121518]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
          <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DC2626] text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-[#B91C1C] block">
                  Immediate craving reset • Protecting day {streakDays}
                </span>
                <h2
                  id="sos-modal-title"
                  className="font-display text-xl sm:text-2xl font-bold text-[#121518]"
                >
                  Craving Reset (60-second pause)
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

          {/* Modal Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
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
                    className="iron-btn-secondary py-2 px-3 text-xs flex items-center gap-1 cursor-pointer"
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
                    Tomorrow at 7:00am you wake up clear-headed, rested, £{singleNightCost} better off, and ready to log day {streakDays + 1}. Nobody ever woke up wishing they had drunk the night before.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: One-tap escalation */}
            <div className="iron-surface p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold text-[#121518]">
                  Step 4: One-tap support — you do not have to white-knuckle this alone
                </span>
                <span className="text-xs text-[#475569]">
                  24/7 companion and free UK helplines
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
                  href="tel:0800585858"
                  className="iron-btn-secondary py-2.5 px-4 text-xs flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#DC2626]" />
                  Call CALM (0800 58 58 58)
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
