import {
  CBTWorksheetEntry,
  CommunityPost,
  DailyForgeLog,
  LifelineItem,
  MilestoneBadge,
  NonNegotiableTask,
  Playbook,
  Recipe,
  ShoppingIngredient,
} from '../types/ironclad';

export const FOUNDER_MANIFESTO = {
  headline: 'I USED TO THINK HIDING MY STRUGGLES WAS STRENGTH. IT WASN’T.',
  subheadline: 'Built by a full-time cook and business leader who walked through the fire of alcohol dependency and silent burnout—and forged a way out.',
  socialLaunchScript: `"I used to think hiding my struggles was strength. It wasn't.

When you work 14-hour shifts in a scorching kitchen or carry the weight of a business on your back, everyone expects you to be made of iron. You finish service wired on adrenaline and cortisol. By 5 PM or 11 PM, your brain is screaming for an off-switch. For years, my off-switch came in a pint glass or a bottle.

Most 'wellness' apps are built by people in Silicon Valley who have never stared at the ceiling at 3 AM with their heart hammering, never battled a 5 PM witching-hour craving after a brutal shift, and never tried to rebuild their mental health on a £40 weekly food budget.

So I built Ironclad Mindset.
Zero corporate fluff. Zero judgment. Just ironclad daily accountability, proper chef-built brain-fuel nutrition that repairs your gut and dopamine, and a 24/7 AI Cornerman in your pocket when the walls close in.

Forged in struggle. Built for strength. Let's get to work."`,
  missionPillars: [
    {
      title: 'Zero Corporate Fluff',
      detail: 'Practical, battlefield-tested tools for shift workers, trades, leaders, and real people.',
    },
    {
      title: 'Gut-Brain Nutrition on a £40 Budget',
      detail: 'Alcohol strips B-vitamins, magnesium, and dopamine precursors. We rebuild them in 15 minutes a shift.',
    },
    {
      title: '24/7 Cornerman Accountability',
      detail: 'Whether it is Friday 4:45 PM or 3:00 AM, you never have to white-knuckle a craving alone.',
    },
  ],
};

export const MILESTONE_BADGES: MilestoneBadge[] = [
  {
    id: 'badge-1',
    daysRequired: 1,
    title: 'Day 1 Spark',
    subtitle: '24 Hours Clear',
    description: 'You drew a line in the iron. First 24 hours without poison—blood sugar stabilizing.',
    iconName: 'Flame',
  },
  {
    id: 'badge-7',
    daysRequired: 7,
    title: '7-Day Iron',
    subtitle: 'First Friday Conquered',
    description: 'One full week forged. Deep REM sleep returning and morning cortisol spikes dropping.',
    iconName: 'Shield',
  },
  {
    id: 'badge-30',
    daysRequired: 30,
    title: '30-Day Hammer',
    subtitle: 'Dopamine Baseline Reset',
    description: '30 days alcohol-free. Liver inflammation down, gut lining repairing, mental clarity sharp.',
    iconName: 'Hammer',
  },
  {
    id: 'badge-100',
    daysRequired: 100,
    title: '100-Day Anvil',
    subtitle: 'Triple-Digit Resilience',
    description: '100 days of keeping your word to yourself. New neural pathways locked in.',
    iconName: 'Award',
  },
  {
    id: 'badge-365',
    daysRequired: 365,
    title: '365 Unbreakable',
    subtitle: 'Full Year in The Forge',
    description: 'Four seasons, matchdays, weddings, and brutal shifts—forged into unbreakable strength.',
    iconName: 'Crown',
  },
];

export const DEFAULT_NON_NEGOTIABLES: NonNegotiableTask[] = [
  {
    id: 'nn-1',
    label: 'Cooked a real mood-boosting meal (High Tyrosine / Omega-3)',
    completed: true,
    category: 'nutrition',
  },
  {
    id: 'nn-2',
    label: '15-min outside walk or 4-4-4-4 Box Breathing reset',
    completed: true,
    category: 'movement',
  },
  {
    id: 'nn-3',
    label: 'Held the line — Zero booze today',
    completed: true,
    category: 'sobriety',
  },
];

export const DEFAULT_FORGE_LOGS: DailyForgeLog[] = [
  { date: '2026-11-09', dayLabel: 'Mon', mood: 6, sleep: 6, craving: 5, completedTasks: 3, notes: 'Busy Monday prep shift. Drank ginger spritz at 5 PM.' },
  { date: '2026-11-10', dayLabel: 'Tue', mood: 7, sleep: 7, craving: 4, completedTasks: 3, notes: 'Cooked the mackerel power bowl. Slept 7.5 hours.' },
  { date: '2026-11-11', dayLabel: 'Wed', mood: 7, sleep: 8, craving: 3, completedTasks: 3, notes: 'Clear head at 6 AM. Knocked out admin before service.' },
  { date: '2026-11-12', dayLabel: 'Thu', mood: 6, sleep: 7, craving: 6, completedTasks: 2, notes: 'Supplier delivery late, high stress, used HALT check.' },
  { date: '2026-11-13', dayLabel: 'Fri', mood: 8, sleep: 8, craving: 5, completedTasks: 3, notes: 'Witching hour hit at 4:45 PM. Cooked steak skillet instead of pub.' },
  { date: '2026-11-14', dayLabel: 'Sat', mood: 9, sleep: 8, craving: 2, completedTasks: 3, notes: 'Matchday sober! Had Guinness 0.0 with the lads and drove home.' },
  { date: '2026-11-15', dayLabel: 'Sun', mood: 9, sleep: 9, craving: 2, completedTasks: 3, notes: 'Woke up 7 AM Sunday zero hangover. Pride is through the roof.' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'recipe-steak-skillet',
    title: 'The Ironclad Steak, Cavolo Nero & Garlic Skillet',
    subtitle: 'High-heat 12-minute shift recovery skillet loaded with dopamine precursors and bioavailable iron.',
    prepTimeMins: 12,
    costPerServingGBP: 3.45,
    categories: ['15-Min Shift Meals', 'Dopamine Boosters'],
    macros: {
      calories: 540,
      proteinG: 46,
      carbsG: 14,
      fatsG: 32,
    },
    brainBenefitTitle: 'High L-Tyrosine & Heme Iron for Dopamine Restoration',
    brainBenefitDetail:
      'Alcohol artificially floods and then depletes dopamine receptors, leaving you flat and unmotivated. Grass-fed beef rump/bavette provides concentrated L-Tyrosine (the direct amino acid building block of dopamine and norepinephrine) plus Vitamin B12 and zinc, while dark cavolo nero supplies folate and magnesium to calm evening cortisol.',
    chefTip:
      'Take the steak out of the fridge 15 minutes before cooking and pat it bone-dry with kitchen paper. A wet steak steams; a dry steak forms a proper nutty Maillard crust in 90 seconds.',
    ingredients: [
      { name: '200g British Beef Rump or Bavette Steak (Aldi/Tesco)', quantity: '200g', aisle: 'Protein', estimatedPriceGBP: 2.35 },
      { name: 'Cavolo Nero (Black Kale), stems stripped & shredded', quantity: '120g', aisle: 'Produce', estimatedPriceGBP: 0.45 },
      { name: 'Garlic cloves, smashed with the flat of a knife', quantity: '3 cloves', aisle: 'Produce', estimatedPriceGBP: 0.15 },
      { name: 'Tin of Cannellini Beans (rinsed & drained)', quantity: '1/2 tin (200g)', aisle: 'Tins & Dry', estimatedPriceGBP: 0.25 },
      { name: 'Chilli flakes, sea salt, cracked black pepper & olive oil', quantity: '1 tbsp', aisle: 'Tins & Dry', estimatedPriceGBP: 0.25 },
    ],
    method: [
      'Get a heavy cast-iron or stainless skillet smoking hot over high heat. Season the dry steak generously with flaky salt and coarse black pepper.',
      'Sear the steak in 1 tsp oil for 2 mins per side for medium-rare, adding the smashed garlic cloves in the final 60 seconds. Transfer steak to a warm plate to rest (do not skip resting!).',
      'In the same pan with all the beef drippings and garlic, toss in the shredded cavolo nero and a splash of water. Let it char and wilt for 2 minutes.',
      'Tip in the drained cannellini beans and a pinch of chilli flakes. Toss for 90 seconds until piping hot and coated in the pan juices.',
      'Slice the rested steak against the grain, lay it over the garlicky greens and beans, and pour every drop of resting juice over the top.',
    ],
  },
  {
    id: 'recipe-mackerel-bowl',
    title: 'Smashed Mackerel, Chickpea & Lemon Tahini Power Bowl',
    subtitle: 'Zero-cook or flash-warmed 10-minute Mediterranean brain fuel built from store-cupboard tins.',
    prepTimeMins: 10,
    costPerServingGBP: 1.95,
    categories: ['15-Min Shift Meals', 'Gut Repair', 'Dopamine Boosters'],
    macros: {
      calories: 590,
      proteinG: 34,
      carbsG: 42,
      fatsG: 29,
    },
    brainBenefitTitle: 'EPA/DHA Omega-3s & Prebiotic Fibre for Serotonin',
    brainBenefitDetail:
      'Over 90% of your body’s serotonin is produced in the gut. Oily mackerel delivers high-dose EPA and DHA omega-3 fatty acids that reduce neuro-inflammation caused by heavy drinking, while chickpeas and tahini feed beneficial gut bacteria and supply tryptophan.',
    chefTip:
      'Buy tinned mackerel fillets in olive oil rather than brine—use the oil from the tin directly as the base of your lemon-tahini dressing so zero flavour or omega-3 goes down the sink.',
    ingredients: [
      { name: 'Tinned Scottish Mackerel Fillets in Olive Oil', quantity: '1 tin (125g)', aisle: 'Tins & Dry', estimatedPriceGBP: 0.99 },
      { name: 'Tin of Chickpeas, drained', quantity: '1 tin (400g)', aisle: 'Tins & Dry', estimatedPriceGBP: 0.49 },
      { name: 'Light Tahini Paste & Fresh Lemon Juice', quantity: '1 tbsp + 1/2 lemon', aisle: 'Tins & Dry', estimatedPriceGBP: 0.25 },
      { name: 'Fresh Flat-Leaf Parsley & Red Onion, finely sliced', quantity: 'Handful', aisle: 'Produce', estimatedPriceGBP: 0.22 },
    ],
    method: [
      'Whisk 1 tbsp tahini, the oil from the mackerel tin, juice of half a lemon, 1 tbsp warm water, and a pinch of salt in the bottom of a wide bowl until creamy.',
      'Tip in the drained chickpeas, finely sliced red onion, and chopped parsley. Toss thoroughly so the chickpeas soak up the dressing.',
      'Flake the mackerel fillets in chunky pieces over the top, crack over black pepper, and finish with a pinch of smoked paprika or chilli.',
    ],
  },
  {
    id: 'recipe-recovery-oats',
    title: 'Overnight Spiced Cacao, Berry & Walnut Recovery Oats',
    subtitle: '5-minute evening prep so you wake up to slow-release energy and natural magnesium instead of a sugar crash.',
    prepTimeMins: 5,
    costPerServingGBP: 1.35,
    categories: ['Gut Repair', 'Dopamine Boosters'],
    macros: {
      calories: 480,
      proteinG: 19,
      carbsG: 56,
      fatsG: 18,
    },
    brainBenefitTitle: 'Magnesium, Polyphenols & Blood-Sugar Stabilisation',
    brainBenefitDetail:
      'Early sobriety often triggers ferocious sugar cravings because the brain misses the rapid glucose hit of alcohol. Rolled oats beta-glucan fibre + raw cacao (one of nature’s highest sources of magnesium) + walnuts keep blood glucose steady for 5 hours and soothe nervous system jitters.',
    chefTip:
      'Always add a tiny pinch of sea salt to cacao and cinnamon oats—it wakes up the chocolate notes without needing refined sugar.',
    ingredients: [
      { name: 'Scottish Porridge Oats', quantity: '80g', aisle: 'Tins & Dry', estimatedPriceGBP: 0.18 },
      { name: 'Raw Cacao Powder & Ground Cinnamon', quantity: '1 tbsp + 1/2 tsp', aisle: 'Tins & Dry', estimatedPriceGBP: 0.25 },
      { name: 'Frozen Mixed Forest Berries', quantity: '80g', aisle: 'Produce', estimatedPriceGBP: 0.42 },
      { name: 'Walnut Halves & Greek Yoghurt (or Soy)', quantity: '25g + 2 tbsp', aisle: 'Protein', estimatedPriceGBP: 0.50 },
    ],
    method: [
      'In a jar or tub, stir together the oats, cacao powder, cinnamon, a pinch of sea salt, Greek yoghurt, and 150ml milk or water.',
      'Layer the frozen berries and crushed walnuts on top. As the berries thaw overnight in the fridge, their juices bleed into the oats naturally.',
      'Grab straight from the fridge before an early shift—no morning willpower required.',
    ],
  },
  {
    id: 'recipe-witching-hour-spritz',
    title: 'The "Witching Hour" Fiery Ginger, Lime, ACV & Sea Salt Spritz (0.0%)',
    subtitle: 'Built specifically for 5:00 PM after a brutal shift—replicates the throat-hit, complexity, and ritual of a stiff drink.',
    prepTimeMins: 3,
    costPerServingGBP: 0.65,
    categories: ['5 PM Alcohol-Free Swaps', 'Gut Repair'],
    macros: {
      calories: 28,
      proteinG: 0,
      carbsG: 6,
      fatsG: 0,
    },
    brainBenefitTitle: 'Vagus Nerve Sensory Reset & Gut Enzyme Support',
    brainBenefitDetail:
      'Sweet fizzy pop doesn’t satisfy a drinker at 5 PM because you drink it too fast. Raw Apple Cider Vinegar (with the Mother) + fiery fresh ginger + flaky sea salt forces you to sip slowly, triggers a sharp sensory reset on the palate, and aids stomach acid before dinner.',
    chefTip:
      'Serve it in a proper heavy tumbler or stemmed glass with loads of ice—never a mug. Your brain craves the end-of-shift ritual as much as the liquid.',
    ingredients: [
      { name: 'Raw Apple Cider Vinegar (with the Mother)', quantity: '1.5 tbsp (25ml)', aisle: 'Tins & Dry', estimatedPriceGBP: 0.15 },
      { name: 'Fresh Ginger Root (grated) or Fiery Ginger Beer 0.0%', quantity: '1 tsp / 100ml', aisle: 'Drinks', estimatedPriceGBP: 0.25 },
      { name: 'Fresh Lime (juice + wedge) & Flaky Sea Salt', quantity: '1 whole lime', aisle: 'Produce', estimatedPriceGBP: 0.20 },
      { name: 'Chilled Sparkling Water', quantity: '200ml', aisle: 'Drinks', estimatedPriceGBP: 0.05 },
    ],
    method: [
      'Fill a heavy glass to the brim with ice cubes.',
      'Pour in the raw Apple Cider Vinegar, freshly squeezed lime juice, grated ginger (or fiery ginger beer), and a tiny pinch of flaky sea salt.',
      'Top with ice-cold sparkling water, stir once with a bar spoon, and garnish with a bruised lime wheel. Sip slowly while cooking.',
    ],
  },
  {
    id: 'recipe-harissa-traybake',
    title: 'Chef’s One-Pan Harissa Chicken, Sweet Potato & Broccoli Traybake',
    subtitle: 'The ultimate Sunday meal-prep weapon: 4 portions of complex carbs and high protein with one roasting tin to wash.',
    prepTimeMins: 15,
    costPerServingGBP: 2.15,
    categories: ['15-Min Shift Meals', 'Dopamine Boosters', 'Gut Repair'],
    macros: {
      calories: 565,
      proteinG: 42,
      carbsG: 48,
      fatsG: 21,
    },
    brainBenefitTitle: 'Vitamin B6 + Complex Carbs for Evening Tryptophan Transport',
    brainBenefitDetail:
      'Chicken thighs are rich in Vitamin B6 and tryptophan, while sweet potatoes provide slow-burning complex carbohydrates that help tryptophan cross the blood-brain barrier to convert into serotonin and melatonin for deep sleep.',
    chefTip:
      'Use skin-on, bone-in chicken thighs rather than breast—they cost half as much in UK supermarkets, never dry out when reheated on shift, and render smoky harissa juices over the sweet potatoes.',
    ingredients: [
      { name: 'British Chicken Thighs (pack of 6-8)', quantity: '2 thighs per portion', aisle: 'Protein', estimatedPriceGBP: 1.15 },
      { name: 'Sweet Potatoes, cubed into 2cm chunks (skin on)', quantity: '200g', aisle: 'Produce', estimatedPriceGBP: 0.35 },
      { name: 'Tenderstem or Crown Broccoli florets', quantity: '120g', aisle: 'Produce', estimatedPriceGBP: 0.35 },
      { name: 'Rose Harissa Paste, Cumin & Olive Oil', quantity: '1.5 tbsp', aisle: 'Tins & Dry', estimatedPriceGBP: 0.30 },
    ],
    method: [
      'Preheat oven to 200°C fan. Toss the cubed sweet potatoes and chicken thighs directly in a large roasting tin with the harissa paste, cumin, salt, and 1 tbsp olive oil.',
      'Make sure the chicken thighs sit skin-side up on top of the potatoes. Roast for 25 minutes.',
      'Toss the broccoli florets in the pan juices around the chicken and return to the oven for the final 10 minutes until the broccoli edges are crispy and the chicken skin is blistered.',
    ],
  },
];

export const DEFAULT_SHOPPING_LIST: ShoppingIngredient[] = [
  { id: 'shop-1', name: 'British Chicken Thighs (1kg Mega Pack)', aisle: 'Protein', estimatedPriceGBP: 3.29, quantity: '1 pack', checked: true, fromRecipe: 'Harissa Traybake' },
  { id: 'shop-2', name: 'British Beef Rump / Bavette Steaks (2 pack)', aisle: 'Protein', estimatedPriceGBP: 4.69, quantity: '2 steaks', checked: true, fromRecipe: 'Ironclad Steak Skillet' },
  { id: 'shop-3', name: 'Free-Range British Eggs (15 pack)', aisle: 'Protein', estimatedPriceGBP: 2.99, quantity: '15 eggs', checked: false },
  { id: 'shop-4', name: 'Full-Fat Greek Yoghurt (1kg tub)', aisle: 'Protein', estimatedPriceGBP: 1.89, quantity: '1 tub', checked: false, fromRecipe: 'Recovery Oats' },
  { id: 'shop-5', name: 'Tinned Scottish Mackerel in Olive Oil (x3)', aisle: 'Tins & Dry', estimatedPriceGBP: 2.97, quantity: '3 tins', checked: true, fromRecipe: 'Mackerel Power Bowl' },
  { id: 'shop-6', name: 'Chickpeas & Cannellini Beans (x4 tins)', aisle: 'Tins & Dry', estimatedPriceGBP: 1.96, quantity: '4 tins', checked: false, fromRecipe: 'Mackerel Power Bowl' },
  { id: 'shop-7', name: 'Scottish Porridge Oats (1kg bag)', aisle: 'Tins & Dry', estimatedPriceGBP: 0.90, quantity: '1kg', checked: true, fromRecipe: 'Recovery Oats' },
  { id: 'shop-8', name: 'Raw Cacao Powder, Tahini & Rose Harissa Paste', aisle: 'Tins & Dry', estimatedPriceGBP: 4.85, quantity: 'Store cupboard set', checked: false },
  { id: 'shop-9', name: 'Raw Apple Cider Vinegar (with the Mother)', aisle: 'Tins & Dry', estimatedPriceGBP: 1.99, quantity: '500ml bottle', checked: true, fromRecipe: 'Witching Hour Spritz' },
  { id: 'shop-10', name: 'Cavolo Nero, Broccoli Crowns & Spinach', aisle: 'Produce', estimatedPriceGBP: 2.65, quantity: '3 bags', checked: false, fromRecipe: 'Ironclad Steak Skillet' },
  { id: 'shop-11', name: 'Sweet Potatoes (1kg), Red Onions & Garlic Bulb', aisle: 'Produce', estimatedPriceGBP: 2.35, quantity: 'Weekly base', checked: false, fromRecipe: 'Harissa Traybake' },
  { id: 'shop-12', name: 'Fresh Limes (x5), Lemons (x4) & Fresh Ginger Root', aisle: 'Produce', estimatedPriceGBP: 2.40, quantity: 'Citrus pack', checked: false, fromRecipe: 'Witching Hour Spritz' },
  { id: 'shop-13', name: 'Frozen Forest Berries (500g) & Walnuts', aisle: 'Produce', estimatedPriceGBP: 3.50, quantity: '1 bag + 1 pack', checked: false, fromRecipe: 'Recovery Oats' },
  { id: 'shop-14', name: 'Sparkling Water (4x 2L) & Fiery Ginger Beer 0.0%', aisle: 'Drinks', estimatedPriceGBP: 3.20, quantity: 'Multipack', checked: false, fromRecipe: 'Witching Hour Spritz' },
];

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'playbook-1',
    number: 1,
    title: 'The First 30 Days Sobriety Blueprint',
    subtitle: 'Complete day-by-day physical & mental timeline: what happens inside your brain, liver, and nervous system when you put down the glass.',
    readTime: '8 min read',
    category: 'Sobriety',
    summary:
      'Most people relapse in the first 14 days because nobody told them what the neurochemical rebound feels like. When you know the exact biological timeline, anxiety turns into data.',
    keyTakeaways: [
      'Days 1–3: Glutamate surge & GABA dip cause night sweats and restlessness—hydrate with electrolytes and never skip dinner.',
      'Days 4–10: The Sugar & Phantom Hangover phase—your liver is recalibrating glycogen; lean into complex carbs and magnesium.',
      'Days 11–30: Dopamine receptor upregulation—natural motivation, deep REM sleep, and morning pride lock in.',
    ],
    sections: [
      {
        heading: 'Phase 1: Days 1 to 3 — The Neurochemical Seesaw (Detox & Stabilisation)',
        badge: 'HOURS 0–72',
        body: [
          'Alcohol is a central nervous system depressant. To keep you awake while you drink, your brain floods your system with glutamate (the accelerator pedal) and suppresses natural GABA (the brake pedal). When you stop drinking on Day 1, the alcohol leaves within 24 hours, but your brain’s accelerator is still jammed down for 48–72 hours.',
          'That is why at 5 PM on Day 2 or 3 AM on Day 3 you feel wired, irritable, sweaty, and restless. It is NOT weakness—it is your GABA/Glutamate seesaw coming back to level ground.',
        ],
        actionPoints: [
          'Never let yourself get hungry between 3 PM and 7 PM. Eat a protein + complex carb meal at 4:30 PM before the craving clock strikes.',
          'Sip the Witching Hour Spritz (ACV, lime, ginger, pinch of salt) for electrolytes and sensory bite.',
          'Note on medical safety: If you have been drinking heavily every day and experience severe tremors, confusion, or racing heart, contact NHS 111 or your GP before stopping cold turkey.',
        ],
      },
      {
        heading: 'Phase 2: Days 4 to 10 — Sleep Architecture & The Sugar Trap',
        badge: 'DAYS 4–10',
        body: [
          'By Day 4, you might experience vivid dreams or wake up feeling groggy—the infamous "Phantom Hangover." Alcohol sedates the cortex but blocks REM sleep. Now your brain is catching up on months or years of REM debt.',
          'At the same time, your body realizes it is missing the 1,000+ liquid calories of sugar it used to get from pints or wine. If you try to go alcohol-free AND go on a restrictive crash diet in Week 1, you will crash. Feed the furnace properly.',
        ],
        actionPoints: [
          'Prep Overnight Spiced Cacao & Walnut Oats so morning blood glucose is rock steady.',
          'Conquer your first Friday ("The Witching Hour") by changing your physical route home from work and booking an early Saturday morning commitment.',
        ],
      },
      {
        heading: 'Phase 3: Days 11 to 30 — The Dopamine Baseline Reset',
        badge: 'DAYS 11–30',
        body: [
          'Around Day 14, the fog lifts. Liver enzymes (GGT and ALT) begin dropping rapidly, gut permeability starts sealing, and your D2 dopamine receptors begin growing back.',
          'Watch out for the "Day 21 Moderating Lie"—the voice in your head that says, "Look how good you feel, you’ve proved you don’t have a problem, you can have just two pints." Play the tape forward to 3 AM before you ever fall for that trap.',
        ],
        actionPoints: [
          'Track your money saved in The Forge—at £65/week, Day 30 puts nearly £280 of tax-free cash back in your pocket.',
          'Stack L-Tyrosine meals (steak skillet, mackerel, eggs) with a 15-minute morning daylight walk to cement your new circadian rhythm.',
        ],
      },
    ],
  },
  {
    id: 'playbook-2',
    number: 2,
    title: 'The £40 Mood-Food Supermarket Cheat Sheet',
    subtitle: 'How to walk into any UK Aldi, Lidl, or Tesco with £40 and walk out with a week of gut-brain recovery fuel.',
    readTime: '6 min read',
    category: 'Nutrition',
    summary:
      'Alcohol depletes four critical mental-health nutrients: Vitamin B1 (Thiamine), Magnesium, Zinc, and Omega-3s. Here is how a working chef repairs the gut-brain axis on £40 a week.',
    keyTakeaways: [
      'Prioritise tinned oily fish (mackerel/sardines at 99p) and chicken thighs over expensive lean fillets.',
      'Use fermented & prebiotic foods (Greek yoghurt, ACV, beans, oats) to rebuild the microbiome where 90% of serotonin is made.',
      'Keep 12-minute skillet ingredients on standby so a 14-hour shift never ends with a takeaway and a 4-pack.',
    ],
    sections: [
      {
        heading: '1. The 4 Nutrients Alcohol Steals From Your Brain',
        badge: 'BIOCHEMISTRY',
        body: [
          '1. B-Vitamins (B1, B6, B12, Folate): Essential for converting food into cellular energy and synthesizing neurotransmitters. Deficiency feels identical to clinical burnout and anxiety.',
          '2. Magnesium: Nature’s physiological brake pedal. Alcohol acts as a diuretic that flushes magnesium through the kidneys, leaving muscles tight and sleep fractured.',
          '3. L-Tyrosine & Tryptophan: Amino acids required to build Dopamine (drive/focus) and Serotonin (calm/contentment).',
          '4. Omega-3 EPA/DHA: Structural fats that cool neuro-inflammation in the prefrontal cortex.',
        ],
        actionPoints: [
          'Swap £12 takeaways for the £3.45 Ironclad Steak & Cavolo Nero Skillet.',
          'Keep 3 tins of Scottish Mackerel in olive oil in your cupboard at all times—10-minute brain fuel under £2.',
        ],
      },
      {
        heading: '2. The Chef’s £40 Aldi / Tesco Basket Breakdown',
        badge: 'BUDGET PROTOCOL',
        body: [
          'Protein (£12.86): 1kg Chicken Thighs (£3.29), 2x Beef Rump/Bavette Steaks (£4.69), 15 Free-Range Eggs (£2.99), 1kg Full-Fat Greek Yoghurt (£1.89).',
          'Tins & Dry Store (£12.67): 3x Tinned Mackerel (£2.97), 4x Chickpeas/Cannellini Beans (£1.96), 1kg Porridge Oats (£0.90), Raw Cacao, Tahini & Harissa (£4.85), Raw ACV (£1.99).',
          'Produce & Drinks (£14.10): Cavolo Nero, Broccoli & Spinach (£2.65), Sweet Potatoes, Onions & Garlic (£2.35), Limes, Lemons & Ginger (£2.40), Frozen Berries & Walnuts (£3.50), Sparkling Water & Ginger Beer 0.0% (£3.20).',
          'Total Weekly Spend: £39.63 — leaving you 21 nutrient-dense meals and 5 PM alcohol-free spritzes for less than the price of one Friday night round at the pub.',
        ],
        actionPoints: [
          'Open the "Fuel The Mind" module and click "Copy List to Google Keep / Notes" before your weekly shop.',
        ],
      },
    ],
  },
  {
    id: 'playbook-3',
    number: 3,
    title: 'The Matchday & UK Pub Survival Guide',
    subtitle: 'Tactical game plan for football Saturdays, work socials, weddings, best UK 0.0% tap beers, and the "Irish Exit" strategy.',
    readTime: '7 min read',
    category: 'Social & Pub',
    summary:
      'In the UK, socialising is wired around the pub and the terraces. You don’t have to become a hermit to stay sober—you just need a tactical matchday script before you walk through the doors.',
    keyTakeaways: [
      'First Pint Rule: Know your exact 0.0% order before your foot hits the pub carpet—hesitation invites peer pressure.',
      'Opt Out of Rounds: Buy your own drinks from minute one so you are never trapped in a 6-pint round cycle.',
      'The 9:30 PM "Irish Exit": Leave when the pub starts repeating stories—nobody remembers who left at 9:30 PM, only who embarrassed themselves at midnight.',
    ],
    sections: [
      {
        heading: '1. Word-for-Word UK Pub Scripts (Zero Awkwardness)',
        badge: 'SOCIAL SCRIPTS',
        body: [
          'When a mate says: "Go on, just have one pint, what are you on Guinness Zero for?"',
          'Script A (The Training / Early Shift Card): "Got an early start tomorrow mate and I’m on a 30-day fitness block—honestly feeling too sharp to wreck it tonight. Get yourself a proper one."',
          'Script B (The Direct Chef / Leader Card): "Taking a proper break from the booze mate—sleeping like a king and saving a fortune. This Guinness 0.0 actually hits the spot."',
          'Notice the rule: Never apologize, never look at your shoes, and immediately pivot the conversation back to the football or work.',
        ],
        actionPoints: [
          'Keep a cold glass in your hand at all times—people only offer to buy you a drink when your hands are empty.',
        ],
      },
      {
        heading: '2. The Best UK 0.0% Tap & Bottle Swaps + The Irish Exit',
        badge: 'MATCHDAY TACTICS',
        body: [
          'Top UK Pub Swaps: Guinness 0.0 (indistinguishable mouthfeel in a proper pint glass), Lucky Saint 0.5% Unfiltered Lager (on tap in 1,000+ UK pubs), Mash Gang Chug (craft pale), or Soda Water with Fresh Lime & Angostura/Ginger.',
          'The 2-Pint Loop Rule: Around pint 3, drinkers’ volume goes up 30% and they start telling the same story twice. That is your cue. Say goodbye to the person next to you (or slip out cleanly) and enjoy driving home with the radio on while everyone else queues in the rain for a £40 taxi.',
        ],
        actionPoints: [
          'Always have your own transport plan (car, train ticket, or bike) so you are never waiting on a drinker for a lift.',
        ],
      },
    ],
  },
  {
    id: 'playbook-4',
    number: 4,
    title: 'Interactive HALT & CBT Trigger Worksheet',
    subtitle: 'Catch the craving before it catches you: break the Trigger → Automatic Thought → Craving loop in 90 seconds.',
    readTime: 'Interactive Tool',
    category: 'CBT & Mindset',
    summary:
      'Every relapse starts hours before the first drink with an unchecked HALT state (Hungry, Angry, Lonely, Tired) and an unchallenged automatic thought. Use the interactive worksheet inside this Playbook to reframe your trigger and save it to your journal.',
    keyTakeaways: [
      'Cravings are neurological waves that peak and subside within 15–20 minutes if you do not feed them.',
      'Separate the external trigger (a brutal shift) from the permissive thought ("I deserve to switch off with a drink").',
      'Write the balanced Ironclad Reframe down—seeing it on screen shifts brain activity from the amygdala to the prefrontal cortex.',
    ],
    isInteractiveCBT: true,
    sections: [
      {
        heading: 'How the CBT Trigger Loop Works in High-Pressure Jobs',
        badge: 'CBT PROTOCOL',
        body: [
          '1. Trigger Event: Ticket machine doesn’t stop for 4 hours, client cancels a contract, or you walk into an empty flat at 6 PM.',
          '2. HALT Vulnerability: You haven’t eaten since 11 AM (Hungry) and you slept 5 hours (Tired).',
          '3. Permissive Automatic Thought: "I’ve been battered all day, I need 3 pints just to bring my shoulders down from my ears."',
          '4. The Ironclad Reframe: "My nervous system is flooded with cortisol and my blood sugar is on the floor. Alcohol will give me 20 minutes of numbness and 24 hours of anxiety tomorrow. A hot steak skillet and 60 seconds of box breathing will actually lower my cortisol."',
        ],
        actionPoints: [
          'Complete the interactive HALT & CBT Worksheet below whenever a craving crosses 5/10.',
        ],
      },
    ],
  },
  {
    id: 'playbook-5',
    number: 5,
    title: 'Playbook 5 (B2B): The UK Workplace Sober-Inclusive & Mental Fitness Policy',
    subtitle: 'Plug-and-play HR & leadership charter for UK SMEs, hospitality groups, construction sites, and shift workplaces.',
    readTime: '10 min read • B2B Charter',
    category: 'B2B Policy',
    summary:
      'Alcohol-related absenteeism and presenteeism cost UK employers over £7.3 billion every year. This ready-to-deploy policy shifts workplace culture from "work hard, drink harder" to genuine psychological safety and high performance.',
    keyTakeaways: [
      'Non-Judgmental Support Guarantee: Employees seeking support early are protected via occupational wellness pathways rather than punitive stigma.',
      'Sober-Inclusive Social Charter: All company events, client dinners, and end-of-shift socials must provide premium 0.0% parity and never center solely around alcohol.',
      'DocuSeal Ready: Can be adopted and digitally signed by UK directors and team leads directly via the B2B Portal.',
    ],
    isB2BPolicy: true,
    sections: [
      {
        heading: 'Clause 1: Purpose & Leadership Commitment',
        badge: 'CHARTER SECTION 1',
        body: [
          'Our organisation recognises that high-pressure work environments—particularly shift work, hospitality, construction, and fast-growth SMEs—carry elevated risks of silent burnout and alcohol dependency.',
          'We commit to fostering an Ironclad Workplace Culture where mental fitness, proper rest, and sobriety are actively respected, supported, and championed from leadership down.',
        ],
      },
      {
        heading: 'Clause 2: The Sober-Inclusive Social & Shift Standard',
        badge: 'CHARTER SECTION 2',
        body: [
          '1. Equal 0.0% Provision: Every company-funded social, Christmas party, client hospitality event, or post-shift debrief must stock high-quality 0.0% craft beer, spirits, or adult soft drinks at equal visibility to alcoholic options.',
          '2. Zero Peer Pressure Guarantee: Questioning or pressuring a colleague about why they are not drinking is contrary to our team code of conduct.',
          '3. Shift Nutrition & Hydration: Where teams work late or double shifts, management ensures access to nutritious staff meals and hydration breaks.',
        ],
      },
      {
        heading: 'Clause 3: Confidential Early-Intervention Pathway',
        badge: 'CHARTER SECTION 3',
        body: [
          'Any team member experiencing burnout, mental health distress, or alcohol dependency who voluntarily raises their hand for support prior to a safety breach will be granted confidential access to Ironclad Mindset resources, occupational adjustments, and signpost lifelines without fear of dismissal.',
        ],
        actionPoints: [
          'Deploy this policy across your team via the B2B Corporate Wellness Portal and trigger an automated DocuSeal sign-off pack.',
        ],
      },
    ],
  },
];

export const DEFAULT_CBT_ENTRIES: CBTWorksheetEntry[] = [
  {
    id: 'cbt-1',
    createdAt: '2026-11-13 16:50',
    haltStates: ['Hungry', 'Tired'],
    triggerSituation: 'Friday 4:50 PM after a brutal 10-hour prep & stocktake shift. Lads heading straight to the taproom across the road.',
    cravingRating: 8,
    automaticThought: 'I’ve grafted non-stop all week, one or two pints will take the edge off my backache and stress.',
    cognitiveDistortion: 'Short-Term Magnification / Minimising Tomorrow ("Just two pints" rarely stays two on a Friday when starving).',
    ironcladReframe: 'My brain isn’t craving alcohol—it is starving for glucose, L-tyrosine, and decompression. If I go home, sear a rump steak, and drink an ice-cold ginger ACV spritz, I’ll wake up at 7 AM Saturday £60 richer and proud.',
    actionTaken: 'Did 60s Box Breathing in the car, drove straight past the pub, cooked the 12-min steak skillet.',
  },
];

export const LIFELINES_DIRECTORY: LifelineItem[] = [
  {
    id: 'life-samaritans',
    name: 'Samaritans UK',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '116123',
    website: 'https://www.samaritans.org',
    hours: '24 hours a day, 365 days a year (Free from any phone)',
    description: 'Immediate, confidential, judgment-free listening support whenever things feel overwhelming at 3 AM or after a shift.',
    badge: 'FREE 24/7 CALL',
  },
  {
    id: 'life-calm',
    name: 'CALM (Campaign Against Living Miserably)',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '0800585858',
    website: 'https://www.thecalmzone.net',
    hours: '5:00 PM – Midnight daily',
    description: 'Practical, no-nonsense UK helpline and webchat standing against misery, isolation, and suicide.',
    badge: '5PM–MIDNIGHT',
  },
  {
    id: 'life-shout',
    name: 'SHOUT 85258 Crisis Text Line',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '85258',
    textNumber: 'Text SHOUT to 85258',
    website: 'https://giveusashout.org',
    hours: '24/7 Silent Text Support',
    description: 'When you cannot speak out loud—on a noisy commute, break room, or shared house—text SHOUT to 85258 for free 24/7 support.',
    badge: 'TEXT 85258',
  },
  {
    id: 'life-nhs111',
    name: 'NHS 111 Mental Health Option',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '111',
    website: 'https://111.nhs.uk',
    hours: '24/7 Urgent NHS Triage',
    description: 'Dial 111 and select the Mental Health option to speak directly to your local NHS crisis and alcohol detox triage team.',
    badge: 'NHS URGENT',
  },
  {
    id: 'life-mind',
    name: 'Mind Infoline UK',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '03001233393',
    website: 'https://www.mind.org.uk',
    hours: 'Mon–Fri, 9:00 AM – 6:00 PM',
    description: 'Expert guidance on UK mental health rights at work, burnout recovery, and local peer support groups.',
    badge: 'WORK & RIGHTS',
  },
  {
    id: 'life-hospitality-action',
    name: 'Hospitality Action',
    category: 'Industry-Specific Charities',
    phone: '08088020282',
    website: 'https://www.hospitalityaction.org.uk',
    hours: '24/7 Hospitality Assistance Line',
    description: 'Dedicated lifeline for UK chefs, kitchen porters, bar staff, and hospitality managers battling addiction, burnout, or financial crisis.',
    badge: 'CHEFS & KITCHENS',
  },
  {
    id: 'life-lighthouse',
    name: 'The Lighthouse Construction Industry Charity',
    category: 'Industry-Specific Charities',
    phone: '03456051956',
    textNumber: 'Text HARDHAT to 85258',
    website: 'https://www.lighthouseclub.org',
    hours: '24/7 Construction & Trades Helpline',
    description: 'Built for UK site workers, sparkies, plumbers, and sub-contractors. Emotional, physical, and financial wellbeing support.',
    badge: 'TRADES & SITES',
  },
  {
    id: 'life-smart',
    name: 'SMART Recovery UK',
    category: 'Sobriety & Recovery Communities',
    phone: '01463729548',
    website: 'https://smartrecovery.org.uk',
    hours: 'Daily Online & Local UK Meetings',
    description: 'Science-based, CBT-driven recovery meetings across the UK. Practical 4-Point programme for managing cravings and building life balance.',
    badge: 'CBT MEETINGS',
  },
  {
    id: 'life-alcohol-change',
    name: 'Alcohol Change UK & Drinkline',
    category: 'Sobriety & Recovery Communities',
    phone: '03001231110',
    website: 'https://alcoholchange.org.uk',
    hours: 'Mon–Fri 9am–8pm, Weekends 11am–4pm',
    description: 'Free, confidential UK helpline and directory for anyone concerned about their own or a loved one’s drinking.',
    badge: 'UK SOBRIETY HUB',
  },
  {
    id: 'life-clubsoda',
    name: 'Club Soda (Mindful Drinking & Covent Garden Tasting Room)',
    category: 'Sobriety & Recovery Communities',
    website: 'https://joinclubsoda.com',
    hours: 'Online & London Tasting Room',
    description: 'The UK’s mindful drinking movement—courses, sober socials, and the world’s largest curation of 0.0% drinks.',
    badge: 'MINDFUL DRINKING',
  },
  {
    id: 'life-aa',
    name: 'Alcoholics Anonymous Great Britain',
    category: 'Sobriety & Recovery Communities',
    phone: '08009177650',
    website: 'https://www.alcoholics-anonymous.org.uk',
    hours: '24/7 National Helpline',
    description: 'Thousands of free in-person and online meetings every day across every UK postcode.',
    badge: '24/7 FELLOWSHIP',
  },
  {
    id: 'life-matchday-zones',
    name: 'UK Stadium Sober Matchday & Top 0.0% Tap Finder',
    category: 'Sober Matchday & 0.0% Finder',
    website: 'https://luckysaint.co/pages/find-lucky-saint',
    hours: 'Matchday Saturdays & Midweek Fixtures',
    description: 'London Stadium, Emirates, Tottenham Hotspur Stadium, Villa Park & Portman Road now pour Guinness 0.0 / Heineken 0.0 on concourses; pair with the Lucky Saint UK Tap Map for pre-match pubs.',
    badge: 'STADIUM & PUB 0.0%',
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Dan_HeadChef_E13',
    roleBadge: 'Founder & Head Chef',
    streakDays: 412,
    channel: '#kitchen-and-shift-workers',
    timestamp: '2 hours ago',
    content:
      'Just wrapped a 220-cover Sunday roast service. Five years ago, I’d already be three pints deep in the staff yard with my lower back screaming and my temper on a hair-trigger. Tonight? Searched the fridge, knocked up the 12-min Steak & Cavolo Nero Skillet, and poured a fiery ginger ACV spritz over ice. To every chef, KP, and shift worker finishing late tonight: get proper protein in you before your boots come off. We go again.',
    ironCount: 48,
    userSentIron: false,
    replies: [
      {
        id: 'rep-1',
        author: 'SousChef_Liam',
        roleBadge: 'Sous Chef • Bristol',
        content: 'Needed to read this right as we finished scrubbing down the pass mate. Ordering a lime & soda and heading straight home.',
        timestamp: '1 hour ago',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Bow_Hammer_Mark',
    roleBadge: 'Site Foreman • East London',
    streakDays: 19,
    channel: '#matchday-sober',
    timestamp: '4 hours ago',
    content:
      'First proper away day at the football yesterday completely 0.0%. Used Playbook 3 to the letter—bought my own Guinness 0.0 from the jump so I wasn’t locked into an 8-man round, remembered the whole second half, and drove four of the lads home safely. Saved at least £95 in one afternoon.',
    ironCount: 39,
    userSentIron: true,
    replies: [
      {
        id: 'rep-2',
        author: 'ClaretAndBlue_Stu',
        roleBadge: 'Sparky • Essex',
        content: 'Massive result Mark! Waking up Sunday morning without the beer fear after a matchday is an unbeatable feeling.',
        timestamp: '3 hours ago',
      },
    ],
  },
  {
    id: 'post-3',
    author: 'Sarah_OpsDirector',
    roleBadge: 'Logistics SME Owner • Leeds',
    streakDays: 64,
    channel: '#business-owners',
    timestamp: '6 hours ago',
    content:
      'Rolled out Playbook 5 (The Sober-Inclusive Workplace Charter) across our 38 warehouse and transport staff this week. Replaced the Friday "beer fridge" with half Lucky Saint / Mash Gang 0.0% and stocked proper shift snacks. Two drivers quietly pulled me aside to say thank you because they were silently trying to quit drinking. Best leadership decision I’ve made all year.',
    ironCount: 62,
    userSentIron: false,
    replies: [],
  },
  {
    id: 'post-4',
    author: 'Callum_DayOne',
    roleBadge: 'Line Cook • Manchester',
    streakDays: 3,
    channel: '#day-1-starters',
    timestamp: '8 hours ago',
    content:
      'Day 3 here. Sleep was rough last night just like Playbook 1 warned about, but knowing it’s just the GABA/glutamate seesaw levelling out stopped me panicking at 3 AM. Hit the Red SOS button at 5 PM today, did 60 seconds of Box Breathing, and made the Mackerel & Chickpea bowl. Holding the line tonight.',
    ironCount: 74,
    userSentIron: false,
    replies: [
      {
        id: 'rep-3',
        author: 'Dan_HeadChef_E13',
        roleBadge: 'Founder & Head Chef',
        content: 'Day 3 is the thickest part of the storm Callum. By Day 6 your sleep is going to turn a massive corner. Proud of you mate—keep stacking.',
        timestamp: '7 hours ago',
      },
    ],
  },
];
