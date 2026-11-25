import Dexie, { type Table } from 'dexie';
import type { CommitmentTrackId } from '../types/ironclad';

export interface DatedCheckIn {
  date: string; // Primary key: YYYY-MM-DD (guarantees 1 entry per calendar date, no duplicates on edit)
  alcoholFree: boolean;
  trackId?: CommitmentTrackId;
  cravingIntensity?: number; // Optional 1–10
  mood?: number; // Optional 1–10
  sleep?: number; // Optional 1–10
  trigger?: string; // Optional trigger tag or text
  whatHelped?: string; // Optional coping tool or meal that helped
  privateNote?: string; // Strictly on-device private note (never sent to AI or B2B)
  completedTasks?: number;
  updatedAt: string; // ISO timestamp
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string' || !ISO_DATE_REGEX.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

export class IroncladCheckInsDatabase extends Dexie {
  checkins!: Table<DatedCheckIn, string>;

  constructor(dbName = 'IroncladMindsetCheckInsDB') {
    super(dbName);
    this.version(1).stores({
      // 'date' is the primary key so editing a date updates in place and never duplicates
      checkins: 'date, alcoholFree, updatedAt',
    });
  }
}

export const checkinsDb = new IroncladCheckInsDatabase();

// Fallback in-memory map for environments where IndexedDB is unavailable
const memoryFallback = new Map<string, DatedCheckIn>();

async function safeGetAllFromTable(
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<DatedCheckIn[]> {
  try {
    const rows = await db.checkins.orderBy('date').toArray();
    return rows;
  } catch {
    return Array.from(memoryFallback.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }
}

/**
 * Upserts a dated check-in. Editing an existing date updates the same primary key ('date') without duplication.
 */
export async function saveDatedCheckIn(
  input: Omit<DatedCheckIn, 'updatedAt'> & { updatedAt?: string },
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<DatedCheckIn> {
  if (!isValidISODate(input.date)) {
    throw new Error(`Invalid check-in date format: ${input.date}. Expected YYYY-MM-DD.`);
  }

  const record: DatedCheckIn = {
    date: input.date,
    alcoholFree: Boolean(input.alcoholFree),
    cravingIntensity:
      typeof input.cravingIntensity === 'number'
        ? Math.min(10, Math.max(0, Math.round(input.cravingIntensity)))
        : undefined,
    mood:
      typeof input.mood === 'number'
        ? Math.min(10, Math.max(1, Math.round(input.mood)))
        : undefined,
    sleep:
      typeof input.sleep === 'number'
        ? Math.min(10, Math.max(1, Math.round(input.sleep)))
        : undefined,
    trigger: input.trigger?.trim() || undefined,
    whatHelped: input.whatHelped?.trim() || undefined,
    privateNote: input.privateNote?.trim() || undefined,
    completedTasks:
      typeof input.completedTasks === 'number' ? input.completedTasks : undefined,
    updatedAt: input.updatedAt || new Date().toISOString(),
  };

  memoryFallback.set(record.date, record);
  try {
    await db.checkins.put(record);
  } catch {
    // Fallback map already updated
  }
  return record;
}

export async function getAllDatedCheckIns(
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<DatedCheckIn[]> {
  return safeGetAllFromTable(db);
}

export async function deleteDatedCheckIn(
  date: string,
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<void> {
  memoryFallback.delete(date);
  try {
    await db.checkins.delete(date);
  } catch {
    // Ignore
  }
}

export async function clearAllDatedCheckIns(
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<void> {
  memoryFallback.clear();
  try {
    await db.checkins.clear();
  } catch {
    // Ignore
  }
}

const LEGACY_FORGE_LOGS_KEY = 'ironclad_mindset_v1_forge_logs';

/**
 * Idempotent migration of legacy localStorage 'forge_logs' into Dexie.
 * Only migrates records where a valid YYYY-MM-DD date is explicitly known.
 * Never overwrites an already-migrated or user-edited date in Dexie.
 */
export async function migrateLegacyCheckInsToDexie(
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<DatedCheckIn[]> {
  try {
    const raw = localStorage.getItem(LEGACY_FORGE_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && isValidISODate(item.date)) {
            let existing: DatedCheckIn | undefined;
            try {
              existing = await db.checkins.get(item.date);
            } catch {
              existing = memoryFallback.get(item.date);
            }

            if (!existing) {
              await saveDatedCheckIn(
                {
                  date: item.date,
                  alcoholFree: true,
                  mood: typeof item.mood === 'number' ? item.mood : undefined,
                  sleep: typeof item.sleep === 'number' ? item.sleep : undefined,
                  cravingIntensity:
                    typeof item.craving === 'number' ? item.craving : undefined,
                  privateNote:
                    typeof item.notes === 'string' ? item.notes : undefined,
                  completedTasks:
                    typeof item.completedTasks === 'number'
                      ? item.completedTasks
                      : undefined,
                  updatedAt: `${item.date}T18:00:00.000Z`,
                },
                db
              );
            }
          }
        }
      }
    }
  } catch {
    // Ignore malformed legacy storage
  }

  return getAllDatedCheckIns(db);
}

export interface HeatmapDayCell {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  weekdayShort: string;
  isToday: boolean;
  logged: boolean;
  alcoholFree: boolean;
  cravingIntensity?: number;
  entry?: DatedCheckIn;
}

/**
 * Generates the 28-day heatmap strictly from actual dated check-in entries ending on referenceDateISO.
 */
export function build28DayHeatmapFromDatedEntries(
  entries: DatedCheckIn[],
  referenceDateISO: string = new Date().toISOString().slice(0, 10)
): HeatmapDayCell[] {
  const byDate = new Map<string, DatedCheckIn>();
  for (const e of entries) {
    if (isValidISODate(e.date)) {
      byDate.set(e.date, e);
    }
  }

  const refDate = isValidISODate(referenceDateISO)
    ? new Date(`${referenceDateISO}T12:00:00Z`)
    : new Date();

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells: HeatmapDayCell[] = [];

  for (let offset = 27; offset >= 0; offset--) {
    const d = new Date(refDate.getTime() - offset * 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    const match = byDate.get(iso);
    cells.push({
      date: iso,
      dayOfMonth: d.getUTCDate(),
      weekdayShort: weekdayNames[d.getUTCDay()],
      isToday: offset === 0,
      logged: Boolean(match),
      alcoholFree: match ? match.alcoholFree : false,
      cravingIntensity: match?.cravingIntensity,
      entry: match,
    });
  }

  return cells;
}

export interface CheckInBackupEnvelope {
  schemaVersion: 2;
  exportedAt: string;
  checkins: DatedCheckIn[];
}

export async function exportDatedCheckInsBackup(
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<string> {
  const checkins = await getAllDatedCheckIns(db);
  const envelope: CheckInBackupEnvelope = {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    checkins,
  };
  return JSON.stringify(envelope, null, 2);
}

export async function restoreDatedCheckInsBackup(
  jsonText: string,
  db: IroncladCheckInsDatabase = checkinsDb
): Promise<{ restoredCount: number }> {
  const parsed = JSON.parse(jsonText);
  const list: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.checkins)
    ? parsed.checkins
    : [];

  let restoredCount = 0;
  for (const raw of list) {
    if (raw && typeof raw === 'object' && 'date' in raw) {
      const item = raw as Partial<DatedCheckIn>;
      if (isValidISODate(item.date)) {
        await saveDatedCheckIn(
          {
            date: item.date,
            alcoholFree: item.alcoholFree ?? true,
            cravingIntensity: item.cravingIntensity,
            mood: item.mood,
            sleep: item.sleep,
            trigger: item.trigger,
            whatHelped: item.whatHelped,
            privateNote: item.privateNote,
            completedTasks: item.completedTasks,
            updatedAt: item.updatedAt,
          },
          db
        );
        restoredCount++;
      }
    }
  }

  return { restoredCount };
}
