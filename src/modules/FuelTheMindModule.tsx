import {
  Brain,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Flame,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { RECIPES } from '../data/ironcladData';
import {
  Recipe,
  RecipeCategory,
  ShoppingIngredient,
} from '../types/ironclad';

interface FuelTheMindModuleProps {
  shoppingList: ShoppingIngredient[];
  onToggleShopItem: (id: string) => void;
  onAddRecipeToShop: (recipe: Recipe) => void;
  onRemoveShopItem: (id: string) => void;
  onResetDefaultShop: () => void;
  highlightedRecipeId?: string | null;
}

const CATEGORIES: RecipeCategory[] = [
  'All',
  '15-Min Shift Meals',
  'Dopamine Boosters',
  'Gut Repair',
  '5 PM Alcohol-Free Swaps',
];

const AISLES: ShoppingIngredient['aisle'][] = [
  'Protein',
  'Produce',
  'Tins & Dry',
  'Drinks',
];

export const FuelTheMindModule: React.FC<FuelTheMindModuleProps> = ({
  shoppingList,
  onToggleShopItem,
  onAddRecipeToShop,
  onRemoveShopItem,
  onResetDefaultShop,
  highlightedRecipeId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>('All');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string>(
    highlightedRecipeId || RECIPES[0].id
  );
  const [copiedShopBanner, setCopiedShopBanner] = useState<boolean>(false);
  const [addedRecipeBanner, setAddedRecipeBanner] = useState<string | null>(null);

  const filteredRecipes =
    selectedCategory === 'All'
      ? RECIPES
      : RECIPES.filter((r) => r.categories.includes(selectedCategory));

  const totalBasketGBP = shoppingList.reduce(
    (acc, item) => acc + item.estimatedPriceGBP,
    0
  );

  const handleCopyListToKeep = () => {
    const lines = [
      '=== IRONCLAD MINDSET: £40 MOOD-FOOD SUPERMARKET LIST (ALDI / TESCO) ===',
      `Estimated Weekly Total: £${totalBasketGBP.toFixed(2)}`,
      '',
    ];
    AISLES.forEach((aisle) => {
      const items = shoppingList.filter((i) => i.aisle === aisle);
      if (items.length > 0) {
        lines.push(`[${aisle.toUpperCase()}]`);
        items.forEach((item) => {
          lines.push(
            `${item.checked ? '[x]' : '[ ]'} ${item.name} (${item.quantity}) — £${item.estimatedPriceGBP.toFixed(2)}`
          );
        });
        lines.push('');
      }
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedShopBanner(true);
    setTimeout(() => setCopiedShopBanner(false), 3000);
  };

  const handleAddRecipeClick = (recipe: Recipe) => {
    onAddRecipeToShop(recipe);
    setAddedRecipeBanner(recipe.title);
    setTimeout(() => setAddedRecipeBanner(null), 2800);
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filter Pills */}
      <div className="forge-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
            <ChefHat className="w-4 h-4" /> MEALIE-STYLE GUT-BRAIN NUTRITION & £40 BUDGET HUB
          </span>
          <h1 className="font-display text-2xl font-bold text-[#F8F9FA] uppercase mt-0.5">
            FUEL THE MIND — CHEF-BUILT RECOVERY PASS
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Built from a working kitchen pass: stabilize blood glucose, replenish B-vitamins & magnesium, and rebuild dopamine on £40/week.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  active
                    ? 'bg-[#7A263A] text-white border-[#1BB1E7] shadow-md'
                    : 'bg-[#121518] text-[#94A3B8] border-[#2E353D] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {addedRecipeBanner && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Added ingredients from{' '}
          <strong>{addedRecipeBanner}</strong> to your £40 Supermarket Checklist!
        </div>
      )}

      {/* Main Grid: Recipes (Left 7 cols) + Interactive £40 Supermarket Shopping List (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recipes List */}
        <div className="lg:col-span-7 space-y-4">
          {filteredRecipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <div
                key={recipe.id}
                className={`rounded-2xl transition overflow-hidden ${
                  isExpanded ? 'forge-card-claret' : 'forge-card'
                }`}
              >
                {/* Recipe Summary Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    className="space-y-1.5 cursor-pointer flex-1"
                    onClick={() =>
                      setExpandedRecipeId(isExpanded ? '' : recipe.id)
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] font-mono-metric uppercase px-2 py-0.5 rounded bg-[#121518] text-[#1BB1E7] border border-[#1BB1E7]/30"
                        >
                          {cat}
                        </span>
                      ))}
                      <span className="text-xs font-mono-metric text-[#94A3B8] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#1BB1E7]" /> {recipe.prepTimeMins} mins
                      </span>
                      <span className="text-xs font-mono-metric font-bold text-emerald-400">
                        £{recipe.costPerServingGBP.toFixed(2)} / serving
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#F8F9FA] uppercase">
                      {recipe.title}
                    </h2>
                    <p className="text-xs text-[#94A3B8]">{recipe.subtitle}</p>
                  </div>

                  <div className="flex sm:flex-col items-stretch sm:items-end gap-2">
                    <button
                      onClick={() => handleAddRecipeClick(recipe)}
                      className="py-2 px-3.5 rounded-xl bg-[#1BB1E7] hover:bg-[#1BB1E7]/90 text-[#121518] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      Add Ingredients to Shop
                    </button>
                    <button
                      onClick={() =>
                        setExpandedRecipeId(isExpanded ? '' : recipe.id)
                      }
                      className="py-1.5 px-3 rounded-lg bg-[#121518] border border-[#2E353D] text-[11px] font-mono-metric text-[#F8F9FA] hover:border-[#1BB1E7] transition cursor-pointer"
                    >
                      {isExpanded ? 'Hide Pass Method' : 'View Full Recipe & Macros'}
                    </button>
                  </div>
                </div>

                {/* Expanded Recipe Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#2E353D] space-y-4">
                    {/* Macros Bar */}
                    <div className="grid grid-cols-4 gap-2 bg-[#121518] border border-[#2E353D] rounded-xl p-3 text-center">
                      <div>
                        <div className="text-[10px] font-mono-metric text-[#94A3B8] uppercase">
                          CALORIES
                        </div>
                        <div className="font-mono-metric text-sm font-bold text-[#F8F9FA]">
                          {recipe.macros.calories} kcal
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-metric text-[#94A3B8] uppercase">
                          PROTEIN
                        </div>
                        <div className="font-mono-metric text-sm font-bold text-[#1BB1E7]">
                          {recipe.macros.proteinG}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-metric text-[#94A3B8] uppercase">
                          COMPLEX CARBS
                        </div>
                        <div className="font-mono-metric text-sm font-bold text-[#F8F9FA]">
                          {recipe.macros.carbsG}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-metric text-[#94A3B8] uppercase">
                          GOOD FATS
                        </div>
                        <div className="font-mono-metric text-sm font-bold text-emerald-400">
                          {recipe.macros.fatsG}g
                        </div>
                      </div>
                    </div>

                    {/* Brain Benefit Callout */}
                    <div className="bg-[#121518]/90 border-l-4 border-[#1BB1E7] rounded-r-xl p-3.5 space-y-1">
                      <div className="text-xs font-mono-metric uppercase text-[#1BB1E7] font-bold flex items-center gap-1.5">
                        <Brain className="w-4 h-4" /> BRAIN & GUT BENEFIT: {recipe.brainBenefitTitle}
                      </div>
                      <p className="text-xs text-[#F8F9FA]/90 leading-relaxed">
                        {recipe.brainBenefitDetail}
                      </p>
                    </div>

                    {/* Ingredients + Method Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 bg-[#121518] border border-[#2E353D] rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-mono-metric uppercase text-[#94A3B8] font-bold">
                          INGREDIENTS (ALDI / TESCO EST.)
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          {recipe.ingredients.map((ing, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between gap-2 py-1 border-b border-[#2E353D]/50 last:border-none"
                            >
                              <span className="text-[#F8F9FA]">{ing.name}</span>
                              <span className="font-mono-metric text-emerald-400 whitespace-nowrap">
                                £{ing.estimatedPriceGBP.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-7 bg-[#121518] border border-[#2E353D] rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-mono-metric uppercase text-[#94A3B8] font-bold">
                          CHEF’S PASS METHOD
                        </div>
                        <ol className="space-y-2 text-xs text-[#F8F9FA]/95 list-decimal list-inside leading-relaxed">
                          {recipe.method.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        <div className="mt-3 pt-2 border-t border-[#2E353D] text-xs text-[#1BB1E7]">
                          <Flame className="w-3.5 h-3.5 inline mr-1" />
                          <strong>Head Chef Tip:</strong> {recipe.chefTip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive £40 Weekly Supermarket Shopping List */}
        <div className="lg:col-span-5 forge-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 h-fit sticky top-20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-metric uppercase text-[#1BB1E7] flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" /> £40 WEEKLY SUPERMARKET CHECKLIST
              </span>
              <button
                onClick={onResetDefaultShop}
                className="text-[11px] font-mono-metric text-[#94A3B8] hover:text-[#F8F9FA] flex items-center gap-1 cursor-pointer"
                title="Reset to default £40 Chef Basket"
              >
                <RotateCcw className="w-3 h-3" /> Reset £40 Basket
              </button>
            </div>

            <div className="bg-[#121518] border border-[#2E353D] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#94A3B8]">Estimated Aldi / Tesco Basket</div>
                <div className="font-mono-metric text-2xl font-bold text-emerald-400">
                  £{totalBasketGBP.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#94A3B8]">/ £40.00 target</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono-metric text-[#1BB1E7]">
                  {shoppingList.filter((i) => i.checked).length}/{shoppingList.length} in Trolley
                </div>
                <div className="w-28 h-2 bg-[#1E2328] rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${
                      totalBasketGBP <= 40 ? 'bg-[#1BB1E7]' : 'bg-[#E63946]'
                    }`}
                    style={{
                      width: `${Math.min(100, (totalBasketGBP / 40) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Categorized Supermarket Aisles */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {AISLES.map((aisle) => {
                const items = shoppingList.filter((i) => i.aisle === aisle);
                if (items.length === 0) return null;
                return (
                  <div key={aisle} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono-metric uppercase text-[#1BB1E7] px-1">
                      <span>{aisle} Aisle</span>
                      <span>
                        £
                        {items
                          .reduce((s, x) => s + x.estimatedPriceGBP, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs transition ${
                          item.checked
                            ? 'bg-[#7A263A]/20 border-[#1BB1E7]/40 text-[#94A3B8]'
                            : 'bg-[#121518] border-[#2E353D] text-[#F8F9FA]'
                        }`}
                      >
                        <label
                          onClick={() => onToggleShopItem(item.id)}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              item.checked
                                ? 'bg-[#1BB1E7] border-[#1BB1E7] text-[#121518]'
                                : 'border-[#94A3B8]'
                            }`}
                          >
                            {item.checked && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                          </div>
                          <div className="flex-1">
                            <span className={item.checked ? 'line-through' : 'font-medium'}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] block">
                              {item.quantity}
                              {item.fromRecipe ? ` • ${item.fromRecipe}` : ''}
                            </span>
                          </div>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="font-mono-metric text-emerald-400 font-semibold">
                            £{item.estimatedPriceGBP.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveShopItem(item.id)}
                            className="p-1 text-[#94A3B8] hover:text-[#E63946] transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2E353D]">
            <button
              id="copy-shopping-list-btn"
              onClick={handleCopyListToKeep}
              className="w-full py-3 px-4 rounded-xl bg-[#7A263A] hover:bg-[#9E334D] text-white font-display text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#1BB1E7]" />
              {copiedShopBanner
                ? 'COPIED TO CLIPBOARD FOR GOOGLE KEEP / NOTES!'
                : 'COPY LIST TO GOOGLE KEEP / NOTES'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
