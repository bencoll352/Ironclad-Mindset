import {
  Building2,
  Calculator,
  CheckCircle2,
  Copy,
  FileSignature,
  Flame,
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
  onSubmitB2BLead: (lead: Omit<B2BLeadSubmission, 'id' | 'createdAt' | 'webhookStatus'>) => void;
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

  // UK Alcohol & Burnout ROI Formula:
  // UK CIPD & Alcohol Change data estimates ~4.4 lost absenteeism + presenteeism days per employee/year in shift & high-stress sectors,
  // and Ironclad workplace intervention reduces alcohol/burnout-related lost days by ~38%.
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
      `IRONCLAD MINDSET — CORPORATE WELLNESS & SOBER-INCLUSIVE PROPOSAL`,
      `Prepared For: ${latestProposal.companyName} (${latestProposal.contactName})`,
      `Sector: ${latestProposal.sector} | Workforce Size: ${latestProposal.employeeCount} staff`,
      `Package: ${latestProposal.packageInterest}`,
      `Estimated Annual Absenteeism & Presenteeism Savings: £${latestProposal.estimatedAnnualSavingsGBP.toLocaleString()}/year`,
      `DocuSeal Sober-Inclusive Policy Charter: ${
        latestProposal.docuSealSigned ? 'Signed & Ready' : 'Pending Sign-off'
      }`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation Switcher: Tab A (The Locker Room) vs Tab B (B2B Corporate Wellness Portal) */}
      <div className="forge-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
            PEER ACCOUNTABILITY & CORPORATE WELLNESS ENGINE
          </span>
          <h1 className="font-display text-2xl font-bold text-[#F8F9FA] uppercase mt-0.5">
            THE LOCKER ROOM & B2B PORTAL
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#121518] p-1.5 rounded-xl border border-[#2E353D]">
          <button
            id="tab-locker-room-btn"
            onClick={() => setActiveTab('locker')}
            className={`py-2.5 px-4 rounded-lg font-display text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'locker'
                ? 'bg-[#7A263A] text-white shadow-md border border-[#1BB1E7]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#1BB1E7]" />
            Tab A: The Locker Room
          </button>

          <button
            id="tab-b2b-portal-btn"
            onClick={() => setActiveTab('b2b')}
            className={`py-2.5 px-4 rounded-lg font-display text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'b2b'
                ? 'bg-[#7A263A] text-white shadow-md border border-[#1BB1E7]/50'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#1BB1E7]" />
            Tab B: B2B ROI & Portal
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB A: THE LOCKER ROOM COMMUNITY WALL                             */}
      {/* ================================================================= */}
      {activeTab === 'locker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Channels + Post Composer */}
          <div className="lg:col-span-4 space-y-5">
            {/* Channel Selector */}
            <div className="forge-card rounded-2xl p-5 space-y-3">
              <div className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
                LOCKER ROOM CHANNELS
              </div>
              <div className="space-y-1.5">
                {CHANNELS.map((ch) => {
                  const active = selectedChannel === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl font-mono-metric text-xs flex items-center justify-between transition border cursor-pointer ${
                        active
                          ? 'bg-[#7A263A] text-white border-[#1BB1E7]'
                          : 'bg-[#121518] text-[#94A3B8] border-[#2E353D] hover:text-white'
                      }`}
                    >
                      <span>{ch === 'all' ? 'All Channels (Live Feed)' : ch}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/30">
                        {ch === 'all'
                          ? posts.length
                          : posts.filter((p) => p.channel === ch).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Check-in Form */}
            <form
              onSubmit={handlePostSubmit}
              className="forge-card-claret rounded-2xl p-5 space-y-3.5"
            >
              <div className="text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold">
                POST SHIFT CHECK-IN • DAY {streakDays}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  placeholder="Your Handle"
                  className="px-3 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                />
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Role & UK City"
                  className="px-3 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                />
              </div>

              <select
                value={postChannel}
                onChange={(e) =>
                  setPostChannel(
                    e.target.value as Exclude<LockerChannel, 'all'>
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs font-mono-metric text-[#1BB1E7]"
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
                placeholder="Share a shift win, how you handled a 5 PM craving, or a matchday check-in..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
              />

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1BB1E7] hover:bg-[#1BB1E7]/90 text-[#121518] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                POST TO THE LOCKER ROOM
              </button>
            </form>
          </div>

          {/* Right Column: Community Feed */}
          <div className="lg:col-span-8 space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="forge-card rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7A263A] border border-[#1BB1E7]/50 flex items-center justify-center font-display text-sm font-bold text-white">
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F8F9FA]">
                          {post.author}
                        </span>
                        <span className="text-[10px] font-mono-metric px-2 py-0.5 rounded bg-[#1BB1E7]/15 text-[#1BB1E7] border border-[#1BB1E7]/30">
                          Day {post.streakDays} Forged
                        </span>
                      </div>
                      <span className="text-xs text-[#94A3B8]">
                        {post.roleBadge} • {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono-metric px-2.5 py-1 rounded-lg bg-[#121518] border border-[#2E353D] text-[#1BB1E7]">
                    {post.channel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#F8F9FA]/95 leading-relaxed">
                  {post.content}
                </p>

                {/* Send Iron Fist-Bump Button + Reply Count */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2E353D]">
                  <button
                    onClick={() => onSendIron(post.id)}
                    className={`py-2 px-4 rounded-xl font-display text-xs uppercase tracking-wider flex items-center gap-2 transition border cursor-pointer ${
                      post.userSentIron
                        ? 'bg-[#7A263A] text-white border-[#1BB1E7] shadow-md'
                        : 'bg-[#121518] text-[#F8F9FA] border-[#2E353D] hover:border-[#1BB1E7]'
                    }`}
                  >
                    <Hammer className="w-4 h-4 text-[#1BB1E7]" />
                    SEND IRON ({post.ironCount})
                  </button>

                  <span className="text-xs font-mono-metric text-[#94A3B8] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    {post.replies.length} Peer Replies
                  </span>
                </div>

                {/* Replies + Quick Reply Input */}
                <div className="space-y-2 pt-2">
                  {post.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-[#121518] border border-[#2E353D] rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#1BB1E7]">
                          {rep.author}{' '}
                          <span className="font-normal text-[#94A3B8]">
                            ({rep.roleBadge})
                          </span>
                        </span>
                        <span className="font-mono-metric text-[#94A3B8]">
                          {rep.timestamp}
                        </span>
                      </div>
                      <p className="text-[#F8F9FA]/90">{rep.content}</p>
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
                      placeholder="Back your mate up with a reply..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(post.id)}
                      className="px-3.5 py-2 rounded-lg bg-[#1E2328] hover:bg-[#7A263A] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] transition cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB B: B2B CORPORATE WELLNESS & ROI CALCULATOR                    */}
      {/* ================================================================= */}
      {activeTab === 'b2b' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive B2B ROI Calculator */}
            <div className="lg:col-span-6 forge-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> UK SME & SHIFT WORKFORCE ROI CALCULATOR
                </span>
                <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
                  QUANTIFY THE COST OF SILENT BURNOUT & HANGOVERS
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Alcohol-related absenteeism, Monday/Saturday shift no-shows, and burnout cost UK employers £7.3bn annually. Slide your workforce numbers below.
                </p>
              </div>

              <div className="space-y-4 bg-[#121518] border border-[#2E353D] rounded-xl p-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#F8F9FA]">
                      Number of UK Employees / Shift Staff
                    </span>
                    <span className="font-mono-metric font-bold text-[#1BB1E7]">
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
                    className="iron-slider w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#F8F9FA]">
                      Average Daily Sick / Agency Cover / Burnout Cost (£)
                    </span>
                    <span className="font-mono-metric font-bold text-[#1BB1E7]">
                      £{dailyBurnoutCostGBP} / day
                    </span>
                  </div>
                  <input
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

              {/* ROI Telemetry Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#121518] border border-[#E63946]/40 rounded-xl p-3.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#94A3B8]">
                    EST. ANNUAL BURNOUT LOSS
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-[#E63946] mt-1">
                    £{annualGrossLossGBP.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    ~{annualLostDaysBaseline} lost shift days/yr
                  </div>
                </div>

                <div className="bg-[#121518] border border-emerald-500/50 rounded-xl p-3.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#94A3B8]">
                    EST. ANNUAL SAVINGS (38%)
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-emerald-400 mt-1">
                    £{estimatedAnnualSavingsGBP.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-300 mt-0.5">
                    {estimatedDaysRecovered} shift days recovered
                  </div>
                </div>

                <div className="bg-[#121518] border border-[#1BB1E7]/50 rounded-xl p-3.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#94A3B8]">
                    NET B2B ROI MULTIPLIER
                  </div>
                  <div className="font-mono-metric text-xl font-bold text-[#1BB1E7] mt-1">
                    {roiMultiplier}x ROI
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    Est. Investment: £{programInvestmentGBP.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* B2B Lead Capture + n8n / Twenty CRM / DocuSeal Trigger Form */}
            <form
              onSubmit={handleB2BFormSubmit}
              className="lg:col-span-6 forge-card-claret rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div>
                <span className="text-xs font-mono-metric uppercase text-[#1BB1E7]">
                  N8N + TWENTY CRM + DOCUSEAL AUTOMATED PIPELINE
                </span>
                <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
                  BOOK AN IRONCLAD WORKPLACE WORKSHOP OR LICENSES
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                    Company / Venue Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                    Decision Maker Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                    Work Email (For PDF Proposal Dispatch)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                    UK Industry Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) =>
                      setSector(e.target.value as B2BLeadSubmission['sector'])
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA]"
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
                <label className="text-xs font-mono-metric uppercase text-[#94A3B8] block mb-1">
                  Ironclad B2B Package
                </label>
                <select
                  value={packageInterest}
                  onChange={(e) =>
                    setPackageInterest(
                      e.target.value as B2BLeadSubmission['packageInterest']
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#121518] border border-[#2E353D] text-xs text-[#1BB1E7] font-semibold"
                >
                  <option value="Full Sober-Inclusive Charter + Workshop">
                    Full Sober-Inclusive Charter + On-Site Founder Workshop + App Licenses
                  </option>
                  <option value="Ironclad Workplace Workshop">
                    Ironclad Workplace Workshop (Half-Day Kitchen/Site Session)
                  </option>
                  <option value="Team App Licenses">
                    Team App Licenses (24/7 Cornerman + Mood-Food Hub)
                  </option>
                </select>
              </div>

              {/* DocuSeal Policy Charter Sign-Off Toggle */}
              <label
                onClick={() => setDocuSealSigned((prev) => !prev)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#121518] border border-[#1BB1E7]/40 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border ${
                    docuSealSigned
                      ? 'bg-[#1BB1E7] border-[#1BB1E7] text-[#121518]'
                      : 'border-[#94A3B8]'
                  }`}
                >
                  {docuSealSigned && (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#F8F9FA] flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    Include DocuSeal Digital Sign-Off for Playbook 5 (UK Sober-Inclusive Workplace Policy)
                  </span>
                </div>
              </label>

              <button
                id="submit-b2b-proposal-btn"
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#1BB1E7] hover:bg-[#1BB1E7]/90 text-[#121518] font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                GENERATE CUSTOM B2B PROPOSAL & FIRE N8N / TWENTY CRM WEBHOOK
              </button>
            </form>
          </div>

          {/* Instant Customized Corporate Wellness Proposal Preview */}
          {latestProposal && (
            <div className="forge-card-sky rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E353D] pb-4">
                <div>
                  <span className="text-xs font-mono-metric uppercase text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> N8N & TWENTY CRM PAYLOAD DISPATCHED • INSTANT PROPOSAL PREVIEW
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8F9FA] uppercase mt-0.5">
                    IRONCLAD CORPORATE WELLNESS PROPOSAL FOR:{' '}
                    <span className="text-[#1BB1E7]">
                      {latestProposal.companyName}
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handleCopyProposal}
                    className="py-2 px-3.5 rounded-lg bg-[#121518] hover:bg-[#1E2328] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    {copiedProposal ? 'Copied Proposal!' : 'Copy Proposal'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-3.5 rounded-lg bg-[#7A263A] hover:bg-[#9E334D] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#1BB1E7]" />
                    Print / Export PDF Proposal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 space-y-1.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#1BB1E7]">
                    1. CLIENT & SECTOR PROFILE
                  </div>
                  <div className="text-sm font-bold text-[#F8F9FA]">
                    {latestProposal.companyName}
                  </div>
                  <div className="text-[#94A3B8]">
                    Lead Contact: {latestProposal.contactName} ({latestProposal.email})
                  </div>
                  <div className="text-[#94A3B8]">
                    Sector: {latestProposal.sector} ({latestProposal.employeeCount} staff)
                  </div>
                </div>

                <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 space-y-1.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#1BB1E7]">
                    2. PROJECTED FINANCIAL IMPACT
                  </div>
                  <div className="text-lg font-mono-metric font-bold text-emerald-400">
                    £{latestProposal.estimatedAnnualSavingsGBP.toLocaleString()} / yr saved
                  </div>
                  <div className="text-[#94A3B8]">
                    Based on £{latestProposal.dailyBurnoutCostGBP}/day shift absence cost & 38% reduction in alcohol/burnout-related lost days.
                  </div>
                </div>

                <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 space-y-1.5">
                  <div className="text-[10px] font-mono-metric uppercase text-[#1BB1E7]">
                    3. DEPLOYMENT & DOCUSEAL STATUS
                  </div>
                  <div className="font-bold text-[#F8F9FA]">
                    {latestProposal.packageInterest}
                  </div>
                  <div className="text-emerald-400 font-mono-metric text-[11px]">
                    {latestProposal.docuSealSigned
                      ? '✓ Playbook 5 Sober-Inclusive Charter Attached via DocuSeal'
                      : 'Standard Workshop Deployment'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
