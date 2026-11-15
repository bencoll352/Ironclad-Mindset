import { describe, expect, it, beforeEach } from 'vitest';
import {
  IRON_MILESTONE_THRESHOLDS,
  evaluateMilestoneProgress,
  loadAndMigrateMilestones,
  mergeEarnedMilestones,
} from '../src/services/milestones';
import {
  IroncladCheckInsDatabase,
  build28DayHeatmapFromDatedEntries,
  clearAllDatedCheckIns,
  exportDatedCheckInsBackup,
  getAllDatedCheckIns,
  migrateLegacyCheckInsToDexie,
  restoreDatedCheckInsBackup,
  saveDatedCheckIn,
} from '../src/db/checkinsDb';

// Simple localStorage polyfill for Node test environment
const storageMap = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => {
    storageMap.set(k, String(v));
  },
  removeItem: (k: string) => {
    storageMap.delete(k);
  },
  clear: () => {
    storageMap.clear();
  },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
  get length() {
    return storageMap.size;
  },
};

describe('12 Iron Milestones & Streak Progression', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('uses exact ascending thresholds: 1, 2, 3, 4, 5, 6, 7, 14, 30, 90, 180, 365', () => {
    expect([...IRON_MILESTONE_THRESHOLDS]).toEqual([
      1, 2, 3, 4, 5, 6, 7, 14, 30, 90, 180, 365,
    ]);
  });

  it('handles a brand-new user at Day 0 with 0 of 12 unlocked and Day 1 next', () => {
    const res = evaluateMilestoneProgress(0, []);
    expect(res.unlockedCount).toBe(0);
    expect(res.totalCount).toBe(12);
    expect(res.allUnlocked).toBe(false);
    expect(res.nextMilestone?.daysRequired).toBe(1);
    expect(res.nextMilestone?.daysRemaining).toBe(1);
  });

  it('awards each of the 12 thresholds accurately as streak advances', () => {
    for (let idx = 0; idx < IRON_MILESTONE_THRESHOLDS.length; idx++) {
      const threshold = IRON_MILESTONE_THRESHOLDS[idx];
      const res = evaluateMilestoneProgress(threshold, []);
      expect(res.unlockedCount).toBe(idx + 1);
      const badge = res.milestones[idx];
      expect(badge.status).toBe('earned');
      expect(badge.daysRequired).toBe(threshold);
    }
  });

  it('migrates an existing user at Day 14 to 8 of 12 unlocked with 30-Day Hammer next (16 days remaining)', () => {
    localStorage.setItem('ironclad_mindset_v1_streak_days', '14');
    const migrated = loadAndMigrateMilestones('2026-11-15');
    expect(migrated.streakDays).toBe(14);
    expect(migrated.earnedRecords.map((r) => r.daysRequired)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 14,
    ]);

    const progress = evaluateMilestoneProgress(
      migrated.streakDays,
      migrated.earnedRecords
    );
    expect(progress.unlockedCount).toBe(8);
    expect(progress.nextMilestone?.daysRequired).toBe(30);
    expect(progress.nextMilestone?.daysRemaining).toBe(16);
  });

  it('preserves earned badges across a streak setback and awards each badge only once', () => {
    const earnedAtDay14 = mergeEarnedMilestones(14, [], '2026-11-10');
    expect(earnedAtDay14.length).toBe(8);

    // User experiences a setback -> active streak resets to 0
    const afterSetback = evaluateMilestoneProgress(0, earnedAtDay14);
    expect(afterSetback.unlockedCount).toBe(8);
    // Previously earned 8 badges stay 'earned'
    expect(
      afterSetback.milestones.filter((m) => m.status === 'earned').length
    ).toBe(8);
    // Next unearned milestone is still Day 30 (30 days remaining from 0)
    expect(afterSetback.nextMilestone?.daysRequired).toBe(30);
    expect(afterSetback.nextMilestone?.daysRemaining).toBe(30);

    // Climbing back to Day 5 does not duplicate badges
    const reclimb = mergeEarnedMilestones(5, earnedAtDay14, '2026-11-15');
    expect(reclimb.length).toBe(8);
    expect(reclimb[0].earnedAt).toBe('2026-11-10');
  });

  it('handles the 12 of 12 unlocked state cleanly at 365+ days', () => {
    const res = evaluateMilestoneProgress(365, []);
    expect(res.unlockedCount).toBe(12);
    expect(res.totalCount).toBe(12);
    expect(res.allUnlocked).toBe(true);
    expect(res.nextMilestone).toBeNull();
    expect(res.milestones.every((m) => m.status === 'earned')).toBe(true);
  });
});

describe('Dated Check-Ins, Idempotent Migration & 28-Day Heatmap', () => {
  const testDb = new IroncladCheckInsDatabase('TestCheckInsDB');

  beforeEach(async () => {
    storageMap.clear();
    await clearAllDatedCheckIns(testDb);
  });

  it('migrates only historical records with valid ISO dates and is idempotent on re-run', async () => {
    localStorage.setItem(
      'ironclad_mindset_v1_forge_logs',
      JSON.stringify([
        { date: '2026-11-13', mood: 8, sleep: 8, craving: 5, notes: 'Friday shift' },
        { date: '2026-11-14', mood: 9, sleep: 8, craving: 2, notes: 'Matchday sober' },
        { date: 'not-a-date', mood: 5 },
      ])
    );

    const firstRun = await migrateLegacyCheckInsToDexie(testDb);
    expect(firstRun.length).toBe(2);

    // Edit 2026-11-14 in place
    await saveDatedCheckIn(
      {
        date: '2026-11-14',
        alcoholFree: true,
        cravingIntensity: 1,
        mood: 10,
        privateNote: 'Updated note in place',
      },
      testDb
    );

    // Re-running migration must leave the edited record untouched and never duplicate dates
    const secondRun = await migrateLegacyCheckInsToDexie(testDb);
    expect(secondRun.length).toBe(2);
    const nov14 = secondRun.find((r) => r.date === '2026-11-14');
    expect(nov14?.cravingIntensity).toBe(1);
    expect(nov14?.privateNote).toBe('Updated note in place');
  });

  it('generates the 28-day heatmap strictly from actual dated entries and supports export/restore', async () => {
    await saveDatedCheckIn(
      {
        date: '2026-11-15',
        alcoholFree: true,
        cravingIntensity: 2,
      },
      testDb
    );

    const entries = await getAllDatedCheckIns(testDb);
    const cells = build28DayHeatmapFromDatedEntries(entries, '2026-11-15');
    expect(cells.length).toBe(28);
    expect(cells[27].date).toBe('2026-11-15');
    expect(cells[27].logged).toBe(true);
    expect(cells[27].alcoholFree).toBe(true);
    expect(cells[26].logged).toBe(false);

    const exportedJson = await exportDatedCheckInsBackup(testDb);
    await clearAllDatedCheckIns(testDb);
    expect((await getAllDatedCheckIns(testDb)).length).toBe(0);

    const restored = await restoreDatedCheckInsBackup(exportedJson, testDb);
    expect(restored.restoredCount).toBe(1);
    expect((await getAllDatedCheckIns(testDb)).length).toBe(1);
  });
});
