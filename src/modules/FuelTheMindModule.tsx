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
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (highlightedRecipeId) {
      setExpandedRecipeId(highlightedRecipeId);
    }
  }, [highlightedRecipeId]);

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
      'Ironclad Mindset: £40 weekly supermarket list (Aldi / Tesco)',
      `Estimated weekly total: £${totalBasketGBP.toFixed(2)}`,
      '',
    ];
    AISLES.forEach((aisle) => {
      const items = shoppingList.filter((i) => i.aisle === aisle);
      if (items.length > 0) {
        lines.push(`[${aisle}]`);
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
      {/* Header & Category Filters */}
      <section className="iron-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
            <ChefHat className="w-4 h-4" /> Practical nutrition & £40 weekly budget
          </span>
          <h1 className="font-display text-2xl font-bold text-[#121518] mt-0.5">
            Fuel the Mind
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Chef-built 15-minute shift meals and alcohol-free 5pm swaps designed to steady energy on £40 a week.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Recipe categories">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition border cursor-pointer ${
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
      </section>

      {addedRecipeBanner && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Added ingredients from{' '}
          <strong>{addedRecipeBanner}</strong> to your £40 supermarket checklist.
        </div>
      )}

      {/* Main Grid: Recipes + Shopping List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {filteredRecipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <article
                key={recipe.id}
                id={recipe.id}
                className="iron-card overflow-hidden transition"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    className="space-y-1.5 cursor-pointer flex-1"
                    onClick={() =>
                      setExpandedRecipeId(isExpanded ? '' : recipe.id)
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                      <span className="font-mono-metric text-[#121518] font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7A263A]" /> {recipe.prepTimeMins} mins
                      </span>
                      <span>•</span>
                      <span className="font-mono-metric font-semibold text-[#7A263A]">
                        £{recipe.costPerServingGBP.toFixed(2)} per serving
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#121518]">
                      {recipe.title}
                    </h2>
                    <p className="text-xs text-[#475569]">{recipe.subtitle}</p>
                  </div>

                  <div className="flex sm:flex-col items-stretch sm:items-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddRecipeClick(recipe)}
                      className="iron-btn-primary py-2 px-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add ingredients to shop
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRecipeId(isExpanded ? '' : recipe.id)
                      }
                      className="iron-btn-secondary py-1.5 px-3 text-xs cursor-pointer"
                    >
                      {isExpanded ? 'Hide method' : 'View recipe & macros'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#E2E8F0] space-y-4 bg-[#F8FAFC]">
                    <div className="grid grid-cols-4 gap-2 bg-white border border-[#E2E8F0] rounded-xl p-3 text-center">
                      <div>
                        <div className="text-[11px] text-[#475569]">Calories</div>
                        <div className="font-mono-metric text-sm font-bold text-[#121518]">
                          {recipe.macros.calories} kcal
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#475569]">Protein</div>
                        <div className="font-mono-metric text-sm font-bold text-[#7A263A]">
                          {recipe.macros.proteinG}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#475569]">Carbs</div>
                        <div className="font-mono-metric text-sm font-bold text-[#121518]">
                          {recipe.macros.carbsG}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#475569]">Fats</div>
                        <div className="font-mono-metric text-sm font-bold text-[#121518]">
                          {recipe.macros.fatsG}g
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-l-4 border-[#7A263A] rounded-r-xl p-3.5 border border-[#E2E8F0] space-y-1">
                      <div className="text-xs font-semibold text-[#7A263A] flex items-center gap-1.5">
                        <Brain className="w-4 h-4" /> Why it helps: {recipe.brainBenefitTitle}
                      </div>
                      <p className="text-xs text-[#334155] leading-relaxed">
                        {recipe.brainBenefitDetail}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-semibold text-[#121518]">
                          Ingredients (Aldi / Tesco est.)
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          {recipe.ingredients.map((ing, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between gap-2 py-1 border-b border-[#E2E8F0] last:border-none"
                            >
                              <span className="text-[#334155]">{ing.name}</span>
                              <span className="font-mono-metric text-[#121518] font-medium whitespace-nowrap">
                                £{ing.estimatedPriceGBP.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-semibold text-[#121518]">
                          Step-by-step method
                        </div>
                        <ol className="space-y-2 text-xs text-[#334155] list-decimal list-inside leading-relaxed">
                          {recipe.method.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        <div className="mt-3 pt-2 border-t border-[#E2E8F0] text-xs text-[#7A263A]">
                          <Flame className="w-3.5 h-3.5 inline mr-1" />
                          <strong>Chef tip:</strong> {recipe.chefTip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* £40 Weekly Supermarket Checklist */}
        <aside className="lg:col-span-5 iron-card p-5 sm:p-6 flex flex-col justify-between space-y-5 h-fit sticky top-20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#121518] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#7A263A]" /> £40 weekly shopping list
              </h2>
              <button
                type="button"
                onClick={onResetDefaultShop}
                className="text-xs text-[#475569] hover:text-[#121518] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset basket
              </button>
            </div>

            <div className="iron-surface p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#475569]">Estimated basket total</div>
                <div className="font-mono-metric text-2xl font-bold text-[#121518]">
                  £{totalBasketGBP.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#475569]">/ £40.00 target</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-[#7A263A]">
                  {shoppingList.filter((i) => i.checked).length} of {shoppingList.length} ticked
                </div>
                <div className="w-28 h-2 bg-[#E2E8F0] rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${
                      totalBasketGBP <= 40 ? 'bg-[#7A263A]' : 'bg-[#DC2626]'
                    }`}
                    style={{
                      width: `${Math.min(100, (totalBasketGBP / 40) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {AISLES.map((aisle) => {
                const items = shoppingList.filter((i) => i.aisle === aisle);
                if (items.length === 0) return null;
                return (
                  <div key={aisle} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#334155] px-1">
                      <span>{aisle}</span>
                      <span className="font-mono-metric">
                        £
                        {items
                          .reduce((s, x) => s + x.estimatedPriceGBP, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-xs transition ${
                          item.checked
                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
                            : 'bg-white border-[#CBD5E1] text-[#121518]'
                        }`}
                      >
                        <label
                          onClick={() => onToggleShopItem(item.id)}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              item.checked
                                ? 'bg-[#7A263A] border-[#7A263A] text-white'
                                : 'border-[#94A3B8] bg-white'
                            }`}
                          >
                            {item.checked && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                          </div>
                          <div className="flex-1">
                            <span className={item.checked ? 'line-through' : 'font-medium'}>
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[#475569] block">
                              {item.quantity}
                              {item.fromRecipe ? ` • ${item.fromRecipe}` : ''}
                            </span>
                          </div>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="font-mono-metric font-semibold text-[#121518]">
                            £{item.estimatedPriceGBP.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveShopItem(item.id)}
                            className="p-1 text-[#475569] hover:text-[#DC2626] transition cursor-pointer"
                            aria-label={`Remove ${item.name}`}
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

          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              id="copy-shopping-list-btn"
              type="button"
              onClick={handleCopyListToKeep}
              className="iron-btn-primary w-full py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              {copiedShopBanner
                ? 'Copied list to clipboard'
                : 'Copy list to Google Keep / Notes'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
