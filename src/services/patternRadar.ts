/**
 * Local Trigger-to-Craving Pattern Radar (100% On-Device Analytics)
 */
import { DatedCheckIn } from '../db/checkinsDb';

export interface PatternRadarSummary {
  hasRealData: boolean;
  headlineInsight: string;
  topTrigger: string | null;
  peakDayOfWeek: string | null;
  bestCopingTool: string | null;
  averageCraving: number | null;
  averageMood: number | null;
  fridayHighCravingRatePct: number | null;
}

export const ILLUSTRATIVE_TREND_SAMPLE = [
  { dateLabel: 'Day 1', fullDate: 'Sample Day 1', craving: 8, mood: 4 },
  { dateLabel: 'Day 2', fullDate: 'Sample Day 2', craving: 7, mood: 5 },
  { dateLabel: 'Day 3', fullDate: 'Sample Day 3', craving: 6, mood: 6 },
  { dateLabel: 'Day 4', fullDate: 'Sample Day 4', craving: 5, mood: 7 },
  { dateLabel: 'Day 5', fullDate: 'Sample Day 5', craving: 5, mood: 7 },
  { dateLabel: 'Day 6', fullDate: 'Sample Day 6', craving: 3, mood: 8 },
  { dateLabel: 'Day 7', fullDate: 'Sample Day 7', craving: 2, mood: 9 },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function analyzePatternRadar(checkIns: DatedCheckIn[]): PatternRadarSummary {
  if (!checkIns.length) {
    return {
      hasRealData: false,
      headlineInsight:
        'Log your first 3 daily check-ins to unlock live Pattern Radar insights (showing an illustrative 7-day curve below).',
      topTrigger: null,
      peakDayOfWeek: null,
      bestCopingTool: null,
      averageCraving: null,
      averageMood: null,
      fridayHighCravingRatePct: null,
    };
  }

  let cravingSum = 0;
  let cravingCount = 0;
  let moodSum = 0;
  let moodCount = 0;

  const triggerStats = new Map<string, { count: number; totalCraving: number }>();
  const dayStats = new Map<string, { count: number; totalCraving: number; highCount: number }>();
  const helpedCounts = new Map<string, number>();

  for (const row of checkIns) {
    const craving = typeof row.cravingIntensity === 'number' ? row.cravingIntensity : null;
    const mood = typeof row.mood === 'number' ? row.mood : null;

    if (craving !== null) {
      cravingSum += craving;
      cravingCount += 1;
    }
    if (mood !== null) {
      moodSum += mood;
      moodCount += 1;
    }

    if (row.trigger && row.trigger.trim()) {
      const key = row.trigger.trim();
      const prev = triggerStats.get(key) || { count: 0, totalCraving: 0 };
      triggerStats.set(key, {
        count: prev.count + 1,
        totalCraving: prev.totalCraving + (craving ?? 5),
      });
    }

    if (row.whatHelped && row.whatHelped.trim()) {
      const key = row.whatHelped.trim();
      helpedCounts.set(key, (helpedCounts.get(key) || 0) + 1);
    }

    const d = new Date(`${row.date}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      const dayName = WEEKDAYS[d.getUTCDay()];
      const prev = dayStats.get(dayName) || { count: 0, totalCraving: 0, highCount: 0 };
      dayStats.set(dayName, {
        count: prev.count + 1,
        totalCraving: prev.totalCraving + (craving ?? 5),
        highCount: prev.highCount + (craving !== null && craving >= 6 ? 1 : 0),
      });
    }
  }

  const topTriggerEntry = Array.from(triggerStats.entries()).sort(
    (a, b) => b[1].totalCraving - a[1].totalCraving
  )[0];
  const peakDayEntry = Array.from(dayStats.entries()).sort(
    (a, b) =>
      b[1].totalCraving / Math.max(1, b[1].count) -
      a[1].totalCraving / Math.max(1, a[1].count)
  )[0];
  const bestToolEntry = Array.from(helpedCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const friday = dayStats.get('Friday');
  const fridayHighRate =
    friday && friday.count > 0
      ? Math.round((friday.highCount / friday.count) * 100)
      : null;

  const topTrigger = topTriggerEntry?.[0] || null;
  const peakDay = peakDayEntry?.[0] || null;
  const bestTool = bestToolEntry?.[0] || null;

  let headlineInsight = '';
  if (fridayHighRate !== null && fridayHighRate >= 50 && topTrigger) {
    headlineInsight = `Your cravings spike ${fridayHighRate}% of the time on Fridays around "${topTrigger}" — prep your 5pm reset early.`;
  } else if (peakDay && topTrigger) {
    headlineInsight = `Cravings peak on ${peakDay}s linked to "${topTrigger}". ${
      bestTool ? `"${bestTool}" has been your strongest counter-move.` : 'Keep your 60s Craving Reset handy.'
    }`;
  } else if (topTrigger) {
    headlineInsight = `Top logged trigger: "${topTrigger}". ${
      bestTool ? `"${bestTool}" works reliably when that hits.` : 'Pair it with a 15-minute meal or Move the Iron.'
    }`;
  } else {
    const avgC = cravingCount > 0 ? (cravingSum / cravingCount).toFixed(1) : '—';
    const avgM = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : '—';
    headlineInsight = `Across ${checkIns.length} logged check-in${
      checkIns.length === 1 ? '' : 's'
    }, average craving is ${avgC}/10 and average mood is ${avgM}/10. Tag triggers to sharpen Pattern Radar.`;
  }

  return {
    hasRealData: true,
    headlineInsight,
    topTrigger,
    peakDayOfWeek: peakDay,
    bestCopingTool: bestTool,
    averageCraving: cravingCount > 0 ? Number((cravingSum / cravingCount).toFixed(1)) : null,
    averageMood: moodCount > 0 ? Number((moodSum / moodCount).toFixed(1)) : null,
    fridayHighCravingRatePct: fridayHighRate,
  };
}
