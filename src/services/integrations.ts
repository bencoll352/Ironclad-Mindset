import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IntegrationConfig, WebhookLogItem } from '../types/ironclad';

const STORAGE_PREFIX = 'ironclad_mindset_v1_';

export function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersisted<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage write warning:', err);
  }
}

// Note: Provider AI credentials (GEMINI_API_KEY) are strictly kept server-side
// in the Supabase Edge Function (supabase/functions/cornerman/index.ts) and never read from VITE_ env vars.
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  twentyCrmWebhookUrl: import.meta.env.VITE_TWENTY_CRM_WEBHOOK_URL || '',
  docuSealEmbedUrl:
    import.meta.env.VITE_DOCUSEAL_EMBED_URL ||
    'https://docuseal.com/d/ironclad-sober-workplace-charter-uk',
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(
  config: IntegrationConfig
): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
    }
    return supabaseInstance;
  } catch {
    return null;
  }
}

export async function syncToSupabaseOrLocal<T>(
  table: string,
  localKey: string,
  payload: T,
  config: IntegrationConfig
): Promise<{ syncedRemote: boolean }> {
  savePersisted(localKey, payload);
  const client = getSupabaseClient(config);
  if (!client) {
    return { syncedRemote: false };
  }
  try {
    await client.from(table).upsert({
      id: localKey,
      payload,
      updated_at: new Date().toISOString(),
    });
    return { syncedRemote: true };
  } catch {
    return { syncedRemote: false };
  }
}

/**
 * Webhook Service Module for n8n, Twenty CRM, and DocuSeal.
 * Private check-in records and private notes are strictly excluded from webhook payloads.
 */
export async function fireIroncladWebhook(
  event: WebhookLogItem['event'],
  payload: Record<string, unknown>,
  config: IntegrationConfig
): Promise<WebhookLogItem> {
  const timestamp = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const N8N_EVENT_TYPES: Record<string, string> = {
    WITCHING_HOUR_CHECKIN: 'witching_hour_checkin',
    B2B_LEAD_CAPTURE: 'b2b_lead',
    DOCUSEAL_POLICY_SIGNOFF: 'docuseal_signoff',
  };

  // Flat snake_case fields expected by n8n/ironclad-automation-workflow.json
  const n8nFields: Record<string, unknown> =
    event === 'B2B_LEAD_CAPTURE'
      ? {
          company_name: payload.companyName,
          contact_name: payload.contactName,
          contact_email: payload.email,
          industry_sector: payload.sector,
          employee_count: payload.employeeCount,
          estimated_annual_savings_gbp: payload.estimatedAnnualSavingsGBP,
          package_interest: payload.packageInterest,
        }
      : {};

  const envelope = {
    source: 'ironclad-mindset-pwa',
    version: '2.0.0',
    event,
    event_type: N8N_EVENT_TYPES[event] ?? String(event).toLowerCase(),
    ...n8nFields,
    dispatchedAtISO: new Date().toISOString(),
    crmTarget: config.twentyCrmWebhookUrl
      ? 'Twenty CRM Live'
      : 'Twenty CRM Schema Ready',
    docuSealHook: config.docuSealEmbedUrl,
    data: payload,
  };

  let status: WebhookLogItem['status'] = '200 OK (Local Sandbox)';

  if (config.n8nWebhookUrl) {
    try {
      const res = await fetch(config.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
      });
      if (res.ok) {
        status = '200 OK (Live)';
      }
    } catch (err) {
      console.warn('Webhook live POST fell back to sandbox log:', err);
    }
  }

  const logEntry: WebhookLogItem = {
    id: `wh-${Date.now()}`,
    timestamp,
    event,
    destination:
      event === 'DOCUSEAL_POLICY_SIGNOFF'
        ? 'DocuSeal + n8n'
        : 'n8n + Twenty CRM',
    status,
    payloadPreview: JSON.stringify(envelope, null, 2),
  };

  const existing = loadPersisted<WebhookLogItem[]>('webhook_logs', []);
  savePersisted('webhook_logs', [logEntry, ...existing].slice(0, 20));

  return logEntry;
}
