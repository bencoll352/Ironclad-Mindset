import {
  Building2,
  Calculator,
  CheckCircle2,
  Copy,
  Download,
  FileSignature,
  Printer,
  Send,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { B2BLeadSubmission } from '../types/ironclad';

interface ForWorkplacesModuleProps {
  b2bLeads: B2BLeadSubmission[];
  onSubmitB2BLead: (
    lead: Omit<B2BLeadSubmission, 'id' | 'createdAt' | 'webhookStatus'>
  ) => void;
  onTriggerDocuSealWebhook: (companyName: string) => void;
  onOpenPlaybook5: () => void;
}

export const ForWorkplacesModule: React.FC<ForWorkplacesModuleProps> = ({
  b2bLeads,
  onSubmitB2BLead,
  onTriggerDocuSealWebhook,
  onOpenPlaybook5,
}) => {
  const [employeeCount, setEmployeeCount] = useState<number>(45);
  const [dailyBurnoutCostGBP, setDailyBurnoutCostGBP] = useState<number>(185);
  const [companyName, setCompanyName] = useState<string>(
    'Thameside Hospitality Group Ltd'
  );
  const [contactName, setContactName] = useState<string>('Marcus Bowen');
  const [email, setEmail] = useState<string>('m.bowen@thamesidegroup.co.uk');
  const [sector, setSector] = useState<B2BLeadSubmission['sector']>(
    'Hospitality & Kitchens'
  );
  const [packageInterest, setPackageInterest] = useState<
    B2BLeadSubmission['packageInterest']
  >('Full Sober-Inclusive Charter + Workshop');
  const [docuSealSigned, setDocuSealSigned] = useState<boolean>(true);
  const [latestProposal, setLatestProposal] =
    useState<B2BLeadSubmission | null>(b2bLeads[0] || null);
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [charterNotice, setCharterNotice] = useState<boolean>(false);

  // Expanded UK workplace impact across alcohol, burnout, smoking breaks & gambling stress
  const annualLostDaysBaseline = Math.round(employeeCount * 5.2);
  const annualGrossLossGBP = annualLostDaysBaseline * dailyBurnoutCostGBP;
  const estimatedAnnualSavingsGBP = Math.round(annualGrossLossGBP * 0.4);
  const estimatedDaysRecovered = Math.round(annualLostDaysBaseline * 0.4);

  const reducedSickDaysGBP = Math.round(estimatedAnnualSavingsGBP * 0.42);
  const recoveredProductivityGBP = Math.round(estimatedAnnualSavingsGBP * 0.36);
  const staffRetentionGBP = Math.max(
    0,
    estimatedAnnualSavingsGBP - reducedSickDaysGBP - recoveredProductivityGBP
  );

  const programInvestmentGBP =
    packageInterest === 'Ironclad Workplace Workshop'
      ? 1450
      : packageInterest === 'Team App Licenses'
        ? employeeCount * 48
        : 1450 + employeeCount * 36;
  const roiMultiplier = (
    estimatedAnnualSavingsGBP / Math.max(1, programInvestmentGBP)
  ).toFixed(1);

  const chartData = [
    {
      name: 'Reduced Sick Days',
      savings: reducedSickDaysGBP,
      fill: '#7A263A',
    },
    {
      name: 'Recovered Productivity',
      savings: recoveredProductivityGBP,
      fill: '#0284C7',
    },
    {
      name: 'Staff Retention',
      savings: staffRetentionGBP,
      fill: '#1BB1E7',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      companyName: companyName.trim() || 'UK Partner Organisation',
      contactName: contactName.trim() || 'Leadership Contact',
      email: email.trim() || 'leadership@company.co.uk',
      sector,
      employeeCount,
      dailyBurnoutCostGBP,
      estimatedAnnualSavingsGBP,
      packageInterest,
      docuSealSigned,
    };
    onSubmitB2BLead(payload);
    setLatestProposal({
      ...payload,
      id: `preview-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB'),
      webhookStatus: 'simulated_local',
    });
  };

  const handleDownloadProposalPdf = async () => {
    setDownloadingPdf(true);
    try {
      const { downloadB2bProposalPdf } = await import(
        '../services/pdfGenerator'
      );
      await downloadB2bProposalPdf({
        companyName: companyName.trim() || 'UK Partner Organisation',
        contactName: contactName.trim() || 'Leadership Contact',
        sector,
        employeeCount,
        dailyBurnoutCostGBP,
        packageInterest,
        programInvestmentGBP,
        estimatedAnnualSavingsGBP,
        estimatedDaysRecovered,
        reducedSickDaysGBP,
        recoveredProductivityGBP,
        staffRetentionGBP,
        roiMultiplier,
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyProposal = () => {
    const summary = `IRONCLAD MINDSET — UK CORPORATE RESILIENCE PROPOSAL
Prepared for: ${companyName} (${contactName}, ${sector})
Team Size: ${employeeCount} employees
Estimated Annual Savings: £${estimatedAnnualSavingsGBP.toLocaleString('en-GB')} (${roiMultiplier}x ROI)
- Reduced Sick Days: £${reducedSickDaysGBP.toLocaleString('en-GB')}
- Recovered Productivity: £${recoveredProductivityGBP.toLocaleString('en-GB')}
- Staff Retention: £${staffRetentionGBP.toLocaleString('en-GB')}
Programme: ${packageInterest} (£${programInvestmentGBP.toLocaleString('en-GB')})`;
    navigator.clipboard.writeText(summary);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Commercial UK Workplace Portal
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            For Workplaces (B2B)
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Model UK absenteeism &amp; productivity ROI across alcohol, burnout, smoking breaks, and gambling financial stress—then generate a branded proposal PDF.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenPlaybook5}
            className="iron-btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSignature className="w-3.5 h-3.5 text-[#7A263A]" />
            Read Playbook 5 Charter
          </button>
          <button
            id="download-b2b-proposal-pdf-btn"
            type="button"
            onClick={() => void handleDownloadProposalPdf()}
            disabled={downloadingPdf}
            className="iron-btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingPdf
              ? 'Generating Proposal PDF…'
              : 'Download Personalised Proposal PDF'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ROI Calculator + Recharts Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          <section className="iron-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display text-lg font-bold text-[#121518] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#7A263A]" /> UK Workplace ROI Calculator
              </h2>
              <span className="font-mono-metric text-xs font-semibold text-[#0284C7]">
                {roiMultiplier}x projected ROI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#334155]">Team size</span>
                  <span className="font-mono-metric font-bold text-[#121518]">
                    {employeeCount} staff
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full iron-slider"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#334155]">
                    Daily shift absence / burnout cost
                  </span>
                  <span className="font-mono-metric font-bold text-[#121518]">
                    £{dailyBurnoutCostGBP}/day
                  </span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={450}
                  step={5}
                  value={dailyBurnoutCostGBP}
                  onChange={(e) => setDailyBurnoutCostGBP(Number(e.target.value))}
                  className="w-full iron-slider"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="iron-surface p-4">
                <div className="text-[11px] text-[#475569]">Annual savings</div>
                <div className="font-mono-metric text-2xl font-bold text-[#7A263A] mt-0.5">
                  £{estimatedAnnualSavingsGBP.toLocaleString('en-GB')}
                </div>
              </div>
              <div className="iron-surface p-4">
                <div className="text-[11px] text-[#475569]">Days recovered</div>
                <div className="font-mono-metric text-2xl font-bold text-[#0284C7] mt-0.5">
                  {estimatedDaysRecovered} days/yr
                </div>
              </div>
              <div className="iron-surface p-4">
                <div className="text-[11px] text-[#475569]">
                  Programme investment
                </div>
                <div className="font-mono-metric text-2xl font-bold text-[#121518] mt-0.5">
                  £{programInvestmentGBP.toLocaleString('en-GB')}
                </div>
              </div>
            </div>

            {/* Recharts Savings Breakdown Chart */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-semibold text-[#121518]">
                Estimated Annual Savings Breakdown (£ GBP)
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 6, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `£${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [
                        `£${Number(val).toLocaleString('en-GB')}`,
                        'Annual Savings',
                      ]}
                    />
                    <Bar dataKey="savings" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Sober-Inclusive Charter Sign-off Card */}
          <section className="iron-surface p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#7A263A]">
                Playbook 5: Sober-Inclusive Workplace Charter
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Commit to equal 0.0% options at socials and stigma-free early support signposting.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onTriggerDocuSealWebhook(companyName);
                  setCharterNotice(true);
                  setTimeout(() => setCharterNotice(false), 3500);
                }}
                className="iron-btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileSignature className="w-3.5 h-3.5 text-[#7A263A]" />
                Trigger DocuSeal Charter
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="iron-btn-ghost py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
            {charterNotice && (
              <div className="w-full text-xs text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> DocuSeal charter event logged for {companyName}.
              </div>
            )}
          </section>
        </div>

        {/* Right: Lead Capture & Webhook Dispatch */}
        <div className="lg:col-span-5 space-y-5">
          <section className="iron-card p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#121518]">
              Generate Custom Corporate Pack
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#334155] mb-1">
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">
                    Contact name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">
                    Industry sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) =>
                      setSector(e.target.value as B2BLeadSubmission['sector'])
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  >
                    <option>Hospitality &amp; Kitchens</option>
                    <option>Construction &amp; Trades</option>
                    <option>Logistics &amp; Shift Work</option>
                    <option>Corporate &amp; Tech SME</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#334155] mb-1">
                    Package
                  </label>
                  <select
                    value={packageInterest}
                    onChange={(e) =>
                      setPackageInterest(
                        e.target.value as B2BLeadSubmission['packageInterest']
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  >
                    <option>Full Sober-Inclusive Charter + Workshop</option>
                    <option>Ironclad Workplace Workshop</option>
                    <option>Team App Licenses</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#334155] cursor-pointer">
                <input
                  type="checkbox"
                  checked={docuSealSigned}
                  onChange={(e) => setDocuSealSigned(e.target.checked)}
                  className="rounded border-[#CBD5E1]"
                />
                Include DocuSeal Sober-Inclusive Charter sign-off link
              </label>

              <button
                type="submit"
                className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Save Proposal &amp; Dispatch n8n / CRM Webhook
              </button>
            </form>

            {latestProposal && (
              <div className="iron-surface p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#7A263A]">
                    Proposal Ready: {latestProposal.companyName}
                  </span>
                  <span className="font-mono-metric text-[11px] text-emerald-700">
                    {latestProposal.webhookStatus === 'delivered'
                      ? 'Delivered'
                      : 'Local Ready'}
                  </span>
                </div>
                <p className="text-xs text-[#334155]">
                  {latestProposal.employeeCount} staff · Projected savings{' '}
                  <strong>
                    £{latestProposal.estimatedAnnualSavingsGBP.toLocaleString('en-GB')}/yr
                  </strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDownloadProposalPdf()}
                    className="iron-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7A263A]" />
                    Proposal PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyProposal}
                    className="iron-btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedProposal ? 'Copied' : 'Copy summary'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
