import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  Flag,
  Hammer,
  MessageSquare,
  PhoneCall,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CommunityPost, LockerChannel } from '../types/ironclad';

interface TheLockerRoomModuleProps {
  streakDays: number;
  posts: CommunityPost[];
  onCreatePost: (
    channel: Exclude<LockerChannel, 'all'>,
    author: string,
    roleBadge: string,
    content: string,
    isAnonymous?: boolean
  ) => void;
  onSendIron: (postId: string) => void;
  onAddReply: (postId: string, author: string, content: string) => void;
}

const CHANNELS: LockerChannel[] = [
  'all',
  '#day-1-starters',
  '#kitchen-and-shift-workers',
  '#matchday-sober',
  '#drugs-smoking-gambling',
  '#business-owners',
];

type FlagReason =
  | 'Crisis / self-harm concern'
  | 'Medical advice'
  | 'Abusive / spam';

export const TheLockerRoomModule: React.FC<TheLockerRoomModuleProps> = ({
  streakDays,
  posts,
  onCreatePost,
  onSendIron,
  onAddReply,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<LockerChannel>('all');
  const [postChannel, setPostChannel] = useState<Exclude<LockerChannel, 'all'>>(
    '#kitchen-and-shift-workers'
  );
  const [authorHandle, setAuthorHandle] = useState<string>('Ironclad_Chef');
  const [authorRole, setAuthorRole] = useState<string>('Head Chef • London');
  const [postAnonymous, setPostAnonymous] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [rulesExpanded, setRulesExpanded] = useState<boolean>(false);

  // Moderation / Flag state
  const [hiddenPostIds, setHiddenPostIds] = useState<Record<string, FlagReason>>({});
  const [hiddenReplyIds, setHiddenReplyIds] = useState<Record<string, FlagReason>>({});
  const [flagTarget, setFlagTarget] = useState<{
    type: 'post' | 'reply';
    id: string;
  } | null>(null);
  const [crisisFlagNotice, setCrisisFlagNotice] = useState<boolean>(false);

  const anonymousAlias = useMemo(() => {
    const suffix = ((streakDays * 17 + 42) % 90) + 10;
    return `Forge_Member_${suffix}`;
  }, [streakDays]);

  const visiblePosts = posts
    .filter((p) => !hiddenPostIds[p.id])
    .filter((p) => selectedChannel === 'all' || p.channel === selectedChannel);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    const handle = postAnonymous
      ? anonymousAlias
      : authorHandle.trim() || 'Ironclad_Member';
    const role = postAnonymous
      ? 'Anonymous Member'
      : authorRole.trim() || 'Community Member';
    onCreatePost(postChannel, handle, role, postContent.trim(), postAnonymous);
    setPostContent('');
  };

  const handleReplySubmit = (postId: string) => {
    const text = replyDrafts[postId];
    if (!text || !text.trim()) return;
    const handle = postAnonymous
      ? anonymousAlias
      : authorHandle.trim() || 'Ironclad_Member';
    onAddReply(postId, handle, text.trim());
    setReplyDrafts({ ...replyDrafts, [postId]: '' });
  };

  const handleConfirmFlag = (reason: FlagReason) => {
    if (!flagTarget) return;
    if (flagTarget.type === 'post') {
      setHiddenPostIds((prev) => ({ ...prev, [flagTarget.id]: reason }));
    } else {
      setHiddenReplyIds((prev) => ({ ...prev, [flagTarget.id]: reason }));
    }
    if (reason === 'Crisis / self-harm concern') {
      setCrisisFlagNotice(true);
    }
    setFlagTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Private member peer community
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            The Locker Room
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Honest, judgment-free peer check-ins across alcohol, drugs, smoking/vaping, gambling, and shift life.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRulesExpanded((prev) => !prev)}
          aria-expanded={rulesExpanded}
          className="iron-btn-secondary py-2 px-3.5 text-xs flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-[#7A263A]" />
          Locker Room Ground Rules
          {rulesExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </section>

      {/* Safety Control 1: Collapsible Locker Room Ground Rules Banner */}
      {rulesExpanded && (
        <section className="iron-surface p-5 space-y-3 border border-[#CBD5E1]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#121518] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7A263A]" /> Locker Room Ground Rules
            </h2>
            <a
              href="tel:111"
              className="iron-btn-ghost py-1 px-2.5 text-xs flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3 text-[#E63946]" /> NHS 111 / 999
            </a>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#334155]">
            <li className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <strong>1. Zero judgement:</strong> Day 1 starters and Day 400 veterans get equal respect.
            </li>
            <li className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <strong>2. No medical detox advice:</strong> Never tell someone to stop heavy daily alcohol or substance use cold turkey—signpost to NHS 111, GP, or 999.
            </li>
            <li className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <strong>3. Protect anonymity:</strong> What is shared in The Locker Room stays in The Locker Room. Use anonymous posting anytime.
            </li>
            <li className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <strong>4. Flag concerns fast:</strong> Use the Flag button on any post if someone needs urgent support or breaks ground rules.
            </li>
          </ul>
        </section>
      )}

      {crisisFlagNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#121518] flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#E63946] flex-shrink-0" />
            <span>
              Post hidden &amp; flagged for crisis concern. If you or someone else is in distress: Samaritans{' '}
              <a href="tel:116123" className="font-bold underline text-[#7A263A]">
                116 123
              </a>{' '}
              · Text SHOUT to <strong>85258</strong> · Urgent medical:{' '}
              <a href="tel:111" className="font-bold underline text-[#0284C7]">
                NHS 111
              </a>{' '}
              or <a href="tel:999" className="font-bold underline text-[#B91C1C]">999</a>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCrisisFlagNotice(false)}
            className="iron-btn-ghost py-1 px-2.5 text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Flag / Report Quick Reason Modal */}
      {flagTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report post or reply"
          className="iron-card p-4 border-2 border-[#E63946] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B91C1C] flex items-center gap-1.5">
              <Flag className="w-4 h-4" /> Flag &amp; hide this {flagTarget.type}
            </span>
            <button
              type="button"
              onClick={() => setFlagTarget(null)}
              className="p-1 rounded hover:bg-[#F1F5F9] cursor-pointer"
              aria-label="Cancel report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                'Crisis / self-harm concern',
                'Medical advice',
                'Abusive / spam',
              ] as FlagReason[]
            ).map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => handleConfirmFlag(reason)}
                className="iron-btn-secondary py-1.5 px-3 text-xs cursor-pointer"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Channel Selector & Post Composer */}
        <div className="lg:col-span-4 space-y-5">
          <section className="iron-surface p-5 space-y-3">
            <div className="text-xs font-semibold text-[#121518]">Channels</div>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const active = selectedChannel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      active
                        ? 'bg-[#7A263A] text-white border-[#7A263A]'
                        : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {ch === 'all' ? 'All Locker Room Channels' : ch}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="iron-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-[#7A263A]">
                Share an update or ask for backup
              </div>
              <span className="font-mono-metric text-[11px] text-[#475569]">
                Day {streakDays}
              </span>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              {/* Safety Control 2: Anonymous Alias Toggle */}
              <button
                id="locker-anonymous-toggle"
                type="button"
                aria-pressed={postAnonymous}
                onClick={() => setPostAnonymous((p) => !p)}
                className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                  postAnonymous
                    ? 'iron-surface-selected text-[#0284C7]'
                    : 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  Post anonymously ({anonymousAlias})
                </span>
                <span>{postAnonymous ? 'ON' : 'OFF'}</span>
              </button>

              {!postAnonymous && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="locker-handle" className="sr-only">
                      Handle
                    </label>
                    <input
                      id="locker-handle"
                      type="text"
                      value={authorHandle}
                      onChange={(e) => setAuthorHandle(e.target.value)}
                      placeholder="Handle"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                    />
                  </div>
                  <div>
                    <label htmlFor="locker-role" className="sr-only">
                      Role &amp; City
                    </label>
                    <input
                      id="locker-role"
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="Role • City"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="locker-channel-select" className="sr-only">
                  Channel
                </label>
                <select
                  id="locker-channel-select"
                  value={postChannel}
                  onChange={(e) =>
                    setPostChannel(
                      e.target.value as Exclude<LockerChannel, 'all'>
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                >
                  {CHANNELS.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                id="locker-post-input"
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share a win, check in after a tough shift, or ask how peers handle payday urges..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
              />

              <button
                type="submit"
                className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Post to Locker Room
              </button>
            </form>
          </section>
        </div>

        {/* Right: Feed */}
        <div className="lg:col-span-8 space-y-4">
          {visiblePosts.map((post) => (
            <article key={post.id} className="iron-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#121518]">
                      {post.author}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
                      {post.roleBadge}
                    </span>
                    <span className="font-mono-metric text-[11px] font-semibold text-[#7A263A]">
                      Day {post.streakDays}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    {post.channel} • {post.timestamp}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSendIron(post.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition ${
                      post.userSentIron
                        ? 'bg-[#7A263A] text-white border-[#7A263A]'
                        : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    Send Iron ({post.ironCount})
                  </button>

                  {/* Safety Control 3: Flag / Report */}
                  <button
                    type="button"
                    onClick={() => setFlagTarget({ type: 'post', id: post.id })}
                    className="iron-btn-ghost p-1.5 text-[#475569] hover:text-[#B91C1C] cursor-pointer"
                    aria-label={`Flag post by ${post.author}`}
                    title="Flag / Report post"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#121518] leading-relaxed">
                {post.content}
              </p>

              {/* Replies */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2.5">
                {post.replies
                  .filter((rep) => !hiddenReplyIds[rep.id])
                  .map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#7A263A]">
                            {rep.author}
                          </span>
                          <span className="text-[11px] text-[#475569]">
                            {rep.roleBadge} • {rep.timestamp}
                          </span>
                        </div>
                        <p className="text-[#334155]">{rep.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFlagTarget({ type: 'reply', id: rep.id })
                        }
                        className="p-1 text-[#475569] hover:text-[#B91C1C] cursor-pointer flex-shrink-0"
                        aria-label={`Flag reply by ${rep.author}`}
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                <div className="flex items-center gap-2 pt-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#475569] flex-shrink-0" />
                  <input
                    type="text"
                    value={replyDrafts[post.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts({ ...replyDrafts, [post.id]: e.target.value })
                    }
                    placeholder="Write a supportive reply..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#121518]"
                  />
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(post.id)}
                    className="iron-btn-ghost py-1.5 px-3 text-xs cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
