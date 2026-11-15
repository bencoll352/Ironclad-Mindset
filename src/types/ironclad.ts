export type ModuleId =
  | 'forge'
  | 'cornerman'
  | 'fuel'
  | 'playbooks'
  | 'lifelines'
  | 'locker';

export interface NonNegotiableTask {
  id: string;
  label: string;
  completed: boolean;
  category: 'nutrition' | 'movement' | 'sobriety' | 'custom';
}

export interface DailyForgeLog {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g., 'Mon', 'Tue'
  mood: number; // 1-10
  sleep: number; // 1-10
  craving: number; // 1-10
  completedTasks: number;
  notes?: string;
}

export interface MilestoneBadge {
  id: string;
  daysRequired: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export type RecipeCategory =
  | 'All'
  | '15-Min Shift Meals'
  | 'Dopamine Boosters'
  | 'Gut Repair'
  | '5 PM Alcohol-Free Swaps';

export interface ShoppingIngredient {
  id: string;
  name: string;
  aisle: 'Produce' | 'Protein' | 'Tins & Dry' | 'Drinks';
  estimatedPriceGBP: number;
  quantity: string;
  checked: boolean;
  fromRecipe?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTimeMins: number;
  costPerServingGBP: number;
  categories: RecipeCategory[];
  macros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
  };
  brainBenefitTitle: string;
  brainBenefitDetail: string;
  chefTip: string;
  ingredients: {
    name: string;
    quantity: string;
    aisle: 'Produce' | 'Protein' | 'Tins & Dry' | 'Drinks';
    estimatedPriceGBP: number;
  }[];
  method: string[];
}

export interface PlaybookSection {
  heading: string;
  badge?: string;
  body: string[];
  actionPoints?: string[];
}

export interface Playbook {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  readTime: string;
  category: 'Sobriety' | 'Nutrition' | 'Social & Pub' | 'CBT & Mindset' | 'B2B Policy';
  summary: string;
  keyTakeaways: string[];
  sections: PlaybookSection[];
  isInteractiveCBT?: boolean;
  isB2BPolicy?: boolean;
}

export interface CBTWorksheetEntry {
  id: string;
  createdAt: string;
  haltStates: ('Hungry' | 'Angry' | 'Lonely' | 'Tired')[];
  triggerSituation: string;
  cravingRating: number;
  automaticThought: string;
  cognitiveDistortion: string;
  ironcladReframe: string;
  actionTaken: string;
}

export interface LifelineItem {
  id: string;
  name: string;
  category:
    | '24/7 UK Crisis & Emotional Support'
    | 'Industry-Specific Charities'
    | 'Sobriety & Recovery Communities'
    | 'Sober Matchday & 0.0% Finder';
  phone?: string;
  textNumber?: string;
  website: string;
  hours: string;
  description: string;
  badge: string;
}

export type LockerChannel =
  | 'all'
  | '#day-1-starters'
  | '#kitchen-and-shift-workers'
  | '#matchday-sober'
  | '#business-owners';

export interface CommunityPost {
  id: string;
  author: string;
  roleBadge: string;
  streakDays: number;
  channel: Exclude<LockerChannel, 'all'>;
  timestamp: string;
  content: string;
  ironCount: number;
  userSentIron?: boolean;
  replies: {
    id: string;
    author: string;
    roleBadge: string;
    content: string;
    timestamp: string;
  }[];
}

export interface CornermanCitation {
  id: string;
  type: 'Playbook' | 'Recipe' | 'Protocol';
  title: string;
  referenceId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cornerman';
  timestamp: string;
  text: string;
  citations?: CornermanCitation[];
  isGeneratedRecipe?: boolean;
}

export interface B2BLeadSubmission {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  sector: 'Hospitality & Kitchens' | 'Construction & Trades' | 'Logistics & Shift Work' | 'Corporate & Tech SME';
  employeeCount: number;
  dailyBurnoutCostGBP: number;
  estimatedAnnualSavingsGBP: number;
  packageInterest: 'Ironclad Workplace Workshop' | 'Team App Licenses' | 'Full Sober-Inclusive Charter + Workshop';
  docuSealSigned: boolean;
  createdAt: string;
  webhookStatus: 'delivered' | 'simulated_local';
}

export interface IntegrationConfig {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  n8nWebhookUrl: string;
  twentyCrmWebhookUrl: string;
  docuSealEmbedUrl: string;
}

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  event: 'WITCHING_HOUR_CHECKIN' | 'B2B_LEAD_CAPTURE' | 'DOCUSEAL_POLICY_SIGNOFF' | 'SOS_CRISIS_TRIGGER';
  destination: 'n8n + Twenty CRM' | 'DocuSeal + n8n';
  status: '200 OK (Live)' | '200 OK (Local Sandbox)';
  payloadPreview: string;
}
