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
import { LifelineCategory } from '../types/ironclad';

type CategoryFilter = 'All' | LifelineCategory;

const DIRECTORY_CATEGORIES: CategoryFilter[] = [
  'All',
  '24/7 Crisis',
  'Alcohol',
  'Drugs',
  'Gambling',
  'Smoking',
  'Industry & Trades',
  'Family',
  'Matchday 0.0%',
];

const STADIUM_AND_PUB_SWAPS = [
  {
    name: 'Guinness 0.0% Draught / Can',
    type: 'Nitrogen stout (0.0% ABV)',
    whereToFind:
      'London Stadium, Emirates, Spurs, plus 3,500+ UK pubs & supermarkets',
    chefVerdict:
      'Same ruby-black pour, creamy head, and roasted barley character as standard Guinness, with only 75 kcal a pint.',
  },
  {
    name: 'Lucky Saint 0.5% Unfiltered Lager',
    type: 'Bavarian pilsner style',
    whereToFind:
      'On draught in 1,000+ UK pubs (Mitchells & Butlers, Greene King, Young’s)',
    chefVerdict:
      'Crisp biscuit malt body and citrus hop finish—a proper draught pint for a 3pm kick-off.',
  },
  {
    name: 'Mash Gang “Chug” & “Stoop”',
    type: 'UK craft hazy pale ale (0.5% ABV)',
    whereToFind:
      'Independent craft bars, Club Soda Covent Garden, Waitrose & online',
    chefVerdict:
      'Bright Citra and Mosaic hop aroma that satisfies craft beer fans immediately.',
  },
  {
    name: 'Premier League & UK stadium concourses',
    type: 'Matchday tactic',
    whereToFind:
      'London Stadium, Villa Park, Emirates, Portman Road & fan zones',
    chefVerdict:
      'Ask bar staff for Guinness 0.0 or Heineken 0.0 poured into a standard stadium cup—zero fuss in the stands.',
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
      item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" /> Free UK crisis, addiction, trade &amp; family directory
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            Lifelines &amp; UK Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            One-tap free UK helplines for alcohol, drugs, gambling, smoking, trades, family support, and matchday 0.0% swaps.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <label htmlFor="lifelines-search-input" className="sr-only">
            Filter lifelines
          </label>
          <input
            id="lifelines-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter (e.g., Frank, GamCare, chefs, NHS)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#121518]"
          />
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Directory categories">
        {DIRECTORY_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={active}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                active
                  ? 'bg-[#7A263A] text-white border-[#7A263A]'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
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
          const isCrisis = item.category === '24/7 Crisis';
          return (
            <article
              key={item.id}
              className="iron-card p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                      isCrisis
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                        : 'bg-[#F8FAFC] text-[#7A263A] border border-[#CBD5E1]'
                    }`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-xs text-[#475569] truncate">
                    {item.hours}
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-[#121518]">
                  {item.name}
                </h2>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {(item.textNumber || item.whatsapp) && (
                  <div className="px-3 py-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-medium text-[#0284C7] flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.textNumber || item.whatsapp}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="iron-btn-primary flex-1 py-2.5 px-3 text-xs flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call {item.phone}
                    </a>
                  )}
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="iron-btn-ghost py-2.5 px-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sober Matchday & UK 0.0% Finder */}
      <section className="iron-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
              <Beer className="w-4 h-4" /> UK stadium concourses &amp; pub tap finder
            </span>
            <h2 className="font-display text-xl font-bold text-[#121518] mt-0.5">
              Sober matchday &amp; top UK 0.0% swaps
            </h2>
          </div>
          <span className="text-xs font-medium text-[#334155]">
            Clear-headed Sunday mornings • Full matchday atmosphere
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STADIUM_AND_PUB_SWAPS.map((swap, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-[#7A263A] block">
                  {swap.type}
                </span>
                <h3 className="font-display text-base font-bold text-[#121518]">
                  {swap.name}
                </h3>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {swap.chefVerdict}
                </p>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#121518]">
                <strong className="text-[#7A263A]">Where to find: </strong>
                {swap.whereToFind}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#121518]">
          <ShieldAlert className="w-5 h-5 text-[#E63946] flex-shrink-0" />
          <span>
            <strong className="text-[#B91C1C]">UK medical safety notice:</strong> Never stop heavy daily alcohol or substance use suddenly without medical advice — contact{' '}
            <a href="tel:111" className="text-[#0284C7] font-bold underline">
              NHS 111
            </a>
            , your GP, or{' '}
            <a href="tel:999" className="text-[#B91C1C] font-bold underline">
              999
            </a>{' '}
            in an emergency.
          </span>
        </div>
      </section>
    </div>
  );
};
