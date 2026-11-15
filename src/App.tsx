import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Flame,
  Hammer,
  HeartHandshake,
  Settings,
  ShieldAlert,
  Users,
  Utensils,
} from 'lucide-react';
import React, { useState } from 'react';
import { IntegrationsModal } from './components/IntegrationsModal';
import { IroncladLogo } from './components/IroncladLogo';
import { SOSModal } from './components/SOSModal';
import {
  DEFAULT_CBT_ENTRIES,
  DEFAULT_FORGE_LOGS,
  DEFAULT_NON_NEGOTIABLES,
  DEFAULT_SHOPPING_LIST,
  INITIAL_COMMUNITY_POSTS,
} from './data/ironcladData';
import { FuelTheMindModule } from './modules/FuelTheMindModule';
import { LifelinesDirectoryModule } from './modules/LifelinesDirectoryModule';
import { LockerRoomAndB2BModule } from './modules/LockerRoomAndB2BModule';
import { TheCornermanModule } from './modules/TheCornermanModule';
import { TheForgeModule } from './modules/TheForgeModule';
import { ThePlaybooksModule } from './modules/ThePlaybooksModule';
import {
  askIroncladCornerman,
  DEFAULT_INTEGRATION_CONFIG,
  fireIroncladWebhook,
  loadPersisted,
  savePersisted,
  syncToSupabaseOrLocal,
} from './services/integrations';
import {
  B2BLeadSubmission,
  CBTWorksheetEntry,
  ChatMessage,
  CommunityPost,
  DailyForgeLog,
  IntegrationConfig,
  LockerChannel,
  ModuleId,
  NonNegotiableTask,
  Playbook,
  Recipe,
  ShoppingIngredient,
  WebhookLogItem,
} from './types/ironclad';

interface NavItem {
  id: ModuleId;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'forge',
    label: 'The Forge',
    shortLabel: 'Forge',
    subtitle: 'Habit & Streak HQ',
    icon: Hammer,
  },
  {
    id: 'cornerman',
    label: 'The Cornerman',
    shortLabel: 'Cornerman',
    subtitle: '24/7 RAG AI Mentor',
    icon: Bot,
  },
  {
    id: 'fuel',
    label: 'Fuel The Mind',
    shortLabel: 'Fuel (£40)',
    subtitle: 'Chef Meals & Shop',
    icon: Utensils,
  },
  {
    id: 'playbooks',
    label: 'The Playbooks',
    shortLabel: 'Playbooks',
    subtitle: '5 Guides & CBT Tool',
    icon: BookOpen,
  },
  {
    id: 'lifelines',
    label: 'UK Lifelines',
    shortLabel: 'Lifelines',
    subtitle: '24/7 Support & 0.0%',
    icon: HeartHandshake,
  },
  {
    id: 'locker',
    label: 'Locker Room & B2B',
    shortLabel: 'Community',
    subtitle: 'Peers & ROI Portal',
    icon: Users,
  },
];

const INITIAL_HEATMAP = Array.from({ length: 28 }, (_, i) => i !== 4 && i !== 11);

const INITIAL_CORNERMAN_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    sender: 'cornerman',
    timestamp: 'Live 24/7',
    text: `Welcome to the Forge, mate. I'm **The Ironclad Cornerman**—built from the kitchen pass and lived recovery to walk beside you at 5 PM after a brutal shift or 3 AM when your head won't quiet down.

Tap any of the **4 Quick-Action Chips** above, drop **3 random ingredients from your fridge** into the generator on the left for an instant 12-minute dopamine skillet, or tell me straight how your head is feeling today.`,
    citations: [
      {
        id: 'playbook-1',
        type: 'Playbook',
        title: 'Playbook 1: The First 30 Days Sobriety Blueprint',
        referenceId: 'playbook-1',
      },
      {
        id: 'playbook-2',
        type: 'Playbook',
        title: 'Playbook 2: The £40 Mood-Food Supermarket Cheat Sheet',
        referenceId: 'playbook-2',
      },
    ],
  },
];

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('forge');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState<boolean>(false);

  // Persistent State Hooks (LocalStorage + Supabase Sync Ready)
  const [config, setConfig] = useState<IntegrationConfig>(() =>
    loadPersisted('integration_config', DEFAULT_INTEGRATION_CONFIG)
  );
  const [streakDays, setStreakDays] = useState<number>(() =>
    loadPersisted('streak_days', 14)
  );
  const [weeklySpendGBP, setWeeklySpendGBP] = useState<number>(() =>
    loadPersisted('weekly_spend_gbp', 65)
  );
  const [tasks, setTasks] = useState<NonNegotiableTask[]>(() =>
    loadPersisted('non_negotiables', DEFAULT_NON_NEGOTIABLES)
  );
  const [forgeLogs, setForgeLogs] = useState<DailyForgeLog[]>(() =>
    loadPersisted('forge_logs', DEFAULT_FORGE_LOGS)
  );
  const [heatmapDays, setHeatmapDays] = useState<boolean[]>(() =>
    loadPersisted('heatmap_days', INITIAL_HEATMAP)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadPersisted('cornerman_messages', INITIAL_CORNERMAN_MESSAGES)
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

  // Cross-module deep-link state
  const [highlightedRecipeId, setHighlightedRecipeId] = useState<string | null>(
    null
  );
  const [initialOpenPlaybookId, setInitialOpenPlaybookId] = useState<
    string | null
  >(null);

  const moneySavedGBP = ((streakDays / 7) * weeklySpendGBP).toFixed(0);

  // Handlers
  const handleSaveConfig = (next: IntegrationConfig) => {
    setConfig(next);
    savePersisted('integration_config', next);
  };

  const handleIncrementStreak = () => {
    const next = streakDays + 1;
    setStreakDays(next);
    syncToSupabaseOrLocal('ironclad_streaks', 'streak_days', next, config);
  };

  const handleChangeWeeklySpend = (spend: number) => {
    setWeeklySpendGBP(spend);
    savePersisted('weekly_spend_gbp', spend);
  };

  const handleToggleTask = (id: string) => {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
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

  const handleLogDailyForge = (
    mood: number,
    sleep: number,
    craving: number,
    notes: string
  ) => {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const newEntry: DailyForgeLog = {
      date: today.toISOString().slice(0, 10),
      dayLabel: dayNames[today.getDay()],
      mood,
      sleep,
      craving,
      completedTasks: tasks.filter((t) => t.completed).length,
      notes: notes || 'Logged daily Forge check-in.',
    };
    const next = [...forgeLogs, newEntry];
    setForgeLogs(next);
    syncToSupabaseOrLocal('ironclad_logs', 'forge_logs', next, config);
  };

  const handleToggleHeatmapDay = (index: number) => {
    const next = heatmapDays.map((v, i) => (i === index ? !v : v));
    setHeatmapDays(next);
    savePersisted('heatmap_days', next);
  };

  const handleAddCornermanMessage = (msg: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      savePersisted('cornerman_messages', next);
      return next;
    });
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
    handleAddCornermanMessage(userMsg);

    const reply = await askIroncladCornerman(
      promptText,
      streakDays,
      config,
      false
    );
    const botMsg: ChatMessage = {
      id: `msg-c-${Date.now() + 1}`,
      sender: 'cornerman',
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: reply.text,
      citations: reply.citations,
    };
    handleAddCornermanMessage(botMsg);
  };

  // Shopping List handlers
  const handleToggleShopItem = (id: string) => {
    const next = shoppingList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(next);
    savePersisted('shopping_list', next);
  };

  const handleAddRecipeToShop = (recipe: Recipe) => {
    const newItems: ShoppingIngredient[] = recipe.ingredients.map(
      (ing, idx) => ({
        id: `shop-${Date.now()}-${idx}`,
        name: ing.name,
        aisle: ing.aisle,
        estimatedPriceGBP: ing.estimatedPriceGBP,
        quantity: ing.quantity,
        checked: false,
        fromRecipe: recipe.title,
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
      `Cornerman, walk me through the core tactics in Playbook ${pb.number}: "${pb.title}" and how I should apply it on Day ${streakDays}.`
    );
  };

  // Community & B2B handlers
  const handleCreatePost = (
    channel: Exclude<LockerChannel, 'all'>,
    author: string,
    roleBadge: string,
    content: string
  ) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author,
      roleBadge,
      streakDays,
      channel,
      timestamp: 'Just now',
      content,
      ironCount: 1,
      userSentIron: true,
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
        schedule: 'Friday 16:45 UK Witching Hour Alert',
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
    <div className="min-h-screen bg-[#121518] text-[#F8F9FA] flex flex-col">
      {/* =================================================================== */}
      {/* PERSISTENT GLOBAL HEADER                                            */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#121518]/95 backdrop-blur-md border-b border-[#2E353D] px-3 sm:px-6 py-3 no-print">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => setActiveModule('forge')}
            className="cursor-pointer"
          >
            <IroncladLogo />
          </div>

          {/* Right Global Controls: Live Sobriety Badge + Integration Status Pill + 5 PM SOS Red Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Live Sobriety Badge */}
            <button
              onClick={() => setActiveModule('forge')}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1E2328] hover:bg-[#2E353D] border border-[#7A263A] transition cursor-pointer"
              title="View your live Sobriety & Money Saved telemetry in The Forge"
            >
              <Flame className="w-4 h-4 text-[#1BB1E7]" />
              <div className="text-left leading-tight">
                <div className="font-mono-metric text-xs font-bold text-[#F8F9FA]">
                  DAY {streakDays} FORGED
                </div>
                <div className="font-mono-metric text-[10px] text-emerald-400">
                  £{moneySavedGBP} SAVED
                </div>
              </div>
            </button>

            {/* 2. Settings / Integration Status Pill */}
            <button
              id="open-integrations-modal-btn"
              onClick={() => setIsIntegrationsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1E2328] hover:bg-[#2E353D] border border-[#2E353D] text-xs font-mono-metric text-[#94A3B8] hover:text-[#F8F9FA] transition cursor-pointer"
              title="Configure Gemini AI, Supabase, n8n Webhooks & DocuSeal"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline">
                AI • Supabase • n8n Ready
              </span>
              <Settings className="w-4 h-4 text-[#1BB1E7]" />
            </button>

            {/* 3. Persistent "5 PM SOS / CRAVING RESET" Red Button (#E63946) */}
            <motion.button
              id="global-sos-red-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsSOSOpen(true)}
              className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(230,57,70,0.5)] border border-white/25 flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>5 PM SOS</span>
              <span className="hidden lg:inline">/ CRAVING RESET</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN WORKSPACE: COLLAPSIBLE DESKTOP SIDEBAR + MODULE VIEWPORT       */}
      {/* =================================================================== */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex pb-20 lg:pb-8">
        {/* Collapsible Claret & Charcoal Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col justify-between bg-[#1E2328]/70 border-r border-[#2E353D] transition-all duration-200 p-3 no-print ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1.5">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono-metric uppercase tracking-widest text-[#94A3B8]">
                  IRONCLAD MODULES (6)
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="p-1.5 rounded-lg bg-[#121518] hover:bg-[#2E353D] text-[#94A3B8] hover:text-white cursor-pointer"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
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
                <button
                  key={item.id}
                  id={`nav-desktop-${item.id}`}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition border text-left cursor-pointer ${
                    active
                      ? 'bg-[#7A263A] text-white border-[#1BB1E7] shadow-lg'
                      : 'bg-transparent text-[#94A3B8] border-transparent hover:bg-[#121518] hover:text-[#F8F9FA]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      active ? 'text-[#1BB1E7]' : 'text-[#94A3B8]'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <div className="overflow-hidden">
                      <div className="font-display text-sm font-bold uppercase tracking-wider truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#F8F9FA]/70 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Card */}
          {!sidebarCollapsed && (
            <div className="forge-card-claret rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-mono-metric text-[10px] uppercase text-[#1BB1E7] font-bold">
                FRIDAY 4:45 PM AUTOMATION
              </div>
              <p className="text-[11px] text-[#F8F9FA]/90 leading-relaxed">
                Witching Hour Craving Check-in webhook armed via n8n & Twenty CRM.
              </p>
              <button
                onClick={() => handleTriggerWitchingHourWebhook('Hungry & Tired')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#121518] hover:bg-[#1E2328] border border-[#1BB1E7]/40 text-[11px] font-mono-metric text-[#1BB1E7] transition cursor-pointer"
              >
                Test 4:45 PM Alert Now
              </button>
            </div>
          )}
        </aside>

        {/* Active Module Viewport with Framer Motion Transitions */}
        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeModule === 'forge' && (
                <TheForgeModule
                  streakDays={streakDays}
                  onIncrementStreak={handleIncrementStreak}
                  onSetStreakDays={setStreakDays}
                  weeklySpendGBP={weeklySpendGBP}
                  onChangeWeeklySpend={handleChangeWeeklySpend}
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onAddCustomTask={handleAddCustomTask}
                  forgeLogs={forgeLogs}
                  onLogDailyForge={handleLogDailyForge}
                  heatmapDays={heatmapDays}
                  onToggleHeatmapDay={handleToggleHeatmapDay}
                />
              )}

              {activeModule === 'cornerman' && (
                <TheCornermanModule
                  streakDays={streakDays}
                  config={config}
                  messages={messages}
                  onAddMessage={handleAddCornermanMessage}
                  onOpenPlaybookCitation={(playbookId) => {
                    setInitialOpenPlaybookId(playbookId);
                    setActiveModule('playbooks');
                  }}
                  onOpenRecipeCitation={(recipeId) => {
                    setHighlightedRecipeId(recipeId);
                    setActiveModule('fuel');
                  }}
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
                />
              )}

              {activeModule === 'lifelines' && <LifelinesDirectoryModule />}

              {activeModule === 'locker' && (
                <LockerRoomAndB2BModule
                  streakDays={streakDays}
                  posts={communityPosts}
                  onCreatePost={handleCreatePost}
                  onSendIron={handleSendIron}
                  onAddReply={handleAddReply}
                  b2bLeads={b2bLeads}
                  onSubmitB2BLead={handleSubmitB2BLead}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* =================================================================== */}
      {/* STICKY MOBILE BOTTOM NAVIGATION BAR (PWA ERGONOMICS)                */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#121518]/95 backdrop-blur-md border-t border-[#2E353D] px-2 py-1.5 grid grid-cols-6 gap-1 no-print"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer ${
                active
                  ? 'bg-[#7A263A] text-white border border-[#1BB1E7]/50'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  active ? 'text-[#1BB1E7]' : 'text-[#94A3B8]'
                }`}
              />
              <span className="text-[10px] font-display uppercase tracking-wide mt-0.5 truncate max-w-full">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* =================================================================== */}
      {/* GLOBAL MODALS: 5 PM SOS CRISIS MODAL & INTEGRATIONS MODAL           */}
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
          handleTriggerWitchingHourWebhook('Friday 4:45 PM Test')
        }
      />
    </div>
  );
}

export default App;
