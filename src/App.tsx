import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Hammer,
  HeartHandshake,
  Moon,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { IntegrationsModal } from './components/IntegrationsModal';
import { IroncladLogo } from './components/IroncladLogo';
import { PippaIcon } from './components/PippaIcon';
import { SOSModal } from './components/SOSModal';
import {
  DEFAULT_CBT_ENTRIES,
  DEFAULT_NON_NEGOTIABLES,
  DEFAULT_SHOPPING_LIST,
  INITIAL_COMMUNITY_POSTS,
} from './data/ironcladData';
import {
  clearAllDatedCheckIns,
  DatedCheckIn,
  deleteDatedCheckIn,
  exportDatedCheckInsBackup,
  migrateLegacyCheckInsToDexie,
  restoreDatedCheckInsBackup,
  saveDatedCheckIn,
} from './db/checkinsDb';
import { ForWorkplacesModule } from './modules/ForWorkplacesModule';
import { FuelTheMindModule } from './modules/FuelTheMindModule';
import { LifelinesDirectoryModule } from './modules/LifelinesDirectoryModule';
import { MoveTheIronModule } from './modules/MoveTheIronModule';
import { TheCornermanModule } from './modules/TheCornermanModule';
import { TheForgeModule } from './modules/TheForgeModule';
import { TheLockerRoomModule } from './modules/TheLockerRoomModule';
import { ThePlaybooksModule } from './modules/ThePlaybooksModule';
import {
  requestCornermanCompanion,
  validateSourceIds,
} from './services/cornermanEngine';
import {
  DEFAULT_INTEGRATION_CONFIG,
  fireIroncladWebhook,
  loadPersisted,
  savePersisted,
  syncToSupabaseOrLocal,
} from './services/integrations';
import {
  EarnedBadgeRecord,
  loadAndMigrateMilestones,
  mergeEarnedMilestones,
  saveEarnedMilestones,
} from './services/milestones';
import {
  SearchableItem,
  searchIroncladResources,
} from './services/searchIndex';
import {
  B2BLeadSubmission,
  CBTWorksheetEntry,
  ChatMessage,
  CommitmentTrack,
  CommunityPost,
  IntegrationConfig,
  LockerChannel,
  ModuleId,
  NonNegotiableTask,
  Playbook,
  Recipe,
  SavingsGoal,
  ShoppingIngredient,
  WebhookLogItem,
} from './types/ironclad';

interface NavItem {
  id: ModuleId;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  dividerBefore?: boolean;
}

// 8 Clear Modules — separating peer recovery from B2B corporate portal
const NAV_ITEMS: NavItem[] = [
  {
    id: 'forge',
    label: 'The Forge',
    shortLabel: 'Forge',
    subtitle: 'Analytics & multi-track goals',
    icon: Hammer,
  },
  {
    id: 'cornerman',
    label: 'Pippa',
    shortLabel: 'Pippa',
    subtitle: '24/7 UK voice coach',
    icon: PippaIcon,
  },
  {
    id: 'move',
    label: 'Move the Iron',
    shortLabel: 'Move',
    subtitle: '20m shift cortisol reset',
    icon: Dumbbell,
  },
  {
    id: 'fuel',
    label: 'Fuel the Mind',
    shortLabel: 'Fuel',
    subtitle: '15-min meals & £40 shop',
    icon: Utensils,
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    shortLabel: 'Playbooks',
    subtitle: '6 guides, HALT & PDFs',
    icon: BookOpen,
  },
  {
    id: 'lifelines',
    label: 'Lifelines',
    shortLabel: 'Lifelines',
    subtitle: 'Free UK support directory',
    icon: HeartHandshake,
  },
  {
    id: 'locker',
    label: 'The Locker Room',
    shortLabel: 'Locker',
    subtitle: 'Private peer community',
    icon: Users,
  },
  {
    id: 'workplaces',
    label: 'For Workplaces (B2B)',
    shortLabel: 'Workplaces',
    subtitle: 'ROI calculator & charter',
    icon: Briefcase,
    dividerBefore: true,
  },
];

function createDefaultCommitments(initialStreak: number): CommitmentTrack[] {
  return [
    {
      id: 'alcohol',
      enabled: true,
      label: 'Alcohol-Free',
      streakDays: initialStreak,
      weeklySpendGBP: 65,
      dailyUnitsBaseline: 4,
    },
    {
      id: 'drugs',
      enabled: false,
      label: 'Days Clean',
      streakDays: 0,
      weeklySpendGBP: 50,
    },
    {
      id: 'smoking',
      enabled: false,
      label: 'Smoke / Vape-Free',
      streakDays: 0,
      weeklySpendGBP: 45,
      dailyUnitsBaseline: 15,
    },
    {
      id: 'gambling',
      enabled: false,
      label: 'Bet-Free',
      streakDays: 0,
      weeklySpendGBP: 40,
      paydayCheckInEnabled: true,
    },
    {
      id: 'custom',
      enabled: false,
      label: 'Custom Habit',
      customTitle: 'Late-night energy drinks',
      streakDays: 0,
      weeklySpendGBP: 20,
    },
  ];
}

function createInitialCornermanMessages(): ChatMessage[] {
  return [
    {
      id: 'welcome-msg',
      sender: 'cornerman',
      timestamp: 'Ready 24/7',
      text: "Alright mate, I'm Pippa—your 24/7 UK voice and recovery coach. Here for alcohol, smoking/vaping, gambling, or substance urges, quick £40-budget meals, or talking through a rough shift.\n\nTap Start Live Voice Call to speak with me hands-free, or tell me what's going on right now—how's your day looking?",
      citations: validateSourceIds([
        'playbook-1#section-0',
        'playbook-2#section-0',
      ]),
      action: 'START_CRAVING_RESET',
    },
  ];
}

export function App() {
  const prefersReducedMotion = useReducedMotion();
  const [activeModule, setActiveModule] = useState<ModuleId>('forge');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState<boolean>(false);

  // Night Shift / 3 AM Dark Mode (Auto 21:00–06:00 local time + manual override)
  const [nightShift, setNightShift] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ironclad_mindset_v1_theme_override');
      if (saved === 'night') return true;
      if (saved === 'day') return false;
    } catch {
      // Ignore
    }
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('night-shift', nightShift);
  }, [nightShift]);

  const toggleNightShift = () => {
    setNightShift((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(
          'ironclad_mindset_v1_theme_override',
          next ? 'night' : 'day'
        );
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Global Orama Quick Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [globalSearchResults, setGlobalSearchResults] = useState<
    SearchableItem[]
  >([]);
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] =
    useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults([]);
      return;
    }
    searchIroncladResources(globalSearchQuery).then((res) => {
      if (!cancelled) setGlobalSearchResults(res.slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, [globalSearchQuery]);

  // Load & migrate streak + 12 Iron Milestones once (persisted separately so setbacks preserve earned badges)
  const [initialMilestoneState] = useState(() => loadAndMigrateMilestones());
  const [streakDays, setStreakDaysState] = useState<number>(
    initialMilestoneState.streakDays
  );
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadgeRecord[]>(
    initialMilestoneState.earnedRecords
  );

  const [config, setConfig] = useState<IntegrationConfig>(() =>
    loadPersisted('integration_config', DEFAULT_INTEGRATION_CONFIG)
  );
  const [weeklySpendGBP, setWeeklySpendGBP] = useState<number>(() =>
    loadPersisted('weekly_spend_gbp', 65)
  );
  const [commitments, setCommitments] = useState<CommitmentTrack[]>(() =>
    loadPersisted(
      'commitments',
      createDefaultCommitments(initialMilestoneState.streakDays)
    )
  );
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>(() =>
    loadPersisted('savings_goal', {
      title: 'New trainers / weekend away',
      targetGBP: 180,
    })
  );
  const [tasks, setTasks] = useState<NonNegotiableTask[]>(() =>
    loadPersisted('non_negotiables', DEFAULT_NON_NEGOTIABLES)
  );

  // On-device dated check-ins powered by Dexie.js
  const [checkIns, setCheckIns] = useState<DatedCheckIn[]>([]);

  // Session-only Cornerman chat history by default
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialCornermanMessages()
  );

  const [shoppingList, setShoppingList] = useState<ShoppingIngredient[]>(() =>
    loadPersisted('shopping_list', DEFAULT_SHOPPING_LIST)
  );
  const [cbtEntries, setCbtEntries] = useState<CBTWorksheetEntry[]>(() =>
    loadPersisted('cbt_entries', DEFAULT_CBT_ENTRIES)
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() =>
    loadPersisted('community_posts', INITIAL_COMMUNITY_POSTS)
  );
  const [b2bLeads, setB2bLeads] = useState<B2BLeadSubmission[]>(() =>
    loadPersisted('b2b_leads', [])
  );
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>(() =>
    loadPersisted('webhook_logs', [])
  );

  // Deep-link states for Playbooks & Recipes
  const [highlightedRecipeId, setHighlightedRecipeId] = useState<string | null>(
    null
  );
  const [initialOpenPlaybookId, setInitialOpenPlaybookId] = useState<
    string | null
  >(null);
  const [initialOpenSectionIndex, setInitialOpenSectionIndex] = useState<
    number | null
  >(null);

  // Initialize Dexie dated check-ins & remove any legacy persisted chat history
  useEffect(() => {
    try {
      localStorage.removeItem('ironclad_mindset_v1_cornerman_messages');
    } catch {
      // Ignore
    }
    migrateLegacyCheckInsToDexie().then((rows) => {
      setCheckIns(rows);
    });
  }, []);

  // Keep earnedBadges synced whenever streakDays changes
  const updateStreakAndAwardBadges = (nextStreak: number) => {
    const safeStreak = Math.max(0, Math.floor(nextStreak));
    setStreakDaysState(safeStreak);
    savePersisted('streak_days', safeStreak);

    setEarnedBadges((prev) => {
      const merged = mergeEarnedMilestones(safeStreak, prev);
      saveEarnedMilestones(merged);
      return merged;
    });
  };

  const handleIncrementStreak = () => {
    updateStreakAndAwardBadges(streakDays + 1);
  };

  const handleResetStreakKeepBadges = () => {
    // Resets active streak to 0 while preserving all earned milestone badges
    setStreakDaysState(0);
    savePersisted('streak_days', 0);
  };

  // Dexie Check-In Handlers
  const handleSaveCheckIn = async (
    input: Omit<DatedCheckIn, 'updatedAt'>
  ) => {
    await saveDatedCheckIn(input);
    const updated = await migrateLegacyCheckInsToDexie();
    setCheckIns(updated);
  };

  const handleDeleteCheckIn = async (date: string) => {
    await deleteDatedCheckIn(date);
    const updated = await migrateLegacyCheckInsToDexie();
    setCheckIns(updated);
  };

  const handleClearAllCheckIns = async () => {
    await clearAllDatedCheckIns();
    setCheckIns([]);
  };

  const handleExportCheckIns = async () => {
    return exportDatedCheckInsBackup();
  };

  const handleRestoreCheckIns = async (jsonText: string) => {
    const res = await restoreDatedCheckInsBackup(jsonText);
    const updated = await migrateLegacyCheckInsToDexie();
    setCheckIns(updated);
    return res;
  };

  const moneySavedGBP = Math.round(
    commitments.reduce((sum, track) => {
      if (!track.enabled) return sum;
      const d = track.id === 'alcohol' ? streakDays : track.streakDays;
      const w = track.id === 'alcohol' ? weeklySpendGBP : track.weeklySpendGBP;
      return sum + (d / 7) * w;
    }, 0)
  ).toString();

  const handleSaveConfig = (next: IntegrationConfig) => {
    setConfig(next);
    savePersisted('integration_config', next);
  };

  const handleChangeWeeklySpend = (spend: number) => {
    setWeeklySpendGBP(spend);
    savePersisted('weekly_spend_gbp', spend);
  };

  const handleUpdateCommitments = (next: CommitmentTrack[]) => {
    setCommitments(next);
    savePersisted('commitments', next);
  };

  const handleUpdateSavingsGoal = (next: SavingsGoal) => {
    setSavingsGoal(next);
    savePersisted('savings_goal', next);
  };

  const handleSelectSearchResult = (item: SearchableItem) => {
    setIsGlobalSearchFocused(false);
    setGlobalSearchQuery('');
    if (item.moduleId === 'playbooks' && item.targetId) {
      setInitialOpenPlaybookId(item.targetId);
      setInitialOpenSectionIndex(0);
    } else if (item.moduleId === 'fuel' && item.targetId) {
      setHighlightedRecipeId(item.targetId);
    }
    setActiveModule(item.moduleId);
  };

  const handleToggleTask = (id: string) => {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(next);
    syncToSupabaseOrLocal('ironclad_tasks', 'non_negotiables', next, config);
  };

  const handleCompleteMoveSession = (sessionLabel: string) => {
    const hasMovementTask = tasks.some((t) => t.id === 'nn-2');
    const next = hasMovementTask
      ? tasks.map((t) =>
          t.id === 'nn-2'
            ? {
                ...t,
                completed: true,
                label: `Moved the Iron: ${sessionLabel}`,
              }
            : t
        )
      : [
          ...tasks,
          {
            id: `nn-${Date.now()}`,
            label: `Moved the Iron: ${sessionLabel}`,
            completed: true,
            category: 'movement' as const,
          },
        ];
    setTasks(next);
    syncToSupabaseOrLocal('ironclad_tasks', 'non_negotiables', next, config);
  };

  const handleAddCustomTask = (label: string) => {
    const next: NonNegotiableTask[] = [
      ...tasks,
      {
        id: `nn-${Date.now()}`,
        label,
        completed: false,
        category: 'custom',
      },
    ];
    setTasks(next);
    syncToSupabaseOrLocal('ironclad_tasks', 'non_negotiables', next, config);
  };

  // Session-only Cornerman chat handlers
  const handleAddCornermanMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleResetConversation = () => {
    setMessages(createInitialCornermanMessages());
  };

  const handleEscalateToCornerman = async (promptText: string) => {
    setActiveModule('cornerman');
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: promptText,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);

    const reply = await requestCornermanCompanion({
      messages: nextHistory.slice(-8).map((m) => ({
        role: m.sender,
        text: m.text,
      })),
      streakDays,
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
    });

    const botMsg: ChatMessage = {
      id: `msg-c-${Date.now() + 1}`,
      sender: 'cornerman',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: reply.reply,
      citations: reply.citations,
      action: reply.action,
      statusNotice: reply.statusNotice,
      isSafetyEscalation: reply.providerStatus === 'safety_escalation',
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // Shopping List handlers (supports 1x, 2x, 4x batch scaling)
  const handleToggleShopItem = (id: string) => {
    const next = shoppingList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(next);
    savePersisted('shopping_list', next);
  };

  const handleAddRecipeToShop = (recipe: Recipe, batchMultiplier = 1) => {
    const mult = Math.max(1, batchMultiplier);
    const newItems: ShoppingIngredient[] = recipe.ingredients.map(
      (ing, idx) => ({
        id: `shop-${Date.now()}-${idx}`,
        name: ing.name,
        aisle: ing.aisle,
        estimatedPriceGBP: Number((ing.estimatedPriceGBP * mult).toFixed(2)),
        quantity: mult > 1 ? `${mult}x ${ing.quantity}` : ing.quantity,
        checked: false,
        fromRecipe: mult > 1 ? `${recipe.title} (${mult}x batch)` : recipe.title,
      })
    );
    const next = [...shoppingList, ...newItems];
    setShoppingList(next);
    savePersisted('shopping_list', next);
  };

  const handleRemoveShopItem = (id: string) => {
    const next = shoppingList.filter((i) => i.id !== id);
    setShoppingList(next);
    savePersisted('shopping_list', next);
  };

  const handleResetDefaultShop = () => {
    setShoppingList(DEFAULT_SHOPPING_LIST);
    savePersisted('shopping_list', DEFAULT_SHOPPING_LIST);
  };

  // Playbook & CBT handlers
  const handleSaveCBTEntry = (entry: CBTWorksheetEntry) => {
    const next = [entry, ...cbtEntries];
    setCbtEntries(next);
    syncToSupabaseOrLocal('ironclad_cbt', 'cbt_entries', next, config);
  };

  const handleAskCornermanAboutPlaybook = (pb: Playbook) => {
    handleEscalateToCornerman(
      `Pippa, walk me through the core tactics in Playbook ${pb.number}: "${pb.title}" and how I should apply it today.`
    );
  };

  // Community & B2B handlers
  const handleCreatePost = (
    channel: Exclude<LockerChannel, 'all'>,
    author: string,
    roleBadge: string,
    content: string,
    isAnonymous = false
  ) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: isAnonymous ? 'Locker Member (Anon)' : author,
      roleBadge: isAnonymous ? 'Anonymous Member' : roleBadge,
      streakDays,
      channel,
      timestamp: 'Just now',
      content,
      ironCount: 1,
      userSentIron: true,
      isAnonymous,
      replies: [],
    };
    const next = [newPost, ...communityPosts];
    setCommunityPosts(next);
    syncToSupabaseOrLocal('ironclad_posts', 'community_posts', next, config);
  };

  const handleSendIron = (postId: string) => {
    const next = communityPosts.map((p) => {
      if (p.id !== postId) return p;
      const already = Boolean(p.userSentIron);
      return {
        ...p,
        ironCount: already ? p.ironCount - 1 : p.ironCount + 1,
        userSentIron: !already,
      };
    });
    setCommunityPosts(next);
    savePersisted('community_posts', next);
  };

  const handleAddReply = (postId: string, author: string, content: string) => {
    const next = communityPosts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replies: [
          ...p.replies,
          {
            id: `rep-${Date.now()}`,
            author,
            roleBadge: `Day ${streakDays} Member`,
            content,
            timestamp: 'Just now',
          },
        ],
      };
    });
    setCommunityPosts(next);
    savePersisted('community_posts', next);
  };

  // Webhooks
  const handleTriggerWitchingHourWebhook = async (haltState = 'Hungry') => {
    const log = await fireIroncladWebhook(
      'WITCHING_HOUR_CHECKIN',
      {
        schedule: 'Friday 16:45 UK Craving Reset Check-in',
        streakDays,
        haltVulnerability: haltState,
        moneySavedGBP,
        recommendedSwap: 'The Witching Hour Fiery Ginger & ACV Spritz (0.0%)',
      },
      config
    );
    setWebhookLogs((prev) => [log, ...prev]);
  };

  const handleTriggerDocuSealWebhook = async (companyName: string) => {
    const log = await fireIroncladWebhook(
      'DOCUSEAL_POLICY_SIGNOFF',
      {
        companyName,
        policyDocument:
          'Playbook 5: The UK Workplace Sober-Inclusive & Mental Fitness Policy',
        docuSealTemplateUrl: config.docuSealEmbedUrl,
      },
      config
    );
    setWebhookLogs((prev) => [log, ...prev]);
  };

  const handleSubmitB2BLead = async (
    leadInput: Omit<B2BLeadSubmission, 'id' | 'createdAt' | 'webhookStatus'>
  ) => {
    const log = await fireIroncladWebhook(
      'B2B_LEAD_CAPTURE',
      {
        ...leadInput,
        crmPipeline: 'Twenty CRM UK Corporate Wellness Pipeline',
        automatedAction: 'Dispatch Custom PDF Proposal + DocuSeal Charter Link',
      },
      config
    );
    setWebhookLogs((prev) => [log, ...prev]);

    const newLead: B2BLeadSubmission = {
      ...leadInput,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB'),
      webhookStatus: config.n8nWebhookUrl ? 'delivered' : 'simulated_local',
    };
    const next = [newLead, ...b2bLeads];
    setB2bLeads(next);
    syncToSupabaseOrLocal('ironclad_b2b_leads', 'b2b_leads', next, config);
  };

  return (
    <div className="min-h-screen bg-white text-[#121518] flex flex-col">
      {/* =================================================================== */}
      {/* PERSISTENT GLOBAL HEADER                                            */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-3 sm:px-6 py-3 no-print">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveModule('forge')}
            className="text-left cursor-pointer min-w-0 shrink"
          >
            <IroncladLogo />
          </button>

          {/* Global Orama Offline-First Quick Search */}
          <div className="relative hidden md:block flex-1 max-w-xs lg:max-w-sm">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#475569] absolute left-3 pointer-events-none" />
              <input
                id="global-orama-search"
                type="search"
                value={globalSearchQuery}
                onFocus={() => setIsGlobalSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsGlobalSearchFocused(false), 180)}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search playbooks, recipes, lifelines..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#121518]"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchQuery('')}
                  aria-label="Clear global search"
                  className="absolute right-2 text-[#475569] hover:text-[#121518] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isGlobalSearchFocused && globalSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto iron-scroll p-1.5 space-y-1">
                {globalSearchResults.map((res) => (
                  <button
                    key={`${res.kind}-${res.id}`}
                    type="button"
                    onMouseDown={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F8FAFC] transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#121518] truncate">
                        {res.title}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FDF2F4] text-[#7A263A] shrink-0">
                        {res.kind}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#475569] truncate">
                      {res.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Live Combined Money Protected Pill */}
            <button
              type="button"
              onClick={() => setActiveModule('forge')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] transition cursor-pointer"
              title="Open The Forge dashboard"
            >
              <Flame className="w-4 h-4 text-[#7A263A]" />
              <div className="text-left leading-tight">
                <div className="font-mono-metric text-xs font-bold text-[#121518]">
                  Day {streakDays}
                </div>
                <div className="font-mono-metric text-[10px] text-[#475569]">
                  £{moneySavedGBP} protected
                </div>
              </div>
            </button>

            {/* Night Shift / 3 AM Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleNightShift}
              aria-label={nightShift ? 'Switch to Day Mode' : 'Switch to Night Shift Dark Mode'}
              aria-pressed={nightShift}
              title={nightShift ? 'Night Shift Dark Mode active (click for Day Mode)' : 'Day Mode (click for Night Shift Dark Mode)'}
              className="iron-btn-ghost p-1.5 sm:p-2 text-xs cursor-pointer"
            >
              {nightShift ? (
                <Sun className="w-4 h-4 text-[#1BB1E7]" />
              ) : (
                <Moon className="w-4 h-4 text-[#334155]" />
              )}
            </button>

            {/* Subtle Settings Cog (Tucked-away developer & webhook config) */}
            <button
              id="open-integrations-modal-btn"
              type="button"
              onClick={() => setIsIntegrationsOpen(true)}
              aria-label="Connections and developer settings"
              title="Connections, API & webhook settings"
              className="iron-btn-ghost p-1.5 sm:p-2 text-xs cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#475569]" />
            </button>

            {/* Persistent One-Tap Craving Reset Button (Strongest Red Treatment) */}
            <button
              id="global-sos-red-btn"
              type="button"
              onClick={() => setIsSOSOpen(true)}
              className="iron-btn-urgent px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Craving Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN WORKSPACE: DESKTOP SIDEBAR + MODULE VIEWPORT                   */}
      {/* =================================================================== */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex pb-20 lg:pb-8">
        <aside
          aria-label="Primary navigation"
          className={`hidden lg:flex flex-col justify-between bg-[#F8FAFC] border-r border-[#E2E8F0] transition-all duration-150 p-3 no-print ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5">
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold text-[#475569]">
                  Navigation
                </span>
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] cursor-pointer"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeModule === item.id;
              return (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && (
                    <div
                      role="separator"
                      className="my-2 border-t border-[#E2E8F0]"
                    />
                  )}
                  <button
                    id={`nav-desktop-${item.id}`}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition border text-left cursor-pointer ${
                      active
                        ? 'bg-[#7A263A] text-white border-[#7A263A]'
                        : 'bg-transparent text-[#334155] border-transparent hover:bg-white hover:border-[#E2E8F0] hover:text-[#121518]'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        active ? 'text-white' : 'text-[#7A263A]'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <div className="overflow-hidden">
                        <div className="text-sm font-semibold truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] truncate ${
                            active ? 'text-white/85' : 'text-[#475569]'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {!sidebarCollapsed && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-[#7A263A]">
                Need immediate support?
              </div>
              <p className="text-[#475569] leading-relaxed">
                Craving Reset and free 24/7 UK lifelines are always one tap away—even offline.
              </p>
              <button
                type="button"
                onClick={() => setActiveModule('lifelines')}
                className="iron-btn-ghost w-full py-1.5 px-2.5 text-xs cursor-pointer"
              >
                Open UK Lifelines
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              {activeModule === 'forge' && (
                <TheForgeModule
                  streakDays={streakDays}
                  earnedBadges={earnedBadges}
                  onIncrementStreak={handleIncrementStreak}
                  onSetStreakDays={updateStreakAndAwardBadges}
                  onResetStreakKeepBadges={handleResetStreakKeepBadges}
                  weeklySpendGBP={weeklySpendGBP}
                  onChangeWeeklySpend={handleChangeWeeklySpend}
                  commitments={commitments}
                  onUpdateCommitments={handleUpdateCommitments}
                  savingsGoal={savingsGoal}
                  onUpdateSavingsGoal={handleUpdateSavingsGoal}
                  onOpenMoveTheIron={() => setActiveModule('move')}
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onAddCustomTask={handleAddCustomTask}
                  checkIns={checkIns}
                  onSaveCheckIn={handleSaveCheckIn}
                  onDeleteCheckIn={handleDeleteCheckIn}
                  onClearAllCheckIns={handleClearAllCheckIns}
                  onExportCheckIns={handleExportCheckIns}
                  onRestoreCheckIns={handleRestoreCheckIns}
                />
              )}

              {activeModule === 'cornerman' && (
                <TheCornermanModule
                  streakDays={streakDays}
                  config={config}
                  messages={messages}
                  onAddMessage={handleAddCornermanMessage}
                  onResetConversation={handleResetConversation}
                  onStartCravingReset={() => setIsSOSOpen(true)}
                  onOpenHaltWorksheet={() => {
                    setInitialOpenPlaybookId('playbook-4');
                    setInitialOpenSectionIndex(0);
                    setActiveModule('playbooks');
                  }}
                  onViewLifelines={() => setActiveModule('lifelines')}
                  onOpenPlaybookCitation={(playbookId, sectionIndex) => {
                    setInitialOpenPlaybookId(playbookId);
                    setInitialOpenSectionIndex(
                      typeof sectionIndex === 'number' ? sectionIndex : null
                    );
                    setActiveModule('playbooks');
                  }}
                  onOpenRecipeCitation={(recipeId) => {
                    setHighlightedRecipeId(recipeId);
                    setActiveModule('fuel');
                  }}
                />
              )}

              {activeModule === 'move' && (
                <MoveTheIronModule
                  onCompleteSession={handleCompleteMoveSession}
                />
              )}

              {activeModule === 'fuel' && (
                <FuelTheMindModule
                  shoppingList={shoppingList}
                  onToggleShopItem={handleToggleShopItem}
                  onAddRecipeToShop={handleAddRecipeToShop}
                  onRemoveShopItem={handleRemoveShopItem}
                  onResetDefaultShop={handleResetDefaultShop}
                  highlightedRecipeId={highlightedRecipeId}
                />
              )}

              {activeModule === 'playbooks' && (
                <ThePlaybooksModule
                  cbtEntries={cbtEntries}
                  onSaveCBTEntry={handleSaveCBTEntry}
                  onAskCornermanAboutPlaybook={handleAskCornermanAboutPlaybook}
                  onTriggerDocuSealWebhook={handleTriggerDocuSealWebhook}
                  initialOpenPlaybookId={initialOpenPlaybookId}
                  initialOpenSectionIndex={initialOpenSectionIndex}
                />
              )}

              {activeModule === 'lifelines' && <LifelinesDirectoryModule />}

              {activeModule === 'locker' && (
                <TheLockerRoomModule
                  streakDays={streakDays}
                  posts={communityPosts}
                  onCreatePost={handleCreatePost}
                  onSendIron={handleSendIron}
                  onAddReply={handleAddReply}
                />
              )}

              {activeModule === 'workplaces' && (
                <ForWorkplacesModule
                  b2bLeads={b2bLeads}
                  onSubmitB2BLead={handleSubmitB2BLead}
                  onTriggerDocuSealWebhook={handleTriggerDocuSealWebhook}
                  onOpenPlaybook5={() => {
                    setInitialOpenPlaybookId('playbook-5');
                    setInitialOpenSectionIndex(0);
                    setActiveModule('playbooks');
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* =================================================================== */}
      {/* STICKY MOBILE BOTTOM NAVIGATION BAR                                 */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xs border-t border-[#E2E8F0] px-2 py-1.5 flex overflow-x-auto iron-scroll gap-1 no-print"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              type="button"
              onClick={() => setActiveModule(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`min-w-[66px] flex-1 shrink-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition cursor-pointer ${
                active
                  ? 'bg-[#7A263A] text-white'
                  : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#121518]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  active ? 'text-white' : 'text-[#7A263A]'
                }`}
              />
              <span className="text-[10px] font-medium mt-0.5 truncate max-w-full">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* =================================================================== */}
      {/* GLOBAL MODALS: CRAVING RESET & CONNECTIONS                          */}
      {/* =================================================================== */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        streakDays={streakDays}
        weeklySpendGBP={weeklySpendGBP}
        onEscalateToCornerman={handleEscalateToCornerman}
        onJumpToFuel={() => setActiveModule('fuel')}
        onTriggerWitchingHourWebhook={handleTriggerWitchingHourWebhook}
      />

      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        webhookLogs={webhookLogs}
        onTestWitchingHourWebhook={() =>
          handleTriggerWitchingHourWebhook('Friday 4:45pm test')
        }
      />
    </div>
  );
}

export default App;
