/**
 * Offline-First Instant Typo-Tolerant Search via @orama/orama
 * Indexes Playbooks, Recipes, Move the Iron exercises, and UK Lifelines.
 */
import { create, insertMultiple, search } from '@orama/orama';
import { LIFELINES_DIRECTORY, PLAYBOOKS, RECIPES } from '../data/ironcladData';
import { ModuleId } from '../types/ironclad';

export interface SearchableItem {
  id: string;
  kind: 'Playbook' | 'Recipe' | 'Exercise' | 'Lifeline';
  title: string;
  subtitle: string;
  body: string;
  moduleId: ModuleId;
  targetId?: string;
}

const MOVE_THE_IRON_ITEMS: SearchableItem[] = [
  {
    id: 'move-bodyweight',
    kind: 'Exercise',
    title: '20-Min Bodyweight Forge (No Gym)',
    subtitle: '40s work / 20s rest post-shift cortisol reset',
    body: 'Press-ups, bodyweight squats, plank holds, reverse lunges, shadow boxing, mountain climbers after kitchen or site shifts.',
    moduleId: 'move',
  },
  {
    id: 'move-walk',
    kind: 'Exercise',
    title: '15-Min Brisk Walk Head-Clearer',
    subtitle: 'Mindset reflection prompts for shift decompression',
    body: 'Drop the shift at the door, brisk outdoor walk, clear head, evening craving reset.',
    moduleId: 'move',
  },
  {
    id: 'move-mobility',
    kind: 'Exercise',
    title: '8-Min Post-Shift Kitchen & Trade Mobility',
    subtitle: 'Lower back, calves, neck, and shoulders decompression',
    body: 'Gentle stretching after standing 10 hours on concrete or kitchen tiles.',
    moduleId: 'move',
  },
];

let dbPromise: ReturnType<typeof buildIndex> | null = null;

async function buildIndex() {
  const db = create({
    schema: {
      id: 'string',
      kind: 'string',
      title: 'string',
      subtitle: 'string',
      body: 'string',
      moduleId: 'string',
      targetId: 'string',
    },
  });

  const docs: SearchableItem[] = [
    ...PLAYBOOKS.map((pb) => ({
      id: pb.id,
      kind: 'Playbook' as const,
      title: pb.title,
      subtitle: pb.subtitle,
      body: `${pb.summary} ${pb.keyTakeaways.join(' ')} ${pb.sections
        .map((s) => `${s.heading} ${s.body.join(' ')}`)
        .join(' ')}`,
      moduleId: 'playbooks' as ModuleId,
      targetId: pb.id,
    })),
    ...RECIPES.map((rec) => ({
      id: rec.id,
      kind: 'Recipe' as const,
      title: rec.title,
      subtitle: rec.subtitle,
      body: `${rec.brainBenefitTitle} ${rec.brainBenefitDetail} ${rec.ingredients
        .map((i) => i.name)
        .join(' ')}`,
      moduleId: 'fuel' as ModuleId,
      targetId: rec.id,
    })),
    ...MOVE_THE_IRON_ITEMS,
    ...LIFELINES_DIRECTORY.map((life) => ({
      id: life.id,
      kind: 'Lifeline' as const,
      title: life.name,
      subtitle: `${life.category} · ${life.badge}`,
      body: `${life.description} ${life.phone || ''} ${life.textNumber || ''}`,
      moduleId: 'lifelines' as ModuleId,
      targetId: life.id,
    })),
  ];

  await insertMultiple(
    db,
    docs.map((d) => ({
      ...d,
      targetId: d.targetId || '',
    }))
  );

  return db;
}

export async function searchIroncladResources(
  query: string,
  kindFilter?: SearchableItem['kind']
): Promise<SearchableItem[]> {
  const q = query.trim();
  if (!q) return [];
  if (!dbPromise) {
    dbPromise = buildIndex();
  }
  const db = await dbPromise;
  const results = await search(db, {
    term: q,
    tolerance: 1,
    limit: 16,
    ...(kindFilter ? { where: { kind: kindFilter } } : {}),
  });

  return results.hits.map((hit) => hit.document as unknown as SearchableItem);
}
