import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Database,
  FileSignature,
  Send,
  Settings,
  ShieldCheck,
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
        className="fixed inset-0 z-50 bg-[#121518]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="integrations-modal-title"
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="w-full max-w-2xl bg-white border border-[#CBD5E1] rounded-2xl shadow-lg overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FDF2F4] border border-[#7A263A]/20 text-[#7A263A]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="integrations-modal-title"
                  className="font-display text-lg font-bold text-[#121518]"
                >
                  Connections and server endpoints
                </h2>
                <p className="text-xs text-[#475569]">
                  On-device check-ins use Dexie IndexedDB. Optional cloud and webhook endpoints can be configured below.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#475569] hover:text-[#121518] transition cursor-pointer"
              aria-label="Close connections modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5">
            {/* Server-side AI Security Notice */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0284C7] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#121518] space-y-1">
                <div className="font-semibold">
                  Server-side AI credential protection active
                </div>
                <p className="text-[#334155]">
                  Cornerman AI runs through the server-side Supabase Edge Function (<code>/functions/v1/cornerman</code>). Browser API key entry and <code>VITE_GEMINI_API_KEY</code> have been removed so provider credentials stay strictly on the server. If a provider key was ever used in a public client environment previously, rotate it in Google AI Studio and set the new secret via <code>supabase secrets set GEMINI_API_KEY=...</code>.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1.5 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#7A263A]" /> Supabase project URL
                  </label>
                  <input
                    type="url"
                    value={draft.supabaseUrl}
                    onChange={(e) => setDraft({ ...draft, supabaseUrl: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1.5 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#7A263A]" /> Supabase anon key
                  </label>
                  <input
                    type="password"
                    value={draft.supabaseAnonKey}
                    onChange={(e) =>
                      setDraft({ ...draft, supabaseAnonKey: e.target.value })
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1.5 flex items-center gap-1.5">
                    <Webhook className="w-3.5 h-3.5 text-[#7A263A]" /> n8n webhook URL
                  </label>
                  <input
                    type="url"
                    value={draft.n8nWebhookUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, n8nWebhookUrl: e.target.value })
                    }
                    placeholder="https://n8n.yourdomain.co.uk/webhook/ironclad"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1.5 flex items-center gap-1.5">
                    <Webhook className="w-3.5 h-3.5 text-[#7A263A]" /> Twenty CRM endpoint
                  </label>
                  <input
                    type="url"
                    value={draft.twentyCrmWebhookUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, twentyCrmWebhookUrl: e.target.value })
                    }
                    placeholder="https://crm.ironcladmindset.co.uk/rest/companies"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#334155] mb-1.5 flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-[#7A263A]" /> DocuSeal charter URL
                  </label>
                  <input
                    type="url"
                    value={draft.docuSealEmbedUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, docuSealEmbedUrl: e.target.value })
                    }
                    placeholder="https://docuseal.com/d/ironclad-sober-workplace-charter-uk"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onTestWitchingHourWebhook}
                  className="iron-btn-secondary py-2 px-3.5 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#7A263A]" />
                  Test Friday 4:45pm check-in webhook
                </button>

                <button
                  type="submit"
                  className="iron-btn-primary py-2 px-5 text-xs cursor-pointer"
                >
                  Save connection settings
                </button>
              </div>

              {savedBanner && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Connection settings saved.
                </div>
              )}
            </form>

            {/* Webhook Log */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <div className="text-xs font-semibold text-[#334155] mb-2">
                Recent webhook activity ({webhookLogs.length})
              </div>
              {webhookLogs.length === 0 ? (
                <div className="text-xs text-[#475569] bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                  No webhooks dispatched in this session yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-metric font-semibold text-[#7A263A]">
                          {log.event} → {log.destination}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-mono-metric">
                          {log.timestamp} • {log.status}
                        </span>
                      </div>
                      <pre className="text-[10px] text-[#334155] bg-white p-2 rounded border border-[#E2E8F0] overflow-x-auto font-mono-metric">
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
