import {
  Building2,
  Calculator,
  CheckCircle2,
  Copy,
  FileSignature,
  Hammer,
  MessageSquare,
  Printer,
  Send,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  B2BLeadSubmission,
  CommunityPost,
  LockerChannel,
} from '../types/ironclad';

interface LockerRoomAndB2BModuleProps {
  streakDays: number;
  posts: CommunityPost[];
  onCreatePost: (
    channel: Exclude<LockerChannel, 'all'>,
    author: string,
    roleBadge: string,
    content: string
  ) => void;
  onSendIron: (postId: string) => void;
  onAddReply: (postId: string, author: string, content: string) => void;
  b2bLeads: B2BLeadSubmission[];
  onSubmitB2BLead: (
    lead: Omit<B2BLeadSubmission, 'id' | 'createdAt' | 'webhookStatus'>
  ) => void;
}

const CHANNELS: LockerChannel[] = [
  'all',
  '#day-1-starters',
  '#kitchen-and-shift-workers',
  '#matchday-sober',
  '#business-owners',
];

export const LockerRoomAndB2BModule: React.FC<LockerRoomAndB2BModuleProps> = ({
  streakDays,
  posts,
  onCreatePost,
  onSendIron,
  onAddReply,
  b2bLeads,
  onSubmitB2BLead,
}) => {
  const [activeTab, setActiveTab] = useState<'locker' | 'b2b'>('locker');

  // Tab A: Locker Room state
  const [selectedChannel, setSelectedChannel] = useState<LockerChannel>('all');
  const [postChannel, setPostChannel] = useState<Exclude<LockerChannel, 'all'>>(
    '#kitchen-and-shift-workers'
  );
  const [authorHandle, setAuthorHandle] = useState<string>('Ironclad_Gaffer');
  const [authorRole, setAuthorRole] = useState<string>('Head Chef • London');
  const [postContent, setPostContent] = useState<string>('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Tab B: B2B ROI Calculator & Lead Capture state
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

  const annualLostDaysBaseline = Math.round(employeeCount * 4.4);
  const annualGrossLossGBP = annualLostDaysBaseline * dailyBurnoutCostGBP;
  const estimatedAnnualSavingsGBP = Math.round(annualGrossLossGBP * 0.38);
  const estimatedDaysRecovered = Math.round(annualLostDaysBaseline * 0.38);
  const programInvestmentGBP =
    packageInterest === 'Ironclad Workplace Workshop'
      ? 1450
      : packageInterest === 'Team App Licenses'
      ? employeeCount * 48
      : 1450 + employeeCount * 36;
  const roiMultiplier = (
    estimatedAnnualSavingsGBP / Math.max(1, programInvestmentGBP)
  ).toFixed(1);

  const filteredPosts =
    selectedChannel === 'all'
      ? posts
      : posts.filter((p) => p.channel === selectedChannel);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    onCreatePost(
      postChannel,
      authorHandle.trim() || 'Ironclad_Member',
      authorRole.trim() || 'Community Member',
      postContent.trim()
    );
    setPostContent('');
  };

  const handleReplySubmit = (postId: string) => {
    const text = replyDrafts[postId];
    if (!text || !text.trim()) return;
    onAddReply(postId, authorHandle.trim() || 'Ironclad_Member', text.trim());
    setReplyDrafts({ ...replyDrafts, [postId]: '' });
  };

  const handleB2BFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) return;

    const payload = {
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
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
      id: `b2b-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB'),
      webhookStatus: 'delivered',
    });
  };

  const handleCopyProposal = () => {
    if (!latestProposal) return;
    const text = [
      `Ironclad Mindset — Corporate Wellness & Sober-Inclusive Proposal`,
      `Prepared for: ${latestProposal.companyName} (${latestProposal.contactName})`,
      `Sector: ${latestProposal.sector} | Workforce size: ${latestProposal.employeeCount} staff`,
      `Package: ${latestProposal.packageInterest}`,
      `Estimated annual savings: £${latestProposal.estimatedAnnualSavingsGBP.toLocaleString()}/year`,
      `DocuSeal charter: ${
        latestProposal.docuSealSigned ? 'Signed & Ready' : 'Pending Sign-off'
      }`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation Switcher */}
      <section className="iron-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A]">
            Peer community & workplace tools
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            The Locker Room & B2B Portal
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0]">
          <button
            id="tab-locker-room-btn"
            type="button"
            onClick={() => setActiveTab('locker')}
            className={`py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'locker'
                ? 'bg-[#7A263A] text-white'
                : 'text-[#334155] hover:text-[#121518]'
            }`}
          >
            <Users className="w-4 h-4" />
            Locker Room
          </button>

          <button
            id="tab-b2b-portal-btn"
            type="button"
            onClick={() => setActiveTab('b2b')}
            className={`py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'b2b'
                ? 'bg-[#7A263A] text-white'
                : 'text-[#334155] hover:text-[#121518]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Workplace ROI & B2B
          </button>
        </div>
      </section>

      {/* Tab A: The Locker Room Community Wall */}
      {activeTab === 'locker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-5">
            <div className="iron-card p-5 space-y-3">
              <div className="text-xs font-semibold text-[#121518]">
                Community channels
              </div>
              <div className="space-y-1.5">
                {CHANNELS.map((ch) => {
                  const active = selectedChannel === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChannel(ch)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition border cursor-pointer ${
                        active
                          ? 'bg-[#7A263A] text-white border-[#7A263A]'
                          : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span>{ch === 'all' ? 'All channels' : ch}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-mono-metric ${
                          active ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#334155]'
                        }`}
                      >
                        {ch === 'all'
                          ? posts.length
                          : posts.filter((p) => p.channel === ch).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handlePostSubmit}
              className="iron-surface p-5 space-y-3.5"
            >
              <div className="text-xs font-semibold text-[#7A263A]">
                Share a shift check-in • Day {streakDays}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  placeholder="Your handle"
                  className="px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Role & UK city"
                  className="px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                />
              </div>

              <select
                value={postChannel}
                onChange={(e) =>
                  setPostChannel(
                    e.target.value as Exclude<LockerChannel, 'all'>
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
              >
                <option value="#day-1-starters">#day-1-starters</option>
                <option value="#kitchen-and-shift-workers">
                  #kitchen-and-shift-workers
                </option>
                <option value="#matchday-sober">#matchday-sober</option>
                <option value="#business-owners">#business-owners</option>
              </select>

              <textarea
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share a shift win, how you handled a 5pm craving, or a matchday check-in..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#121518]"
              />

              <button
                type="submit"
                className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Post to Locker Room
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="iron-card p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7A263A] flex items-center justify-center font-display text-sm font-bold text-white">
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#121518]">
                          {post.author}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FDF2F4] text-[#7A263A]">
                          Day {post.streakDays}
                        </span>
                      </div>
                      <span className="text-xs text-[#475569]">
                        {post.roleBadge} • {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono-metric px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0284C7]">
                    {post.channel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => onSendIron(post.id)}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition border cursor-pointer ${
                      post.userSentIron
                        ? 'bg-[#7A263A] text-white border-[#7A263A]'
                        : 'bg-white text-[#121518] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    Send Iron ({post.ironCount})
                  </button>

                  <span className="text-xs text-[#475569] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#7A263A]" />
                    {post.replies.length} replies
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {post.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#121518]">
                          {rep.author}{' '}
                          <span className="font-normal text-[#475569]">
                            ({rep.roleBadge})
                          </span>
                        </span>
                        <span className="text-[#475569]">{rep.timestamp}</span>
                      </div>
                      <p className="text-[#334155]">{rep.content}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={replyDrafts[post.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts({
                          ...replyDrafts,
                          [post.id]: e.target.value,
                        })
                      }
                      placeholder="Write a supportive reply..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(post.id)}
                      className="iron-btn-secondary px-3.5 py-2 text-xs cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Tab B: B2B Corporate Wellness & ROI Calculator */}
      {activeTab === 'b2b' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-6 iron-card p-5 sm:p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> UK SME & shift workforce ROI calculator
                </span>
                <h2 className="font-display text-xl font-bold text-[#121518] mt-0.5">
                  Estimate workplace burnout & absence savings
                </h2>
                <p className="text-xs text-[#475569] mt-1">
                  Adjust your team size and daily absence cost below. Personal on-device check-ins from individual users are never shared with workplace reports.
                </p>
              </div>

              <div className="space-y-4 iron-surface p-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <label
                      htmlFor="b2b-employee-slider"
                      className="font-semibold text-[#121518]"
                    >
                      Number of employees / shift staff
                    </label>
                    <span className="font-mono-metric font-bold text-[#7A263A]">
                      {employeeCount} staff
                    </span>
                  </div>
                  <input
                    id="b2b-employee-slider"
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="iron-slider w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <label
                      htmlFor="b2b-cost-slider"
                      className="font-semibold text-[#121518]"
                    >
                      Average daily absence / cover cost (£)
                    </label>
                    <span className="font-mono-metric font-bold text-[#7A263A]">
                      £{dailyBurnoutCostGBP} / day
                    </span>
                  </div>
                  <input
                    id="b2b-cost-slider"
                    type="range"
                    min={80}
                    max={450}
                    step={5}
                    value={dailyBurnoutCostGBP}
                    onChange={(e) =>
                      setDailyBurnoutCostGBP(Number(e.target.value))
                    }
                    className="iron-slider w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="iron-surface p-3.5">
                  <div className="text-[11px] text-[#475569]">
                    Est. annual burnout cost
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-[#121518] mt-1">
                    £{annualGrossLossGBP.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    ~{annualLostDaysBaseline} lost shift days/yr
                  </div>
                </div>

                <div className="bg-[#FDF2F4] border border-[#7A263A]/30 rounded-xl p-3.5">
                  <div className="text-[11px] font-semibold text-[#7A263A]">
                    Est. annual savings (38%)
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-[#7A263A] mt-1">
                    £{estimatedAnnualSavingsGBP.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#334155] mt-0.5">
                    {estimatedDaysRecovered} shift days recovered
                  </div>
                </div>

                <div className="iron-surface-selected p-3.5">
                  <div className="text-[11px] font-semibold text-[#0284C7]">
                    Estimated ROI multiplier
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-[#121518] mt-1">
                    {roiMultiplier}x ROI
                  </div>
                  <div className="text-[11px] text-[#334155] mt-0.5">
                    Investment: £{programInvestmentGBP.toLocaleString()}
                  </div>
                </div>
              </div>
            </section>

            <form
              onSubmit={handleB2BFormSubmit}
              className="lg:col-span-6 iron-card p-5 sm:p-6 space-y-4"
            >
              <div>
                <span className="text-xs font-semibold text-[#7A263A]">
                  Workplace workshops & team licences
                </span>
                <h2 className="font-display text-xl font-bold text-[#121518] mt-0.5">
                  Generate a custom workplace proposal
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#334155] block mb-1">
                    Company or venue name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#334155] block mb-1">
                    Contact name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#334155] block mb-1">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#334155] block mb-1">
                    UK industry sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) =>
                      setSector(e.target.value as B2BLeadSubmission['sector'])
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  >
                    <option value="Hospitality & Kitchens">
                      Hospitality & Kitchens
                    </option>
                    <option value="Construction & Trades">
                      Construction & Trades
                    </option>
                    <option value="Logistics & Shift Work">
                      Logistics & Shift Work
                    </option>
                    <option value="Corporate & Tech SME">
                      Corporate & Tech SME
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#334155] block mb-1">
                  Workplace package
                </label>
                <select
                  value={packageInterest}
                  onChange={(e) =>
                    setPackageInterest(
                      e.target.value as B2BLeadSubmission['packageInterest']
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518] font-medium"
                >
                  <option value="Full Sober-Inclusive Charter + Workshop">
                    Full Sober-Inclusive Charter + On-Site Workshop + Team Licences
                  </option>
                  <option value="Ironclad Workplace Workshop">
                    Ironclad Workplace Workshop (Half-day kitchen or site session)
                  </option>
                  <option value="Team App Licenses">
                    Team App Licences
                  </option>
                </select>
              </div>

              <label
                onClick={() => setDocuSealSigned((prev) => !prev)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    docuSealSigned
                      ? 'bg-[#7A263A] border-[#7A263A] text-white'
                      : 'border-[#94A3B8] bg-white'
                  }`}
                >
                  {docuSealSigned && (
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  )}
                </div>
                <span className="text-xs font-medium text-[#121518] flex items-center gap-1.5">
                  <FileSignature className="w-3.5 h-3.5 text-[#7A263A]" />
                  Include DocuSeal sign-off for Playbook 5 (Sober-Inclusive Workplace Policy)
                </span>
              </label>

              <button
                id="submit-b2b-proposal-btn"
                type="submit"
                className="iron-btn-primary w-full py-3 px-5 text-xs sm:text-sm cursor-pointer"
              >
                Generate workplace proposal & dispatch webhook
              </button>
            </form>
          </div>

          {latestProposal && (
            <section className="iron-card p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Proposal generated & webhook logged
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#121518] mt-0.5">
                    Workplace proposal for {latestProposal.companyName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={handleCopyProposal}
                    className="iron-btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7A263A]" />
                    {copiedProposal ? 'Copied' : 'Copy proposal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="iron-btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="iron-surface p-4 space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#7A263A]">
                    1. Client profile
                  </div>
                  <div className="text-sm font-bold text-[#121518]">
                    {latestProposal.companyName}
                  </div>
                  <div className="text-[#334155]">
                    Contact: {latestProposal.contactName} ({latestProposal.email})
                  </div>
                  <div className="text-[#475569]">
                    Sector: {latestProposal.sector} ({latestProposal.employeeCount} staff)
                  </div>
                </div>

                <div className="iron-surface p-4 space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#7A263A]">
                    2. Projected annual savings
                  </div>
                  <div className="text-lg font-mono-metric font-bold text-[#7A263A]">
                    £{latestProposal.estimatedAnnualSavingsGBP.toLocaleString()} / year
                  </div>
                  <div className="text-[#334155]">
                    Based on £{latestProposal.dailyBurnoutCostGBP}/day shift absence cost.
                  </div>
                </div>

                <div className="iron-surface p-4 space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#7A263A]">
                    3. Package & charter status
                  </div>
                  <div className="font-bold text-[#121518]">
                    {latestProposal.packageInterest}
                  </div>
                  <div className="text-emerald-700 font-medium text-[11px]">
                    {latestProposal.docuSealSigned
                      ? '✓ Playbook 5 Sober-Inclusive Charter attached via DocuSeal'
                      : 'Standard workshop deployment'}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
