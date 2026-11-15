export const IRON_MILESTONE_THRESHOLDS = [
  1, 2, 3, 4, 5, 6, 7, 14, 30, 90, 180, 365,
] as const;

export type MilestoneThreshold = (typeof IRON_MILESTONE_THRESHOLDS)[number];

export type MilestoneStatus = 'earned' | 'next' | 'locked';

export interface IronMilestone {
  id: string;
  daysRequired: MilestoneThreshold;
  title: string;
  subtitle: string;
  description: string;
  iconName:
    | 'Flame'
    | 'Shield'
    | 'Anchor'
    | 'Compass'
    | 'Zap'
    | 'CheckCircle2'
    | 'Award'
    | 'Hammer'
    | 'Star'
    | 'Crown';
}

export interface IronMilestoneWithState extends IronMilestone {
  status: MilestoneStatus;
  daysRemaining: number;
  earnedAt?: string;
}

export const IRON_MILESTONES: IronMilestone[] = [
  {
    id: 'badge-1',
    daysRequired: 1,
    title: 'Day 1 Spark',
    subtitle: '24 hours clear',
    description: 'First 24 hours alcohol-free. You drew a clear line today.',
    iconName: 'Flame',
  },
  {
    id: 'badge-2',
    daysRequired: 2,
    title: 'Day 2 Steady',
    subtitle: '48 hours held',
    description: 'Two consecutive days alcohol-free. Backing up yesterday’s promise.',
    iconName: 'Shield',
  },
  {
    id: 'badge-3',
    daysRequired: 3,
    title: 'Day 3 Anchor',
    subtitle: '72 hours grounded',
    description: 'Three days alcohol-free. Holding steady through the early stretch.',
    iconName: 'Anchor',
  },
  {
    id: 'badge-4',
    daysRequired: 4,
    title: 'Day 4 Rhythm',
    subtitle: 'Four days in step',
    description: 'Four days alcohol-free. Building a repeatable daily routine.',
    iconName: 'Compass',
  },
  {
    id: 'badge-5',
    daysRequired: 5,
    title: 'Day 5 Tempering',
    subtitle: 'Five days forged',
    description: 'Five days alcohol-free. Proving your routine works across the working week.',
    iconName: 'Zap',
  },
  {
    id: 'badge-6',
    daysRequired: 6,
    title: 'Day 6 Resolve',
    subtitle: 'Six days clear',
    description: 'Six days alcohol-free. One step away from a full week.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'badge-7',
    daysRequired: 7,
    title: '7-Day Iron',
    subtitle: 'First full week',
    description: 'Seven days alcohol-free. Every day of the week navigated clear-headed.',
    iconName: 'Shield',
  },
  {
    id: 'badge-14',
    daysRequired: 14,
    title: '14-Day Fortnight',
    subtitle: 'Two weeks strong',
    description: 'Fourteen days alcohol-free. Two full weeks of consistent choices.',
    iconName: 'Award',
  },
  {
    id: 'badge-30',
    daysRequired: 30,
    title: '30-Day Hammer',
    subtitle: 'One month forged',
    description: 'Thirty days alcohol-free. A full month of keeping your word to yourself.',
    iconName: 'Hammer',
  },
  {
    id: 'badge-90',
    daysRequired: 90,
    title: '90-Day Anvil',
    subtitle: 'Three months solid',
    description: 'Ninety days alcohol-free. A full quarter of steady, grounded living.',
    iconName: 'Award',
  },
  {
    id: 'badge-180',
    daysRequired: 180,
    title: '180-Day Steel',
    subtitle: 'Six months clear',
    description: 'Half a year alcohol-free through changing seasons, shifts, and socials.',
    iconName: 'Star',
  },
  {
    id: 'badge-365',
    daysRequired: 365,
    title: '365 Unbreakable',
    subtitle: 'One full year',
    description: '365 days alcohol-free. Four seasons forged into lasting strength.',
    iconName: 'Crown',
  },
];

const STORAGE_PREFIX = 'ironclad_mindset_v1_';
const EARNED_BADGES_KEY = `${STORAGE_PREFIX}earned_badges_v2`;
const STREAK_KEY = `${STORAGE_PREFIX}streak_days`;
const MIGRATED_FLAG_KEY = `${STORAGE_PREFIX}milestones_migrated_v2`;

export interface EarnedBadgeRecord {
  daysRequired: MilestoneThreshold;
  earnedAt: string; // YYYY-MM-DD
}

/**
 * Pure helper to merge newly reached thresholds into existing earned badge records.
 * Awards each badge only once and preserves previously earned badges even if streakDays later resets.
 */
export function mergeEarnedMilestones(
  streakDays: number,
  existingRecords: EarnedBadgeRecord[],
  todayISO: string = new Date().toISOString().slice(0, 10)
): EarnedBadgeRecord[] {
  const byThreshold = new Map<MilestoneThreshold, EarnedBadgeRecord>();

  for (const rec of existingRecords) {
    if (
      IRON_MILESTONE_THRESHOLDS.includes(rec.daysRequired) &&
      !byThreshold.has(rec.daysRequired)
    ) {
      byThreshold.set(rec.daysRequired, rec);
    }
  }

  const safeStreak = Math.max(0, Math.floor(streakDays));
  for (const threshold of IRON_MILESTONE_THRESHOLDS) {
    if (safeStreak >= threshold && !byThreshold.has(threshold)) {
      byThreshold.set(threshold, {
        daysRequired: threshold,
        earnedAt: todayISO,
      });
    }
  }

  return Array.from(byThreshold.values()).sort(
    (a, b) => a.daysRequired - b.daysRequired
  );
}

/**
 * Computes the complete state for all 12 badges, the unlocked count, and the next milestone.
 */
export function evaluateMilestoneProgress(
  streakDays: number,
  earnedRecords: EarnedBadgeRecord[]
): {
  milestones: IronMilestoneWithState[];
  unlockedCount: number;
  totalCount: number;
  nextMilestone: IronMilestoneWithState | null;
  allUnlocked: boolean;
} {
  const safeStreak = Math.max(0, Math.floor(streakDays));
  const merged = mergeEarnedMilestones(safeStreak, earnedRecords);
  const earnedMap = new Map<MilestoneThreshold, string>(
    merged.map((r) => [r.daysRequired, r.earnedAt])
  );

  // Find the first threshold not yet earned
  const nextThreshold =
    IRON_MILESTONE_THRESHOLDS.find((t) => !earnedMap.has(t)) ?? null;

  const milestones: IronMilestoneWithState[] = IRON_MILESTONES.map((m) => {
    const isEarned = earnedMap.has(m.daysRequired);
    const isNext = !isEarned && m.daysRequired === nextThreshold;
    const status: MilestoneStatus = isEarned
      ? 'earned'
      : isNext
      ? 'next'
      : 'locked';
    const daysRemaining = isEarned
      ? 0
      : Math.max(1, m.daysRequired - safeStreak);

    return {
      ...m,
      status,
      daysRemaining,
      earnedAt: earnedMap.get(m.daysRequired),
    };
  });

  const nextMilestone = milestones.find((m) => m.status === 'next') ?? null;

  return {
    milestones,
    unlockedCount: earnedMap.size,
    totalCount: IRON_MILESTONES.length,
    nextMilestone,
    allUnlocked: earnedMap.size === IRON_MILESTONES.length,
  };
}

/**
 * Loads and migrates existing streak and earned milestone progress idempotently.
 */
export function loadAndMigrateMilestones(
  todayISO: string = new Date().toISOString().slice(0, 10)
): {
  streakDays: number;
  earnedRecords: EarnedBadgeRecord[];
} {
  let streakDays = 0;
  try {
    const rawStreak = localStorage.getItem(STREAK_KEY);
    if (rawStreak !== null) {
      const parsed = JSON.parse(rawStreak);
      if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0) {
        streakDays = Math.floor(parsed);
      }
    }
  } catch {
    streakDays = 0;
  }

  let existingRecords: EarnedBadgeRecord[] = [];
  try {
    const rawEarned = localStorage.getItem(EARNED_BADGES_KEY);
    if (rawEarned) {
      const parsed = JSON.parse(rawEarned);
      if (Array.isArray(parsed)) {
        existingRecords = parsed.filter(
          (item) =>
            item &&
            typeof item.daysRequired === 'number' &&
            IRON_MILESTONE_THRESHOLDS.includes(
              item.daysRequired as MilestoneThreshold
            )
        );
      }
    }
  } catch {
    existingRecords = [];
  }

  // Merge any badges earned from current/historical streakDays
  const merged = mergeEarnedMilestones(streakDays, existingRecords, todayISO);

  try {
    localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(merged));
    localStorage.setItem(MIGRATED_FLAG_KEY, 'true');
  } catch {
    // Ignore storage quota errors
  }

  return {
    streakDays,
    earnedRecords: merged,
  };
}

export function saveEarnedMilestones(records: EarnedBadgeRecord[]): void {
  try {
    localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage errors
  }
}
