import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  FastForward,
  Flame,
  PhoneCall,
  Play,
  RotateCcw,
  ShieldAlert,
  Utensils,
  Wind,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  weeklySpendGBP: number;
  onEscalateToCornerman: (prompt: string) => void;
  onJumpToFuel: () => void;
  onTriggerWitchingHourWebhook: (haltState: string) => void;
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
    headline: 'HYPOGLYCAEMIA DISGUISED AS A CRAVING',
    science:
      'When your blood glucose drops after a long shift, your brain screams for the fastest liquid sugar it knows—alcohol. Eat 35g+ protein and complex carbs now and the craving drops by 70% inside 15 minutes.',
    immediateAction:
      'Go straight to the kitchen: make the 10-Min Smashed Mackerel & Chickpea Bowl or sear a 12-Min Rump Steak Skillet. Pour an ice-cold ginger ACV spritz first.',
    buttonLabel: 'Open 15-Min Shift Meals',
  },
  Angry: {
    headline: 'ADRENALINE & CORTISOL FLOODING THE PASS',
    science:
      'Resentment and workplace frustration lock your sympathetic nervous system in fight-or-flight. Drinking on anger pours petrol on the amygdala and wrecks your sleep architecture.',
    immediateAction:
      'Drop your shoulders. Finish 60 seconds of 4-4-4-4 Box Breathing above, splash freezing water on your wrists/face, and walk outside for 10 minutes without your phone.',
    buttonLabel: 'Talk It Out With Cornerman AI',
  },
  Lonely: {
    headline: 'ISOLATION IN THE QUIET HOURS',
    science:
      'Walking into an empty room after a noisy shift or site is one of the biggest triggers in recovery. The pub offers fake company at a brutal price.',
    immediateAction:
      'Post a quick check-in inside #kitchen-and-shift-workers or #day-1-starters in The Locker Room, or talk directly with the Cornerman AI right now.',
    buttonLabel: 'Open Cornerman 5 PM Talk-Down',
  },
  Tired: {
    headline: 'DECISION FATIGUE & NERVOUS SYSTEM EXHAUSTION',
    science:
      'Alcohol is a sedative, not a sleep aid—it destroys REM sleep and wakes you at 3:00 AM with a racing heart. Your prefrontal cortex just needs permission to clock off.',
    immediateAction:
      'Put on clean clothes immediately (signals the shift is over), eat Overnight Oats or eggs on toast, take a hot shower, and get your head on the pillow 90 minutes early.',
    buttonLabel: 'Get 5-Min Recovery Protocol',
  },
};

const BREATH_PHASES = [
  { name: 'INHALE SLOWLY', sub: 'Expand belly & ribs through the nose', scale: 1.38, color: '#1BB1E7' },
  { name: 'HOLD FULL', sub: 'Shoulders down, jaw unclenched', scale: 1.38, color: '#7A263A' },
  { name: 'EXHALE CLEAN', sub: 'Release cortisol out through the mouth', scale: 0.88, color: '#1BB1E7' },
  { name: 'HOLD EMPTY', sub: 'Steady the vagus nerve', scale: 0.88, color: '#7A263A' },
];

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  weeklySpendGBP,
  onEscalateToCornerman,
  onJumpToFuel,
  onTriggerWitchingHourWebhook,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);
  const [phaseTick, setPhaseTick] = useState<number>(0); // 0..15 for 4x4s box
  const [selectedHalt, setSelectedHalt] = useState<HALTKey>('Hungry');
  const [webhookSentBanner, setWebhookSentBanner] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(60);
      setIsBreathingActive(true);
      setPhaseTick(0);
      setWebhookSentBanner(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isBreathingActive || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setPhaseTick((prev) => (prev + 1) % 16);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isBreathingActive, secondsLeft]);

  if (!isOpen) return null;

  const phaseIndex = Math.floor(phaseTick / 4); // 0, 1, 2, 3
  const phaseCountdown = 4 - (phaseTick % 4);
  const currentPhase = BREATH_PHASES[phaseIndex];
  const singleNightCost = Math.max(25, Math.round(weeklySpendGBP * 0.45));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-modal-title"
      >
        <motion.div
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-[#121518] border-2 border-[#E63946] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Crisis Banner */}
          <div className="bg-gradient-to-r from-[#E63946] via-[#9E2A35] to-[#7A263A] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/30 text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono-metric uppercase tracking-widest text-white/90 block">
                  EMERGENCY CRAVING DE-ESCALATION PROTOCOL • DAY {streakDays} AT STAKE
                </span>
                <h2
                  id="sos-modal-title"
                  className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide"
                >
                  5 PM SOS / WITCHING HOUR RESET
                </h2>
              </div>
            </div>
            <button
              id="close-sos-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white transition cursor-pointer"
              aria-label="Close SOS Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable 4-Step Crisis Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Grid of Step 1 (Box Breathing) + Step 2 (HALT Check) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* STEP 1: 60-SECOND BOX BREATHING */}
              <div className="forge-card rounded-xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-mono-metric uppercase px-2.5 py-1 rounded bg-[#1BB1E7]/15 text-[#1BB1E7] border border-[#1BB1E7]/30 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" /> STEP 1: 60s BOX BREATHING
                  </span>
                  <span className="font-mono-metric text-sm font-bold text-[#F8F9FA] flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#1BB1E7]" /> {secondsLeft}s remaining
                  </span>
                </div>

                {/* Animated Breathing Circle */}
                <div className="relative my-6 flex items-center justify-center w-48 h-48">
                  <motion.div
                    animate={{
                      scale: isBreathingActive && secondsLeft > 0 ? currentPhase.scale : 1,
                      borderColor: currentPhase.color,
                    }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(27,177,231,0.28)]"
                    style={{
                      background:
                        phaseIndex % 2 === 0
                          ? 'radial-gradient(circle, rgba(27,177,231,0.28) 0%, rgba(122,38,58,0.2) 100%)'
                          : 'radial-gradient(circle, rgba(122,38,58,0.38) 0%, rgba(18,21,24,0.9) 100%)',
                    }}
                  >
                    <span className="font-mono-metric text-3xl font-bold text-[#F8F9FA]">
                      {secondsLeft > 0 ? `${phaseCountdown}s` : 'DONE'}
                    </span>
                    <span className="font-display text-xs tracking-wider uppercase text-[#1BB1E7] mt-1 px-2">
                      {secondsLeft > 0 ? currentPhase.name : 'NERVOUS SYSTEM STEADY'}
                    </span>
                  </motion.div>
                </div>

                <p className="text-xs text-[#94A3B8] mb-4">{currentPhase.sub}</p>

                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => setIsBreathingActive((prev) => !prev)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    {isBreathingActive ? 'Pause Breath Timer' : 'Resume Breath Timer'}
                  </button>
                  <button
                    onClick={() => {
                      setSecondsLeft(60);
                      setPhaseTick(0);
                      setIsBreathingActive(true);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-semibold text-[#94A3B8] hover:text-[#F8F9FA] flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset 60s
                  </button>
                </div>
              </div>

              {/* STEP 2: HALT CHECK */}
              <div className="forge-card rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono-metric uppercase px-2.5 py-1 rounded bg-[#7A263A]/30 text-[#F8F9FA] border border-[#7A263A] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#1BB1E7]" /> STEP 2: RAPID H.A.L.T. DIAGNOSTIC
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">Tap what hits hardest</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {(['Hungry', 'Angry', 'Lonely', 'Tired'] as HALTKey[]).map((key) => {
                      const active = selectedHalt === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedHalt(key)}
                          className={`py-2.5 px-2 rounded-lg font-display text-sm tracking-wide uppercase transition border cursor-pointer ${
                            active
                              ? 'bg-[#7A263A] text-white border-[#1BB1E7] shadow-md'
                              : 'bg-[#121518] text-[#94A3B8] border-[#2E353D] hover:text-white'
                          }`}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-[#121518] border border-[#2E353D] rounded-lg p-3.5 space-y-2">
                    <div className="text-xs font-mono-metric font-bold text-[#1BB1E7]">
                      {HALT_PROTOCOLS[selectedHalt].headline}
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {HALT_PROTOCOLS[selectedHalt].science}
                    </p>
                    <div className="pt-2 border-t border-[#2E353D]/70 text-xs text-[#F8F9FA] font-medium">
                      <span className="text-[#1BB1E7] font-bold">Chef’s Orders: </span>
                      {HALT_PROTOCOLS[selectedHalt].immediateAction}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (selectedHalt === 'Hungry') {
                        onClose();
                        onJumpToFuel();
                      } else {
                        onClose();
                        onEscalateToCornerman(
                          `5 PM Craving Hit — I am feeling ${selectedHalt.toUpperCase()} right now on Day ${streakDays}. Talk me down mate.`
                        );
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#1BB1E7] hover:bg-[#1BB1E7]/90 text-[#121518] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" />
                    {HALT_PROTOCOLS[selectedHalt].buttonLabel}
                  </button>
                  <button
                    onClick={() => {
                      onTriggerWitchingHourWebhook(selectedHalt);
                      setWebhookSentBanner(true);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-medium text-[#F8F9FA] transition cursor-pointer"
                    title="Fires Friday 4:45 PM Witching Hour check-in alert to n8n / Twenty CRM"
                  >
                    Log 5 PM Check-In Alert
                  </button>
                </div>

                {webhookSentBanner && (
                  <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Witching-Hour Craving Check-in logged & dispatched to n8n Accountability Webhook.
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: PLAY THE TAPE FORWARD */}
            <div className="forge-card-claret rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FastForward className="w-4 h-4 text-[#1BB1E7]" />
                <span className="text-xs font-mono-metric uppercase tracking-wider text-[#1BB1E7] font-bold">
                  STEP 3: PLAY THE TAPE FORWARD — TONIGHT VS. TOMORROW 7:00 AM
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121518]/90 border border-[#E63946]/40 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase text-[#E63946] mb-1">
                    IF YOU GIVE IN TO A 20-MINUTE CRAVING TONIGHT:
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    25 minutes of artificial numbness, followed by broken sleep, a 3:15 AM sweating cortisol spike, £{singleNightCost}+ gone from your account, and waking up tomorrow having to reset your **Day {streakDays}** counter back to zero with a pounding head.
                  </p>
                </div>
                <div className="bg-[#121518]/90 border border-[#1BB1E7]/50 rounded-lg p-3.5">
                  <div className="text-xs font-bold uppercase text-[#1BB1E7] mb-1">
                    WHEN YOU HOLD THE LINE UNTIL YOUR HEAD HITS THE PILLOW:
                  </div>
                  <p className="text-xs text-[#F8F9FA] leading-relaxed">
                    Tomorrow at 7:00 AM you wake up with clean lungs, deep REM sleep in the bank, £{singleNightCost} still in your pocket, and **Day {streakDays + 1}** forged in iron. Nobody in history ever woke up at 7 AM wishing they had drunk the night before.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 4: ONE-TAP ESCALATION */}
            <div className="forge-card rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs font-mono-metric uppercase tracking-wider text-[#F8F9FA] font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#E63946]" /> STEP 4: ONE-TAP ESCALATION — DON’T WHITE-KNUCKLE THIS ALONE
                </span>
                <span className="text-[11px] text-[#94A3B8]">Immediate 24/7 human & AI support</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onEscalateToCornerman(
                      `5 PM Craving Hit — Talk Me Down. I'm on Day ${streakDays} and feeling ${selectedHalt}.`
                    );
                  }}
                  className="py-3 px-4 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#1BB1E7]" />
                  Open Ironclad Cornerman AI
                </button>

                <a
                  href="tel:116123"
                  className="py-3 px-4 rounded-xl bg-[#1E2328] hover:bg-[#2E353D] border border-[#1BB1E7]/50 text-[#F8F9FA] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4 text-[#1BB1E7]" />
                  Dial Samaritans (116 123)
                </a>

                <a
                  href="tel:0800585858"
                  className="py-3 px-4 rounded-xl bg-[#1E2328] hover:bg-[#2E353D] border border-[#E63946]/60 text-[#F8F9FA] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4 text-[#E63946]" />
                  Dial CALM UK (0800 58 58 58)
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
