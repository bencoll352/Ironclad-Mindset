import {
  CBTWorksheetEntry,
  CommunityPost,
  DailyForgeLog,
  LifelineItem,
  NonNegotiableTask,
  Playbook,
  Recipe,
  ShoppingIngredient,
} from '../types/ironclad';

export const FOUNDER_MANIFESTO = {
  headline: 'I used to think hiding my struggles was strength. It wasn’t.',
  subheadline:
    'Built by a full-time cook and business leader who walked through alcohol dependency and silent burnout—and forged a practical way forward.',
  socialLaunchScript: `"I used to think hiding my struggles was strength. It wasn't.

When you work 14-hour shifts in a scorching kitchen or carry the weight of a business on your back, everyone expects you to be made of iron. You finish service wired on adrenaline. By 5pm or 11pm, your head is screaming for an off-switch. For years, my off-switch came in a pint glass or a bottle.

Most 'wellness' apps are built by people who have never stared at the ceiling at 3am with their heart hammering, never battled a 5pm craving after a brutal shift, and never tried to rebuild their wellbeing on a £40 weekly food budget.

So I built Ironclad Mindset.
Zero corporate fluff. Zero judgment. Just ironclad daily accountability, proper chef-built meals on a budget, and a 24/7 recovery companion in your pocket when the walls close in.

Forged in struggle. Built for strength. Let's get to work."`,
  missionPillars: [
    {
      title: 'Zero corporate fluff',
      detail:
        'Practical, everyday tools built for shift workers, trades, leaders, and real life.',
    },
    {
      title: 'Proper food on a £40 budget',
      detail:
        'Regular, protein-rich meals in 15 minutes help steady energy and evening cravings.',
    },
    {
      title: '24/7 recovery companion',
      detail:
        'Whether it is Friday at 4:45pm or 3:00am, you never have to face a craving alone.',
    },
  ],
};

export const DEFAULT_NON_NEGOTIABLES: NonNegotiableTask[] = [
  {
    id: 'nn-1',
    label: 'Cooked a proper meal today',
    completed: true,
    category: 'nutrition',
  },
  {
    id: 'nn-2',
    label: '15-minute outside walk or breathing reset',
    completed: true,
    category: 'movement',
  },
  {
    id: 'nn-3',
    label: 'Held the line — alcohol-free today',
    completed: true,
    category: 'sobriety',
  },
];

export const DEFAULT_FORGE_LOGS: DailyForgeLog[] = [
  {
    date: '2026-11-09',
    dayLabel: 'Mon',
    mood: 6,
    sleep: 6,
    craving: 5,
    completedTasks: 3,
    notes: 'Busy Monday prep shift. Had a ginger spritz at 5pm.',
  },
  {
    date: '2026-11-10',
    dayLabel: 'Tue',
    mood: 7,
    sleep: 7,
    craving: 4,
    completedTasks: 3,
    notes: 'Cooked the mackerel power bowl. Slept well.',
  },
  {
    date: '2026-11-11',
    dayLabel: 'Wed',
    mood: 7,
    sleep: 8,
    craving: 3,
    completedTasks: 3,
    notes: 'Clear head at 6am. Finished admin before service.',
  },
  {
    date: '2026-11-12',
    dayLabel: 'Thu',
    mood: 6,
    sleep: 7,
    craving: 6,
    completedTasks: 2,
    notes: 'Supplier delivery late, high stress, used HALT check.',
  },
  {
    date: '2026-11-13',
    dayLabel: 'Fri',
    mood: 8,
    sleep: 8,
    craving: 5,
    completedTasks: 3,
    notes: 'Craving hit at 4:45pm. Cooked steak skillet instead of going to the pub.',
  },
  {
    date: '2026-11-14',
    dayLabel: 'Sat',
    mood: 9,
    sleep: 8,
    craving: 2,
    completedTasks: 3,
    notes: 'Matchday sober. Had Guinness 0.0 with the lads and drove home.',
  },
  {
    date: '2026-11-15',
    dayLabel: 'Sun',
    mood: 9,
    sleep: 9,
    craving: 2,
    completedTasks: 3,
    notes: 'Woke up 7am Sunday clear-headed.',
  },
];

export const RECIPES: Recipe[] = [
  {
    id: 'recipe-steak-skillet',
    title: 'The Ironclad Steak, Cavolo Nero & Garlic Skillet',
    subtitle:
      'High-heat 12-minute shift recovery skillet with protein, iron, and leafy greens.',
    prepTimeMins: 12,
    costPerServingGBP: 3.45,
    categories: ['15-Min Shift Meals', 'Dopamine Boosters'],
    macros: {
      calories: 540,
      proteinG: 46,
      carbsG: 14,
      fatsG: 32,
    },
    brainBenefitTitle: 'High protein, iron, and folate for post-shift recovery',
    brainBenefitDetail:
      'Eating a hot, protein-rich meal before you unwind helps steady blood sugar after a long shift, while cavolo nero and beans provide fibre, folate, and magnesium.',
    chefTip:
      'Take the steak out of the fridge 15 minutes before cooking and pat it dry with kitchen paper so it sears cleanly in 90 seconds.',
    ingredients: [
      {
        name: '200g British Beef Rump or Bavette Steak (Aldi/Tesco)',
        quantity: '200g',
        aisle: 'Protein',
        estimatedPriceGBP: 2.35,
      },
      {
        name: 'Cavolo Nero (Black Kale), stems stripped & shredded',
        quantity: '120g',
        aisle: 'Produce',
        estimatedPriceGBP: 0.45,
      },
      {
        name: 'Garlic cloves, smashed with the flat of a knife',
        quantity: '3 cloves',
        aisle: 'Produce',
        estimatedPriceGBP: 0.15,
      },
      {
        name: 'Tin of Cannellini Beans (rinsed & drained)',
        quantity: '1/2 tin (200g)',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.25,
      },
      {
        name: 'Chilli flakes, sea salt, cracked black pepper & olive oil',
        quantity: '1 tbsp',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.25,
      },
    ],
    method: [
      'Heat a heavy cast-iron or stainless skillet over high heat. Season the dry steak generously with salt and coarse black pepper.',
      'Sear the steak in 1 tsp oil for 2 mins per side for medium-rare, adding the smashed garlic cloves in the final 60 seconds. Transfer steak to a warm plate to rest.',
      'In the same pan with the pan juices and garlic, toss in the shredded cavolo nero and a splash of water. Let it wilt for 2 minutes.',
      'Tip in the drained cannellini beans and a pinch of chilli flakes. Toss for 90 seconds until piping hot.',
      'Slice the rested steak against the grain, lay it over the greens and beans, and pour over the resting juices.',
    ],
  },
  {
    id: 'recipe-mackerel-bowl',
    title: 'Smashed Mackerel, Chickpea & Lemon Tahini Power Bowl',
    subtitle:
      'Zero-cook or flash-warmed 10-minute Mediterranean meal built from store-cupboard tins.',
    prepTimeMins: 10,
    costPerServingGBP: 1.95,
    categories: ['15-Min Shift Meals', 'Gut Repair', 'Dopamine Boosters'],
    macros: {
      calories: 590,
      proteinG: 34,
      carbsG: 42,
      fatsG: 29,
    },
    brainBenefitTitle: 'Omega-3 fatty acids and prebiotic fibre',
    brainBenefitDetail:
      'Oily mackerel provides essential omega-3 fatty acids, while chickpeas and tahini deliver slow-release carbohydrates and fibre that keep energy steady all evening.',
    chefTip:
      'Buy tinned mackerel fillets in olive oil rather than brine—use the oil from the tin directly as the base of your lemon-tahini dressing.',
    ingredients: [
      {
        name: 'Tinned Scottish Mackerel Fillets in Olive Oil',
        quantity: '1 tin (125g)',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.99,
      },
      {
        name: 'Tin of Chickpeas, drained',
        quantity: '1 tin (400g)',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.49,
      },
      {
        name: 'Light Tahini Paste & Fresh Lemon Juice',
        quantity: '1 tbsp + 1/2 lemon',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.25,
      },
      {
        name: 'Fresh Flat-Leaf Parsley & Red Onion, finely sliced',
        quantity: 'Handful',
        aisle: 'Produce',
        estimatedPriceGBP: 0.22,
      },
    ],
    method: [
      'Whisk 1 tbsp tahini, the oil from the mackerel tin, juice of half a lemon, 1 tbsp warm water, and a pinch of salt in a wide bowl until creamy.',
      'Tip in the drained chickpeas, finely sliced red onion, and chopped parsley. Toss thoroughly.',
      'Flake the mackerel fillets in chunky pieces over the top and finish with black pepper and smoked paprika.',
    ],
  },
  {
    id: 'recipe-recovery-oats',
    title: 'Overnight Spiced Cacao, Berry & Walnut Recovery Oats',
    subtitle:
      '5-minute evening prep so you wake up to slow-release energy instead of a mid-morning crash.',
    prepTimeMins: 5,
    costPerServingGBP: 1.35,
    categories: ['Gut Repair', 'Dopamine Boosters'],
    macros: {
      calories: 480,
      proteinG: 19,
      carbsG: 56,
      fatsG: 18,
    },
    brainBenefitTitle: 'Slow-release oats, magnesium, and healthy fats',
    brainBenefitDetail:
      'Porridge oats, raw cacao, and walnuts provide fibre and dietary magnesium to help prevent sharp sugar dips during busy morning shifts.',
    chefTip:
      'Always add a tiny pinch of sea salt to cacao and cinnamon oats—it brings out the chocolate flavour without extra sugar.',
    ingredients: [
      {
        name: 'Scottish Porridge Oats',
        quantity: '80g',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.18,
      },
      {
        name: 'Raw Cacao Powder & Ground Cinnamon',
        quantity: '1 tbsp + 1/2 tsp',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.25,
      },
      {
        name: 'Frozen Mixed Forest Berries',
        quantity: '80g',
        aisle: 'Produce',
        estimatedPriceGBP: 0.42,
      },
      {
        name: 'Walnut Halves & Greek Yoghurt (or Soy)',
        quantity: '25g + 2 tbsp',
        aisle: 'Protein',
        estimatedPriceGBP: 0.5,
      },
    ],
    method: [
      'In a jar or tub, stir together the oats, cacao powder, cinnamon, a pinch of sea salt, Greek yoghurt, and 150ml milk or water.',
      'Layer the frozen berries and crushed walnuts on top. Leave in the fridge overnight.',
      'Grab straight from the fridge before an early shift.',
    ],
  },
  {
    id: 'recipe-witching-hour-spritz',
    title: 'The "Witching Hour" Fiery Ginger, Lime, ACV & Sea Salt Spritz (0.0%)',
    subtitle:
      'Built for 5:00pm after a tough shift—replicates the sharp bite and ritual of an evening drink.',
    prepTimeMins: 3,
    costPerServingGBP: 0.65,
    categories: ['5 PM Alcohol-Free Swaps', 'Gut Repair'],
    macros: {
      calories: 28,
      proteinG: 0,
      carbsG: 6,
      fatsG: 0,
    },
    brainBenefitTitle: 'Sharp sensory ritual without alcohol',
    brainBenefitDetail:
      'Sweet fizzy drinks are easy to gulped down in seconds. Raw apple cider vinegar, fresh ginger, and lime give a crisp, grown-up bite that encourages slow sipping while you cook.',
    chefTip:
      'Serve it in a heavy tumbler or stemmed glass with plenty of ice—keeping an end-of-shift ritual helps mark the transition home.',
    ingredients: [
      {
        name: 'Raw Apple Cider Vinegar (with the Mother)',
        quantity: '1.5 tbsp (25ml)',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.15,
      },
      {
        name: 'Fresh Ginger Root (grated) or Fiery Ginger Beer 0.0%',
        quantity: '1 tsp / 100ml',
        aisle: 'Drinks',
        estimatedPriceGBP: 0.25,
      },
      {
        name: 'Fresh Lime (juice + wedge) & Flaky Sea Salt',
        quantity: '1 whole lime',
        aisle: 'Produce',
        estimatedPriceGBP: 0.2,
      },
      {
        name: 'Chilled Sparkling Water',
        quantity: '200ml',
        aisle: 'Drinks',
        estimatedPriceGBP: 0.05,
      },
    ],
    method: [
      'Fill a heavy glass with ice cubes.',
      'Pour in the apple cider vinegar, freshly squeezed lime juice, grated ginger (or ginger beer 0.0%), and a tiny pinch of sea salt.',
      'Top with cold sparkling water, stir once, and garnish with a lime wedge.',
    ],
  },
  {
    id: 'recipe-harissa-traybake',
    title: 'Chef’s One-Pan Harissa Chicken, Sweet Potato & Broccoli Traybake',
    subtitle:
      'Sunday meal-prep staple: four portions of complex carbs and protein with one roasting tin to wash.',
    prepTimeMins: 15,
    costPerServingGBP: 2.15,
    categories: ['15-Min Shift Meals', 'Dopamine Boosters', 'Gut Repair'],
    macros: {
      calories: 565,
      proteinG: 42,
      carbsG: 48,
      fatsG: 21,
    },
    brainBenefitTitle: 'Steady evening energy and batch-prep convenience',
    brainBenefitDetail:
      'Having four portions ready in the fridge removes decision fatigue after late shifts so you always have a warm meal ready in minutes.',
    chefTip:
      'Use skin-on chicken thighs rather than breast—they cost less in UK supermarkets and stay tender when reheated.',
    ingredients: [
      {
        name: 'British Chicken Thighs (pack of 6-8)',
        quantity: '2 thighs per portion',
        aisle: 'Protein',
        estimatedPriceGBP: 1.15,
      },
      {
        name: 'Sweet Potatoes, cubed into 2cm chunks (skin on)',
        quantity: '200g',
        aisle: 'Produce',
        estimatedPriceGBP: 0.35,
      },
      {
        name: 'Tenderstem or Crown Broccoli florets',
        quantity: '120g',
        aisle: 'Produce',
        estimatedPriceGBP: 0.35,
      },
      {
        name: 'Rose Harissa Paste, Cumin & Olive Oil',
        quantity: '1.5 tbsp',
        aisle: 'Tins & Dry',
        estimatedPriceGBP: 0.3,
      },
    ],
    method: [
      'Preheat oven to 200°C fan. Toss the cubed sweet potatoes and chicken thighs in a large roasting tin with harissa paste, cumin, salt, and 1 tbsp olive oil.',
      'Sit the chicken thighs skin-side up on top of the potatoes and roast for 25 minutes.',
      'Arrange the broccoli florets around the chicken and roast for a final 10 minutes until charred at the edges.',
    ],
  },
];

export const DEFAULT_SHOPPING_LIST: ShoppingIngredient[] = [
  {
    id: 'shop-1',
    name: 'British Chicken Thighs (1kg pack)',
    aisle: 'Protein',
    estimatedPriceGBP: 3.29,
    quantity: '1 pack',
    checked: true,
    fromRecipe: 'Harissa Traybake',
  },
  {
    id: 'shop-2',
    name: 'British Beef Rump / Bavette Steaks (2 pack)',
    aisle: 'Protein',
    estimatedPriceGBP: 4.69,
    quantity: '2 steaks',
    checked: true,
    fromRecipe: 'Ironclad Steak Skillet',
  },
  {
    id: 'shop-3',
    name: 'Free-Range British Eggs (15 pack)',
    aisle: 'Protein',
    estimatedPriceGBP: 2.99,
    quantity: '15 eggs',
    checked: false,
  },
  {
    id: 'shop-4',
    name: 'Full-Fat Greek Yoghurt (1kg tub)',
    aisle: 'Protein',
    estimatedPriceGBP: 1.89,
    quantity: '1 tub',
    checked: false,
    fromRecipe: 'Recovery Oats',
  },
  {
    id: 'shop-5',
    name: 'Tinned Scottish Mackerel in Olive Oil (x3)',
    aisle: 'Tins & Dry',
    estimatedPriceGBP: 2.97,
    quantity: '3 tins',
    checked: true,
    fromRecipe: 'Mackerel Power Bowl',
  },
  {
    id: 'shop-6',
    name: 'Chickpeas & Cannellini Beans (x4 tins)',
    aisle: 'Tins & Dry',
    estimatedPriceGBP: 1.96,
    quantity: '4 tins',
    checked: false,
    fromRecipe: 'Mackerel Power Bowl',
  },
  {
    id: 'shop-7',
    name: 'Scottish Porridge Oats (1kg bag)',
    aisle: 'Tins & Dry',
    estimatedPriceGBP: 0.9,
    quantity: '1kg',
    checked: true,
    fromRecipe: 'Recovery Oats',
  },
  {
    id: 'shop-8',
    name: 'Raw Cacao Powder, Tahini & Rose Harissa Paste',
    aisle: 'Tins & Dry',
    estimatedPriceGBP: 4.85,
    quantity: 'Store cupboard set',
    checked: false,
  },
  {
    id: 'shop-9',
    name: 'Raw Apple Cider Vinegar (with the Mother)',
    aisle: 'Tins & Dry',
    estimatedPriceGBP: 1.99,
    quantity: '500ml bottle',
    checked: true,
    fromRecipe: 'Witching Hour Spritz',
  },
  {
    id: 'shop-10',
    name: 'Cavolo Nero, Broccoli Crowns & Spinach',
    aisle: 'Produce',
    estimatedPriceGBP: 2.65,
    quantity: '3 bags',
    checked: false,
    fromRecipe: 'Ironclad Steak Skillet',
  },
  {
    id: 'shop-11',
    name: 'Sweet Potatoes (1kg), Red Onions & Garlic Bulb',
    aisle: 'Produce',
    estimatedPriceGBP: 2.35,
    quantity: 'Weekly base',
    checked: false,
    fromRecipe: 'Harissa Traybake',
  },
  {
    id: 'shop-12',
    name: 'Fresh Limes (x5), Lemons (x4) & Fresh Ginger Root',
    aisle: 'Produce',
    estimatedPriceGBP: 2.4,
    quantity: 'Citrus pack',
    checked: false,
    fromRecipe: 'Witching Hour Spritz',
  },
  {
    id: 'shop-13',
    name: 'Frozen Forest Berries (500g) & Walnuts',
    aisle: 'Produce',
    estimatedPriceGBP: 3.5,
    quantity: '1 bag + 1 pack',
    checked: false,
    fromRecipe: 'Recovery Oats',
  },
  {
    id: 'shop-14',
    name: 'Sparkling Water (4x 2L) & Fiery Ginger Beer 0.0%',
    aisle: 'Drinks',
    estimatedPriceGBP: 3.2,
    quantity: 'Multipack',
    checked: false,
    fromRecipe: 'Witching Hour Spritz',
  },
];

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'playbook-1',
    number: 1,
    title: 'The First 30 Days Sobriety Blueprint',
    subtitle:
      'Practical habits and routines for navigating the early days, evening cravings, and building steady momentum.',
    readTime: '8 min read',
    category: 'Sobriety',
    summary:
      'The early weeks of cutting out alcohol are easier when you prepare for the 5pm transition home, protect your meals and hydration, and know when to seek medical advice.',
    keyTakeaways: [
      'Early days: Focus on hydration, regular meals before 5pm, and changing your post-work routine.',
      'Week one and two: Expect sugar cravings or unsettled sleep while routines adjust—keep complex carbs and alcohol-free swaps ready.',
      'Medical safety: Never stop suddenly without medical advice if you have been drinking heavily every day; contact NHS 111 or your GP.',
    ],
    sections: [
      {
        heading: 'Section 1: Preparing for the 5pm transition and early days',
        badge: 'EARLY DAYS',
        body: [
          'The hardest hour of the day is often the transition between finishing work and walking through your front door. Fatigue, hunger, and habit all collide at once.',
          'Rather than relying on willpower on an empty stomach, focus on changing your physical state immediately after your shift.',
        ],
        actionPoints: [
          'Eat a protein and complex-carbohydrate meal before or straight after finishing work so hunger does not amplify cravings.',
          'Keep a cold alcohol-free drink (such as the Witching Hour ginger and lime spritz) ready in the fridge.',
          'Important medical note: If you have been drinking heavily every day and experience shaking, sweating, confusion, or a racing heart, seek urgent medical guidance from NHS 111 or your GP before stopping suddenly.',
        ],
      },
      {
        heading: 'Section 2: Navigating sleep routines and sugar cravings',
        badge: 'FIRST FORTNIGHT',
        body: [
          'As you cut out alcohol, it is common to notice temporary changes in sleep patterns or stronger cravings for sweet foods in the evening, because your body was used to liquid calories.',
          'Avoid pairing early sobriety with a restrictive crash diet. Eating hearty, regular meals keeps your energy and mood much steadier.',
        ],
        actionPoints: [
          'Prep Overnight Spiced Cacao & Walnut Oats so breakfast is ready before early shifts.',
          'Plan your first Friday evening ahead of time—change your route home and book a clear Saturday morning activity.',
        ],
      },
      {
        heading: 'Section 3: Building a sustainable 30-day rhythm',
        badge: 'MOMENTUM',
        body: [
          'Once you string together a couple of weeks, watch out for the quiet voice that says, "You have proved you can stop, so one or two pints tonight will be fine."',
          'Before acting on an impulse, play the tape forward to 7:00am tomorrow morning and think about how you want to feel when your alarm goes off.',
        ],
        actionPoints: [
          'Log your daily check-in inside The Forge each evening to track what triggers showed up and what helped.',
          'Keep stacking earned Iron Milestones—even if you ever face a setback, your earned badges and lessons remain yours.',
        ],
      },
    ],
  },
  {
    id: 'playbook-2',
    number: 2,
    title: 'The £40 Mood-Food Supermarket Cheat Sheet',
    subtitle:
      'How to walk into any UK Aldi, Lidl, or Tesco with £40 and walk out with a week of practical recovery meals.',
    readTime: '6 min read',
    category: 'Nutrition',
    summary:
      'Skipping meals on shift leaves your blood sugar on the floor by 5pm. Here is how a working chef builds a £40 weekly basket of quick, nutrient-dense meals.',
    keyTakeaways: [
      'Prioritise tinned oily fish (mackerel or sardines) and chicken thighs over expensive cuts.',
      'Keep fibre-rich beans, oats, and Greek yoghurt on hand for steady energy across long shifts.',
      'Keep 12-minute skillet ingredients ready so a late shift never forces a takeaway and a four-pack.',
    ],
    sections: [
      {
        heading: 'Section 1: Why regular meals protect your evening resolve',
        badge: 'NUTRITION BASICS',
        body: [
          'Heavy drinking and long shifts often go hand in hand with skipped meals. When your blood glucose drops late in the afternoon, irritability and cravings spike sharply.',
          'Building plates around protein, slow-release carbohydrates, leafy greens, and healthy fats takes the physical edge off hunger within 15 minutes.',
        ],
        actionPoints: [
          'Swap £15 takeaways for the £3.45 Ironclad Steak & Cavolo Nero Skillet.',
          'Keep three tins of Scottish mackerel in olive oil in your cupboard for a 10-minute meal under £2.',
        ],
      },
      {
        heading: 'Section 2: The Chef’s £40 Aldi / Tesco Basket Breakdown',
        badge: 'BUDGET LIST',
        body: [
          'Protein (£12.86): 1kg Chicken Thighs (£3.29), 2x Beef Rump/Bavette Steaks (£4.69), 15 Free-Range Eggs (£2.99), 1kg Full-Fat Greek Yoghurt (£1.89).',
          'Tins & Dry Store (£12.67): 3x Tinned Mackerel (£2.97), 4x Chickpeas/Cannellini Beans (£1.96), 1kg Porridge Oats (£0.90), Raw Cacao, Tahini & Harissa (£4.85), Raw ACV (£1.99).',
          'Produce & Drinks (£14.10): Cavolo Nero, Broccoli & Spinach (£2.65), Sweet Potatoes, Onions & Garlic (£2.35), Limes, Lemons & Ginger (£2.40), Frozen Berries & Walnuts (£3.50), Sparkling Water & Ginger Beer 0.0% (£3.20).',
          'Total Weekly Spend: £39.63—covering a full week of meals and 5pm alcohol-free spritzes.',
        ],
        actionPoints: [
          'Open Fuel the Mind and copy the shopping list to your phone notes before your weekly shop.',
        ],
      },
    ],
  },
  {
    id: 'playbook-3',
    number: 3,
    title: 'The Matchday & UK Pub Survival Guide',
    subtitle:
      'Tactical game plan for football Saturdays, work socials, weddings, UK 0.0% tap beers, and the clean exit strategy.',
    readTime: '7 min read',
    category: 'Social & Pub',
    summary:
      'In the UK, socialising often centres on the pub and the football. You do not need to lock yourself away—you just need a clear plan before you walk through the door.',
    keyTakeaways: [
      'First Pint Rule: Decide your exact 0.0% order before your foot hits the pub carpet.',
      'Opt Out of Rounds: Buy your own drinks from minute one so you are never trapped in a six-pint round.',
      'The 9:30pm Exit: Leave when stories start repeating—you get the best part of the catch-up and wake up fresh on Sunday.',
    ],
    sections: [
      {
        heading: 'Section 1: Word-for-word UK pub scripts',
        badge: 'SOCIAL SCRIPTS',
        body: [
          'When a mate says: "Go on, just have one pint, what are you on Guinness Zero for?"',
          'Script A (The Early Start Card): "Got an early start tomorrow mate and I’m on a fitness block—feeling too sharp to wreck it tonight. Get yourself a proper one."',
          'Script B (The Direct Card): "Taking a proper break from the booze mate—sleeping well and saving a fortune. This Guinness 0.0 actually hits the spot."',
          'Keep it brief, never apologise, and immediately pivot the conversation back to the match or work.',
        ],
        actionPoints: [
          'Keep a cold glass in your hand at all times—people only offer to buy you a drink when your hands are empty.',
        ],
      },
      {
        heading: 'Section 2: Best UK 0.0% tap swaps and the clean exit',
        badge: 'MATCHDAY TACTICS',
        body: [
          'Top UK Pub Swaps: Guinness 0.0, Lucky Saint 0.5% Unfiltered Lager (on draught in over 1,000 UK pubs), Mash Gang craft pale, or soda water with fresh lime and bitters/ginger.',
          'Around pint three or four, pub volume rises and people start telling the same story twice. That is your cue to say cheers, head home cleanly, and enjoy a clear Sunday morning.',
        ],
        actionPoints: [
          'Always arrange your own transport home so you are never waiting on someone who is drinking.',
        ],
      },
    ],
  },
  {
    id: 'playbook-4',
    number: 4,
    title: 'Interactive HALT & CBT Trigger Worksheet',
    subtitle:
      'Spot the trigger, check Hungry/Angry/Lonely/Tired states, and write a balanced reframe in 90 seconds.',
    readTime: 'Interactive tool',
    category: 'CBT & Mindset',
    summary:
      'Most cravings build up hours earlier through unchecked HALT states (Hungry, Angry, Lonely, Tired) and automatic permissive thoughts. Use this worksheet to slow down and reframe the urge.',
    keyTakeaways: [
      'Check HALT first: Hunger and exhaustion often masquerade as an urge to drink.',
      'Separate the external event (a stressful shift) from the automatic thought ("I need a drink to switch off").',
      'Write a balanced reframe and choose one immediate action for the next 15 minutes.',
    ],
    isInteractiveCBT: true,
    sections: [
      {
        heading: 'Section 1: Breaking the Trigger → Thought → Craving loop',
        badge: 'CBT PROTOCOL',
        body: [
          '1. Trigger Event: A relentless four-hour service, a difficult client call, or walking into a quiet flat after work.',
          '2. HALT Vulnerability: You have not eaten properly since midday (Hungry) and you are running on five hours of sleep (Tired).',
          '3. Automatic Thought: "I have grafted all day, I need a couple of pints just to bring my shoulders down."',
          '4. Balanced Reframe: "My body is exhausted and hungry. Alcohol only borrows calm from tomorrow. A proper hot meal, a cold ginger spritz, and an early night will actually help me recover."',
        ],
        actionPoints: [
          'Complete the interactive HALT & CBT worksheet below whenever a craving feels strong.',
        ],
      },
    ],
  },
  {
    id: 'playbook-5',
    number: 5,
    title: 'Playbook 5 (B2B): The UK Workplace Sober-Inclusive & Mental Fitness Policy',
    subtitle:
      'Plug-and-play HR and leadership charter for UK SMEs, hospitality groups, construction sites, and shift workplaces.',
    readTime: '10 min read • B2B Charter',
    category: 'B2B Policy',
    summary:
      'Alcohol-related absence and burnout cost UK employers billions each year. This practical charter helps teams build sober-inclusive socials and early-support pathways.',
    keyTakeaways: [
      'Confidential early support: Staff who ask for help early are signposted to support without stigma.',
      'Sober-inclusive socials: Company events stock quality 0.0% options alongside standard drinks.',
      'DocuSeal ready: Can be adopted and signed by UK directors and team leads via the workplace portal.',
    ],
    isB2BPolicy: true,
    sections: [
      {
        heading: 'Section 1: Purpose and leadership commitment',
        badge: 'CHARTER CLAUSE 1',
        body: [
          'Our organisation recognises that high-pressure environments—especially shift work, hospitality, construction, and growing SMEs—carry elevated risks of burnout and alcohol harm.',
          'We commit to a workplace culture where mental fitness, proper rest, and sobriety are actively respected and supported.',
        ],
      },
      {
        heading: 'Section 2: The sober-inclusive social and shift standard',
        badge: 'CHARTER CLAUSE 2',
        body: [
          '1. Equal 0.0% Provision: Every company-funded social, client dinner, or post-shift gathering stocks quality 0.0% beer or adult soft drinks at equal visibility.',
          '2. Zero Peer Pressure: Pressuring a colleague about why they are not drinking is contrary to our team code of conduct.',
          '3. Shift Nutrition & Hydration: Where teams work late or double shifts, management ensures access to nutritious staff meals and water.',
        ],
      },
      {
        heading: 'Section 3: Confidential early-support pathway',
        badge: 'CHARTER CLAUSE 3',
        body: [
          'Any team member experiencing burnout, mental health distress, or alcohol dependency who voluntarily asks for support will be signposted to confidential occupational support and UK lifelines.',
        ],
        actionPoints: [
          'Deploy this policy across your team via the B2B workplace portal and trigger a DocuSeal sign-off pack.',
        ],
      },
    ],
  },
];

export const DEFAULT_CBT_ENTRIES: CBTWorksheetEntry[] = [
  {
    id: 'cbt-1',
    createdAt: '13 Nov, 16:50',
    haltStates: ['Hungry', 'Tired'],
    triggerSituation:
      'Friday 4:50pm after a 10-hour prep and stocktake shift. Team heading to the pub across the road.',
    cravingRating: 8,
    automaticThought:
      'I have grafted non-stop all week, one or two pints will take the edge off my backache and stress.',
    cognitiveDistortion:
      'Short-term magnification ("Just two pints" rarely stays two on a Friday when starving).',
    ironcladReframe:
      'I am hungry and tired, not in need of alcohol. If I go home, cook a steak skillet, and drink a cold ginger spritz, I will wake up at 7am Saturday £60 richer and clear-headed.',
    actionTaken:
      'Completed 60s Box Breathing in the car, drove straight home, cooked the 12-minute steak skillet.',
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
    description:
      'Immediate, confidential, judgment-free listening support whenever things feel overwhelming at 3am or after a shift.',
    badge: 'Free 24/7 call',
  },
  {
    id: 'life-calm',
    name: 'CALM (Campaign Against Living Miserably)',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '0800585858',
    website: 'https://www.thecalmzone.net',
    hours: '5:00pm – Midnight daily',
    description:
      'Practical, no-nonsense UK helpline and webchat supporting anyone struggling with life or crisis.',
    badge: '5pm–Midnight',
  },
  {
    id: 'life-shout',
    name: 'SHOUT 85258 Crisis Text Line',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '85258',
    textNumber: 'Text SHOUT to 85258',
    website: 'https://giveusashout.org',
    hours: '24/7 free text support',
    description:
      'When you cannot speak out loud—on a noisy commute, break room, or shared house—text SHOUT to 85258 for free 24/7 support.',
    badge: 'Text 85258',
  },
  {
    id: 'life-nhs111',
    name: 'NHS 111 Mental Health & Urgent Medical Option',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '111',
    website: 'https://111.nhs.uk',
    hours: '24/7 urgent NHS triage',
    description:
      'Dial 111 for urgent NHS mental health support or medical advice if you are worried about physical alcohol withdrawal symptoms.',
    badge: 'NHS 111',
  },
  {
    id: 'life-mind',
    name: 'Mind Infoline UK',
    category: '24/7 UK Crisis & Emotional Support',
    phone: '03001233393',
    website: 'https://www.mind.org.uk',
    hours: 'Mon–Fri, 9:00am – 6:00pm',
    description:
      'Guidance on UK mental health rights at work, burnout recovery, and local peer support groups.',
    badge: 'Work & rights',
  },
  {
    id: 'life-hospitality-action',
    name: 'Hospitality Action',
    category: 'Industry-Specific Charities',
    phone: '08088020282',
    website: 'https://www.hospitalityaction.org.uk',
    hours: '24/7 hospitality assistance line',
    description:
      'Dedicated helpline for UK chefs, kitchen porters, bar staff, and hospitality managers facing addiction, burnout, or financial difficulty.',
    badge: 'Chefs & kitchens',
  },
  {
    id: 'life-lighthouse',
    name: 'The Lighthouse Construction Industry Charity',
    category: 'Industry-Specific Charities',
    phone: '03456051956',
    textNumber: 'Text HARDHAT to 85258',
    website: 'https://www.lighthouseclub.org',
    hours: '24/7 construction & trades helpline',
    description:
      'Built for UK site workers, electricians, plumbers, and sub-contractors. Emotional, physical, and financial wellbeing support.',
    badge: 'Trades & sites',
  },
  {
    id: 'life-smart',
    name: 'SMART Recovery UK',
    category: 'Sobriety & Recovery Communities',
    phone: '01463729548',
    website: 'https://smartrecovery.org.uk',
    hours: 'Daily online & local UK meetings',
    description:
      'Evidence-based, CBT-informed recovery meetings across the UK with practical tools for managing cravings.',
    badge: 'CBT meetings',
  },
  {
    id: 'life-alcohol-change',
    name: 'Alcohol Change UK & Drinkline',
    category: 'Sobriety & Recovery Communities',
    phone: '03001231110',
    website: 'https://alcoholchange.org.uk',
    hours: 'Mon–Fri 9am–8pm, Weekends 11am–4pm',
    description:
      'Free, confidential UK helpline and directory for anyone concerned about their own or a loved one’s drinking.',
    badge: 'UK sobriety hub',
  },
  {
    id: 'life-clubsoda',
    name: 'Club Soda (Mindful Drinking Movement)',
    category: 'Sobriety & Recovery Communities',
    website: 'https://joinclubsoda.com',
    hours: 'Online & London tasting room',
    description:
      'The UK’s mindful drinking community—courses, sober socials, and a wide curation of 0.0% drinks.',
    badge: 'Mindful drinking',
  },
  {
    id: 'life-aa',
    name: 'Alcoholics Anonymous Great Britain',
    category: 'Sobriety & Recovery Communities',
    phone: '08009177650',
    website: 'https://www.alcoholics-anonymous.org.uk',
    hours: '24/7 national helpline',
    description:
      'Free in-person and online meetings every day across every UK postcode.',
    badge: '24/7 fellowship',
  },
  {
    id: 'life-matchday-zones',
    name: 'UK Stadium Sober Matchday & 0.0% Tap Finder',
    category: 'Sober Matchday & 0.0% Finder',
    website: 'https://luckysaint.co/pages/find-lucky-saint',
    hours: 'Matchday Saturdays & midweek fixtures',
    description:
      'London Stadium, Emirates, Tottenham Hotspur Stadium, Villa Park & Portman Road pour Guinness 0.0 / Heineken 0.0 on concourses; pair with the Lucky Saint UK Tap Map.',
    badge: 'Stadium & pub 0.0%',
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
      'Just wrapped a 220-cover Sunday roast service. Five years ago, I’d already be three pints deep in the staff yard with my lower back aching. Tonight? Checked the fridge, cooked the 12-minute Steak & Cavolo Nero Skillet, and poured a fiery ginger ACV spritz over ice. To every chef, KP, and shift worker finishing late tonight: get proper protein in you before your boots come off.',
    ironCount: 48,
    userSentIron: false,
    replies: [
      {
        id: 'rep-1',
        author: 'SousChef_Liam',
        roleBadge: 'Sous Chef • Bristol',
        content:
          'Needed to read this right as we finished scrubbing down the pass mate. Ordering a lime and soda and heading straight home.',
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
      'First proper away day at the football yesterday completely 0.0%. Used Playbook 3—bought my own Guinness 0.0 from the start so I wasn’t locked into an eight-man round, remembered the whole second half, and drove four of the lads home safely. Saved at least £95 in one afternoon.',
    ironCount: 39,
    userSentIron: true,
    replies: [
      {
        id: 'rep-2',
        author: 'ClaretAndBlue_Stu',
        roleBadge: 'Electrician • Essex',
        content:
          'Massive result Mark! Waking up Sunday morning clear-headed after a matchday is an unbeatable feeling.',
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
      'Rolled out Playbook 5 (The Sober-Inclusive Workplace Charter) across our 38 warehouse and transport staff this week. Replaced the Friday beer fridge with half Lucky Saint and Mash Gang 0.0% and stocked proper shift snacks. Two drivers quietly pulled me aside to say thank you.',
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
      'Day 3 here. Used the Craving Reset button at 5pm today after my shift, did 60 seconds of Box Breathing, and made the Mackerel & Chickpea bowl. Holding the line tonight.',
    ironCount: 74,
    userSentIron: false,
    replies: [
      {
        id: 'rep-3',
        author: 'Dan_HeadChef_E13',
        roleBadge: 'Founder & Head Chef',
        content:
          'Proud of you Callum—keep stacking one day at a time and make sure you get a proper meal in tonight.',
        timestamp: '7 hours ago',
      },
    ],
  },
];
