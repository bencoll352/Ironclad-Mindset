import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Cpu,
  Database,
  FileSignature,
  KeyRound,
  Send,
  Settings,
  Webhook,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { IntegrationConfig, WebhookLogItem } from '../types/ironclad';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IntegrationConfig;
  onSaveConfig: (next: IntegrationConfig) => void;
  webhookLogs: WebhookLogItem[];
  onTestWitchingHourWebhook: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  webhookLogs,
  onTestWitchingHourWebhook,
}) => {
  const [draft, setDraft] = useState<IntegrationConfig>(config);
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(draft);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl bg-[#121518] border border-[#2E353D] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          <div className="bg-[#1E2328] border-b border-[#2E353D] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7A263A]/30 border border-[#7A263A] text-[#1BB1E7]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold tracking-wider text-[#F8F9FA] uppercase">
                  OPEN-SOURCE STACK & WEBHOOK INTEGRATIONS
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  100% interactive out-of-the-box via LocalStorage & Embedded RAG. Paste live keys anytime to upgrade.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#2E353D] text-[#94A3B8] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Live Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="forge-card rounded-xl p-3.5 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#1BB1E7]" />
                <div>
                  <div className="text-xs font-bold text-[#F8F9FA]">Gemini AI (@google/genai)</div>
                  <div className="text-[11px] text-emerald-400">
                    {config.geminiApiKey ? 'Live Gemini 2.5 Connected' : 'Active (RAG Local Fallback)'}
                  </div>
                </div>
              </div>
              <div className="forge-card rounded-xl p-3.5 flex items-center gap-3">
                <Database className="w-5 h-5 text-[#1BB1E7]" />
                <div>
                  <div className="text-xs font-bold text-[#F8F9FA]">Supabase Realtime DB</div>
                  <div className="text-[11px] text-emerald-400">
                    {config.supabaseUrl ? 'Live Cloud Sync Active' : 'Active (LocalStorage Sync)'}
                  </div>
                </div>
              </div>
              <div className="forge-card rounded-xl p-3.5 flex items-center gap-3">
                <Webhook className="w-5 h-5 text-[#1BB1E7]" />
                <div>
                  <div className="text-xs font-bold text-[#F8F9FA]">n8n + Twenty CRM + DocuSeal</div>
                  <div className="text-[11px] text-emerald-400">
                    {config.n8nWebhookUrl ? 'Live Webhook Endpoint' : 'Active (Sandbox Inspector)'}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#1BB1E7]" /> Gemini API Key (@google/genai)
                  </label>
                  <input
                    type="password"
                    value={draft.geminiApiKey}
                    onChange={(e) => setDraft({ ...draft, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy... (Leave blank for built-in RAG Cornerman)"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <Webhook className="w-3.5 h-3.5 text-[#1BB1E7]" /> n8n Webhook URL (N8N_WEBHOOK_URL)
                  </label>
                  <input
                    type="url"
                    value={draft.n8nWebhookUrl}
                    onChange={(e) => setDraft({ ...draft, n8nWebhookUrl: e.target.value })}
                    placeholder="https://n8n.yourdomain.co.uk/webhook/ironclad"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#1BB1E7]" /> Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={draft.supabaseUrl}
                    onChange={(e) => setDraft({ ...draft, supabaseUrl: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#1BB1E7]" /> Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={draft.supabaseAnonKey}
                    onChange={(e) => setDraft({ ...draft, supabaseAnonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <Webhook className="w-3.5 h-3.5 text-[#1BB1E7]" /> Twenty CRM Lead Endpoint
                  </label>
                  <input
                    type="url"
                    value={draft.twentyCrmWebhookUrl}
                    onChange={(e) => setDraft({ ...draft, twentyCrmWebhookUrl: e.target.value })}
                    placeholder="https://crm.ironcladmindset.co.uk/rest/companies"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metric uppercase text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-[#1BB1E7]" /> DocuSeal Policy Sign-Off URL
                  </label>
                  <input
                    type="url"
                    value={draft.docuSealEmbedUrl}
                    onChange={(e) => setDraft({ ...draft, docuSealEmbedUrl: e.target.value })}
                    placeholder="https://docuseal.com/d/ironclad-sober-workplace-charter-uk"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1E2328] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onTestWitchingHourWebhook}
                  className="py-2.5 px-4 rounded-lg bg-[#1E2328] hover:bg-[#2E353D] border border-[#1BB1E7]/50 text-xs font-semibold text-[#1BB1E7] flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Fire Test Friday 4:45 PM "Witching Hour" n8n Alert
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg bg-[#7A263A] hover:bg-[#9E334D] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Save Integration Keys
                </button>
              </div>

              {savedBanner && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Integration endpoints saved & synced to persistent storage.
                </div>
              )}
            </form>

            {/* Live Webhook Delivery Log */}
            <div className="border-t border-[#2E353D] pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-metric uppercase text-[#94A3B8]">
                  RECENT N8N / TWENTY CRM / DOCUSEAL WEBHOOK DISPATCH LOG ({webhookLogs.length})
                </span>
              </div>
              {webhookLogs.length === 0 ? (
                <div className="text-xs text-[#94A3B8] bg-[#1E2328] rounded-lg p-3 border border-[#2E353D]">
                  No webhooks fired yet in this session. Click "Fire Test Friday 4:45 PM Witching Hour n8n Alert" above or submit a B2B Corporate Wellness Lead to inspect the JSON payload.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#1E2328] border border-[#2E353D] rounded-lg p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-metric font-bold text-[#1BB1E7]">
                          {log.event} → {log.destination}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono-metric">
                          {log.timestamp} • {log.status}
                        </span>
                      </div>
                      <pre className="text-[10px] text-[#94A3B8] bg-[#121518] p-2 rounded overflow-x-auto font-mono-metric">
                        {log.payloadPreview}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
