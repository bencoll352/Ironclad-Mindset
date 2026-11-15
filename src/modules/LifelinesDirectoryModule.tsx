import {
  Beer,
  ExternalLink,
  HeartHandshake,
  MessageSquare,
  PhoneCall,
  Search,
  ShieldAlert,
} from 'lucide-react';
import React, { useState } from 'react';
import { LIFELINES_DIRECTORY } from '../data/ironcladData';
import { LifelineItem } from '../types/ironclad';

type CategoryFilter = 'All' | LifelineItem['category'];

const DIRECTORY_CATEGORIES: CategoryFilter[] = [
  'All',
  '24/7 UK Crisis & Emotional Support',
  'Industry-Specific Charities',
  'Sobriety & Recovery Communities',
  'Sober Matchday & 0.0% Finder',
];

const STADIUM_AND_PUB_SWAPS = [
  {
    name: 'Guinness 0.0% Draught / Can',
    type: 'Nitrogen Stout (0.0% ABV)',
    whereToFind: 'London Stadium, Emirates, Spurs, plus 3,500+ UK pubs & supermarkets',
    chefVerdict:
      'Same ruby-black pour, creamy head, and roasted barley bite as regular Guinness. Zero sugar spike, only 75 kcal a pint.',
  },
  {
    name: 'Lucky Saint 0.5% Unfiltered Lager',
    type: 'Bavarian Pilsner Style',
    whereToFind: 'On draught in 1,000+ UK pubs (Mitchells & Butlers, Greene King, Young’s)',
    chefVerdict:
      'Proper biscuit malt body and citrus hop finish—never feels like you’re drinking fizzy water during the 3 PM kick-off.',
  },
  {
    name: 'Mash Gang “Chug” & “Stoop”',
    type: 'UK Craft Hazy Pale Ale (0.5% ABV)',
    whereToFind: 'Independent craft bars, Club Soda Covent Garden, Waitrose & online',
    chefVerdict:
      'Built by dry-january brewers—huge Citra/Mosaic hop aroma that satisfies craft beer cravings immediately.',
  },
  {
    name: 'London Stadium & Premier League Concourses',
    type: 'UK Sober Matchday Guide',
    whereToFind: 'Billy Bonds / Bobby Moore Lower Concourses & Premier League Fan Zones',
    chefVerdict:
      'Ask bar staff straight away for Guinness 0.0 or Heineken 0.0 cans poured into a plastic stadium pint cup—nobody on the row knows or cares what’s in your cup.',
  },
];

export const LifelinesDirectoryModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLifelines = LIFELINES_DIRECTORY.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="forge-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" /> CURATED UK CRISIS, TRADE & RECOVERY DIRECTORY
          </span>
          <h1 className="font-display text-2xl font-bold text-[#F8F9FA] uppercase mt-0.5">
            LIFELINES & UK SOBER MATCHDAY HUB
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Asking for backup isn’t weakness—it’s how you stay in the fight. One-tap free UK helplines, hospitality & construction charities, and matchday 0.0% guides.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter lifelines (e.g., chefs, trades, CBT)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121518] border border-[#2E353D] text-xs text-[#F8F9FA] focus:border-[#1BB1E7] outline-none"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {DIRECTORY_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                active
                  ? 'bg-[#7A263A] text-white border-[#1BB1E7] shadow-md'
                  : 'bg-[#1E2328] text-[#94A3B8] border-[#2E353D] hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLifelines.map((item) => {
          const isCrisis =
            item.category === '24/7 UK Crisis & Emotional Support';
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 flex flex-col justify-between space-y-4 ${
                isCrisis ? 'forge-card-claret' : 'forge-card'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono-metric font-bold uppercase px-2.5 py-1 rounded ${
                      isCrisis
                        ? 'bg-[#E63946] text-white'
                        : 'bg-[#121518] text-[#1BB1E7] border border-[#1BB1E7]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-mono-metric text-[#94A3B8] truncate">
                    {item.hours}
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-[#F8F9FA] uppercase">
                  {item.name}
                </h2>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {item.textNumber && (
                  <div className="px-3 py-2 rounded-lg bg-[#121518] border border-[#1BB1E7]/40 text-xs font-mono-metric text-[#1BB1E7] flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {item.textNumber}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#1BB1E7]" />
                      Dial {item.phone}
                    </a>
                  )}
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-[#121518] hover:bg-[#1E2328] border border-[#2E353D] text-xs font-semibold text-[#F8F9FA] flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#1BB1E7]" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sober Matchday & UK 0.0% Finder Spotlight */}
      <div className="forge-card-sky rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
              <Beer className="w-4 h-4" /> UK STADIUM CONCOURSES & PUB TAP FINDER
            </span>
            <h2 className="font-display text-xl font-bold text-[#F8F9FA] uppercase mt-0.5">
              SOBER MATCHDAY & TOP UK 0.0% SWAPS
            </h2>
          </div>
          <span className="text-xs font-mono-metric text-emerald-400">
            Zero Hangover • Full Matchday Atmosphere
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STADIUM_AND_PUB_SWAPS.map((swap, idx) => (
            <div
              key={idx}
              className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-metric uppercase text-[#1BB1E7] block">
                  {swap.type}
                </span>
                <h3 className="font-display text-base font-bold text-[#F8F9FA] uppercase">
                  {swap.name}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {swap.chefVerdict}
                </p>
              </div>
              <div className="pt-2 border-t border-[#2E353D] text-[11px] text-[#F8F9FA]">
                <strong className="text-[#1BB1E7]">Where to Find: </strong>
                {swap.whereToFind}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#121518]/90 border border-[#E63946]/40 rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#94A3B8]">
          <ShieldAlert className="w-5 h-5 text-[#E63946] flex-shrink-0" />
          <span>
            <strong className="text-[#F8F9FA]">Medical Safety Notice:</strong> If you are in immediate physical danger or experiencing severe alcohol withdrawal symptoms (delirium tremens, seizures, chest pain), dial{' '}
            <a href="tel:999" className="text-[#E63946] font-bold underline">
              999
            </a>{' '}
            or{' '}
            <a href="tel:111" className="text-[#1BB1E7] font-bold underline">
              NHS 111
            </a>{' '}
            immediately.
          </span>
        </div>
      </div>
    </div>
  );
};
