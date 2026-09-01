import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  Dumbbell,
  History as HistoryIcon,
  TrendingUp,
  Flame,
  Trophy,
  Plus,
  Check,
  X,
  Timer,
  ChevronDown,
  ChevronUp,
  Utensils,
  ShoppingCart,
  Trash2,
} from "lucide-react";

/* ---------------------------------------------------------------------
   THEME
--------------------------------------------------------------------- */
const COLORS = {
  base: "#0C0F14",
  surface: "#151A21",
  surfaceAlt: "#1C222B",
  border: "#262E38",
  blue: "#2F8FFF",
  blueDim: "#173A63",
  green: "#33D17A",
  amber: "#FFB020",
  textPrimary: "#F2F5F8",
  textSecondary: "#8B96A5",
  textFaint: "#59636F",
};

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap";

// Distinct color per muscle group, used for tags, volume bars, and trend lines
const MUSCLE_COLORS = {
  Glutes: "#FF5C5C",
  Hamstrings: "#FF9142",
  Quads: "#FFD43B",
  Calves: "#A8E063",
  Core: "#2FD9C4",
  Back: "#9B7BFF",
  Shoulders: "#FF6FB5",
  Arms: "#4FB8FF",
};
function muscleColor(name) {
  return MUSCLE_COLORS[name] || COLORS.textFaint;
}

// One quote surfaces per program week, cycling if the program runs longer
// than the list.
const WEEKLY_QUOTES = [
  "Strong glutes, stacked ribs, patient reps — that's the whole plan.",
  "Every set you finish tonight is a vote for the body you're building.",
  "Posture isn't fixed in a day. It's fixed in three sessions a week, for months.",
  "Soft knees, steady hips — small cues, real change.",
  "You don't have to feel motivated. You just have to show up and hit the first set.",
  "Progress lives in the third rep, not the first.",
  "Your hips got here slowly. They'll get corrected slowly too — keep going.",
  "The weight on the bar matters less than the position you hold it in.",
  "Consistency beats intensity — three solid sessions beat one heroic one.",
  "Tonight's workout is 40 minutes. The results are the next three months.",
];
function getWeeklyQuote(referenceDate) {
  const programStart = new Date("2026-09-01T00:00:00");
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekIndex = Math.max(0, Math.floor((startOfWeek(referenceDate) - startOfWeek(programStart)) / msPerWeek));
  return {
    weekNumber: weekIndex + 1,
    quote: WEEKLY_QUOTES[weekIndex % WEEKLY_QUOTES.length],
  };
}

/* ---------------------------------------------------------------------
   PROGRAM DATA
--------------------------------------------------------------------- */
const PROGRAM = {
  startDate: "Sep 1, 2026",
  endDate: "Nov 24, 2026",
  currentWeightKg: 58,
  goalWeightKg: 59,
  wallTestCurrent: "Fist fits snugly",
  wallTestGoal: "Hand fits snugly",
};

// Reference "today" — keeps dashboard stats stable regardless of device clock
const TODAY = new Date();

const MUSCLE_GROUPS = [
  "Glutes",
  "Hamstrings",
  "Quads",
  "Back",
  "Shoulders",
  "Arms",
  "Core",
  "Calves",
];

// Straight sets, one exercise at a time. Compound lifts dropped from 4 to 3
// sets, and rest between sets is kept tight (45s for accessories/core, 60s
// for the heavier compound lifts) — that's what gets a 7-exercise session
// down to 40-45 minutes at a 9pm start without alternating exercises.
const WORKOUT_PLAN = [
  {
    id: "dayA",
    shortName: "Day 1: Lower Body",
    name: "Lower Body — Posterior Chain",
    focus: "Glutes · hamstrings · quads",
    estMinutes: "40-42 min",
    warmup: [
      "5 min easy stationary bike",
      "Hip circles — 10 each direction",
      "Leg swings (front-to-back) — 10 each leg",
      "Bodyweight glute bridge — 2 x 10",
    ],
    cooldown: [
      "Kneeling hip flexor stretch — 30s each side",
      "Seated hamstring stretch — 30s each side",
      "Child's pose — 45s",
    ],
    exercises: [
      {
        id: "hipThrust",
        name: "Barbell Hip Thrust",
        muscleGroup: "Glutes",
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
        cue: "Ribs down, chin tucked — squeeze glutes hard at the top, don't overarch the low back.",
      },
      {
        id: "backSquat",
        name: "Barbell Back Squat",
        muscleGroup: "Quads",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 60,
        cue: "Soft knees on the way up, neutral pelvis — stop the squeeze right before lockout.",
      },
      {
        id: "dbRDL",
        name: "Dumbbell Romanian Deadlift",
        muscleGroup: "Hamstrings",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        cue: "Hinge from the hips, soft knees, neutral spine — feel the stretch in the hamstrings.",
      },
      {
        id: "bulgarianSplit",
        name: "Bulgarian Split Squat",
        muscleGroup: "Glutes",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 60,
        cue: "Torso slightly forward, back knee tracks down not forward — even weight through the front foot.",
      },
      {
        id: "calfRaise",
        name: "Standing Calf Raise",
        muscleGroup: "Calves",
        targetSets: 3,
        targetReps: 15,
        restSeconds: 45,
        cue: "Soft knees, full stretch at the bottom, pause at the top.",
      },
      {
        id: "birdDog",
        name: "Bird Dog",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 45,
        cue: "Ribs down, brace before you reach — no low-back arch as the arm/leg extend.",
      },
      {
        id: "deadBug",
        name: "Dead Bug",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 12,
        restSeconds: 45,
        cue: "Low back flat on the mat the entire rep — move slow and controlled.",
      },
    ],
  },
  {
    id: "dayB",
    shortName: "Day 2: Upper Body",
    name: "Upper Body + Core Stability",
    focus: "Back · shoulders · arms · core",
    estMinutes: "38-40 min",
    warmup: [
      "5 min incline treadmill walk",
      "Arm circles — 10 forward, 10 back",
      "Band pull-aparts — 2 x 15",
      "Thoracic rotations — 8 each side",
    ],
    cooldown: [
      "Doorway chest stretch — 30s each side",
      "Overhead lat stretch — 30s each side",
      "Child's pose — 45s",
    ],
    exercises: [
      {
        id: "latPulldown",
        name: "Lat Pulldown",
        muscleGroup: "Back",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        cue: "Ribs down, pull to the collarbone — no leaning back to muscle the weight down.",
      },
      {
        id: "dbShoulderPress",
        name: "Dumbbell Shoulder Press",
        muscleGroup: "Shoulders",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        cue: "Ribs stacked over hips — resist the urge to arch the low back as arms go overhead.",
      },
      {
        id: "seatedRow",
        name: "Seated Cable Row",
        muscleGroup: "Back",
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
        cue: "Neutral pelvis on the bench, squeeze shoulder blades together, not just arms pulling.",
      },
      {
        id: "bicepCurl",
        name: "Dumbbell Bicep Curl",
        muscleGroup: "Arms",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 45,
        cue: "Soft knees, ribs down — no swinging the torso to help the curl.",
      },
      {
        id: "tricepPushdown",
        name: "Cable Triceps Pushdown",
        muscleGroup: "Arms",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 45,
        cue: "Elbows pinned to your sides, neutral pelvis — resist leaning into the cable.",
      },
      {
        id: "pallofPress",
        name: "Pallof Press",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 45,
        cue: "Brace and resist rotation — the goal is stillness through the trunk, not speed.",
      },
      {
        id: "plank",
        name: "Plank",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 45,
        isHold: true,
        restSeconds: 45,
        cue: "Ribs down, glutes squeezed, neutral pelvis — imagine tucking a coin between your cheeks.",
      },
    ],
  },
  {
    id: "dayC",
    shortName: "Day 3: Full Body",
    name: "Full Body — Unilateral & Stability",
    focus: "Balanced full-body · single-leg control",
    estMinutes: "38-40 min",
    warmup: [
      "5 min elliptical, easy pace",
      "Walking lunges (bodyweight) — 8 each leg",
      "Lateral band walks — 10 steps each direction",
    ],
    cooldown: [
      "Figure-4 glute stretch — 30s each side",
      "Standing quad stretch — 30s each side",
      "Cat-cow — 8 reps",
    ],
    exercises: [
      {
        id: "singleLegRDL",
        name: "Smith Machine Single-Leg RDL",
        muscleGroup: "Hamstrings",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 60,
        cue: "Soft standing knee, hips square — think 'closing a car door' with the lifted heel.",
      },
      {
        id: "gobletSquat",
        name: "Goblet Squat",
        muscleGroup: "Quads",
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
        cue: "Soft knees tracking over toes, ribs down at the bottom of the squat.",
      },
      {
        id: "cableHamCurl",
        name: "Standing Cable Hamstring Curl",
        muscleGroup: "Hamstrings",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 45,
        cue: "Ankle cuff on the functional trainer, soft standing knee — curl slow, control the return, don't swing.",
      },
      {
        id: "singleArmPulldown",
        name: "Single-Arm Lat Pulldown",
        muscleGroup: "Back",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
        cue: "Resist rotating the torso as you pull — brace through the core like a Pallof press.",
      },
      {
        id: "bridgeMarch",
        name: "Glute Bridge March",
        muscleGroup: "Glutes",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 45,
        cue: "Hips stay level and high the whole set — no dipping as you lift each knee.",
      },
      {
        id: "sidePlank",
        name: "Side Plank",
        muscleGroup: "Core",
        targetSets: 3,
        targetReps: 30,
        isHold: true,
        restSeconds: 45,
        cue: "Stack hips and shoulders, ribs down — straight line from ear to ankle.",
      },
      {
        id: "wallSit",
        name: "Wall Sit",
        muscleGroup: "Quads",
        targetSets: 2,
        targetReps: 30,
        isHold: true,
        restSeconds: 45,
        cue: "Low back flat against the wall the entire hold — no arching to relieve the burn.",
      },
    ],
  },
];

const EXERCISE_LIBRARY = WORKOUT_PLAN.flatMap((d) => d.exercises).reduce(
  (acc, ex) => {
    if (!acc.find((e) => e.id === ex.id)) acc.push(ex);
    return acc;
  },
  []
);
// A few bonus accessory options for the "add exercise" picker
EXERCISE_LIBRARY.push(
  {
    id: "gluteKickback",
    name: "Cable Glute Kickback",
    muscleGroup: "Glutes",
    targetSets: 3,
    targetReps: 12,
    restSeconds: 45,
    cue: "Soft standing knee, ribs down — squeeze the glute, not the low back.",
  },
  {
    id: "facepull",
    name: "Cable Face Pull",
    muscleGroup: "Shoulders",
    targetSets: 3,
    targetReps: 12,
    restSeconds: 45,
    cue: "Pull to eye level, thumbs back — helps counter rounded shoulders.",
  }
);

/* ---------------------------------------------------------------------
   MEAL PLAN DATA
   Targets derived from profile: 169cm / 58kg / lightly active, mid-20s-30s.
   Mifflin-St Jeor BMR ≈ 1,325 kcal → TDEE ≈ 1,850-1,900 kcal/day at
   "lightly active" + 3x/week training. Goal is a slow lean gain
   (58kg → 59kg over 3 months), so target a modest surplus rather than
   a big bulk. Protein set high enough to support muscle synthesis at
   a slow gain rate.

   v2 notes: banana + peanut butter removed (disliked) and replaced with
   frozen berries + honey; lentil recipes cut from 4 uses/week to 2
   (kept in rotation, not deleted, so the ideas are still here for later);
   ground beef added across lunch/dinner/pizza since it's a household
   staple; a mushroom risotto, a Saturday pizza night, and a Sunday
   sushi night were added as requested. Budget raised to $100 CAD.
--------------------------------------------------------------------- */
const MEAL_TARGETS = {
  calorieRange: "2,000–2,100 kcal",
  proteinMin: 110, // grams/day minimum
};

const MEAL_TYPE_COLORS = {
  Breakfast: "#FFD43B",
  Lunch: "#4FB8FF",
  Dinner: "#9B7BFF",
  Snack: "#2FD9C4",
};

const WEEKLY_MEAL_PLAN = [
  {
    day: "Monday",
    meals: [
      { type: "Breakfast", name: "Greek Yogurt Berry Bowl", description: "Plain Greek yogurt, thawed mixed berries, a drizzle of honey, a sprinkle of GF oats.", calories: 400, protein: 28, prepTime: "3 min" },
      { type: "Lunch", name: "Chicken & Rice Power Bowl", description: "Batch-cooked chicken thigh, rice, mixed frozen veg.", calories: 610, protein: 54, prepTime: "5 min (reheat)" },
      { type: "Dinner", name: "Baked Chicken Thigh & Roasted Potatoes", description: "Oven-baked chicken thigh, roasted potatoes, steamed frozen veg.", calories: 764, protein: 61, prepTime: "30 min (mostly oven)" },
      { type: "Snack", name: "Cottage Cheese & Berries", description: "Cottage cheese with thawed mixed berries.", calories: 200, protein: 20, prepTime: "1 min" },
    ],
  },
  {
    day: "Tuesday",
    meals: [
      { type: "Breakfast", name: "Egg & Potato Breakfast Hash", description: "3 eggs scrambled with spinach and pan-fried diced potato, one pan.", calories: 430, protein: 25, prepTime: "10 min" },
      { type: "Lunch", name: "Beef Taco Rice Bowl", description: "Ground beef with taco seasoning over rice, sautéed onion and spinach.", calories: 605, protein: 39, prepTime: "15 min" },
      { type: "Dinner", name: "Beef & Veggie Skillet with Rice", description: "Ground beef browned with onion and frozen veg, served over rice.", calories: 740, protein: 55, prepTime: "20 min" },
      { type: "Snack", name: "Greek Yogurt Cup", description: "Plain Greek yogurt, no add-ins needed.", calories: 190, protein: 24, prepTime: "1 min" },
    ],
  },
  {
    day: "Wednesday",
    meals: [
      { type: "Breakfast", name: "Protein Oats with Berries", description: "GF oats cooked, stirred with Greek yogurt, topped with berries and honey.", calories: 460, protein: 22, prepTime: "6 min" },
      { type: "Lunch", name: "Lentil & Chicken Bowl", description: "Lentils, chicken thigh, rice, spinach — one of the two lentil meals this week.", calories: 556, protein: 53, prepTime: "8 min (reheat)" },
      { type: "Dinner", name: "Champignon Risotto", description: "Rice slow-cooked with mushrooms, butter, and parmesan; side of cottage cheese for extra protein.", calories: 650, protein: 28, prepTime: "30 min (mostly stirring)" },
      { type: "Snack", name: "Hard-Boiled Eggs & Cucumber", description: "2 hard-boiled eggs (boil a batch ahead), cucumber slices.", calories: 155, protein: 13, prepTime: "2 min" },
    ],
  },
  {
    day: "Thursday",
    meals: [
      { type: "Breakfast", name: "Cottage Cheese & Berry Bowl", description: "Cottage cheese, thawed mixed berries, a drizzle of honey.", calories: 360, protein: 28, prepTime: "2 min" },
      { type: "Lunch", name: "Egg & Cottage Cheese Tortilla Wrap", description: "GF corn tortillas, scrambled eggs, cottage cheese, spinach.", calories: 520, protein: 38, prepTime: "10 min" },
      { type: "Dinner", name: "Garlic Chicken Thigh with Rice & Greens", description: "Pan-seared chicken thigh, rice, sautéed spinach.", calories: 630, protein: 53, prepTime: "20 min" },
      { type: "Snack", name: "Greek Yogurt & Berries", description: "Greek yogurt with thawed mixed berries.", calories: 175, protein: 18, prepTime: "1 min" },
    ],
  },
  {
    day: "Friday",
    meals: [
      { type: "Breakfast", name: "Greek Yogurt Berry Bowl", description: "Plain Greek yogurt, thawed mixed berries, a drizzle of honey, a sprinkle of GF oats.", calories: 400, protein: 28, prepTime: "3 min" },
      { type: "Lunch", name: "Chicken & Rice Power Bowl", description: "Batch-cooked chicken thigh, rice, mixed frozen veg.", calories: 610, protein: 54, prepTime: "5 min (reheat)" },
      { type: "Dinner", name: "Lentil Fried Rice with Egg", description: "Lentils and rice sautéed with onion, topped with fried egg — the second and last lentil meal this week.", calories: 700, protein: 33, prepTime: "15 min" },
      { type: "Snack", name: "Greek Yogurt Cup", description: "Plain Greek yogurt, no add-ins needed.", calories: 190, protein: 24, prepTime: "1 min" },
    ],
  },
  {
    day: "Saturday",
    meals: [
      { type: "Breakfast", name: "Egg & Potato Breakfast Hash", description: "3 eggs scrambled with spinach and pan-fried diced potato, one pan.", calories: 430, protein: 25, prepTime: "10 min" },
      { type: "Lunch", name: "Tuna & Potato Salad", description: "Canned tuna, boiled potato, sautéed spinach.", calories: 580, protein: 38, prepTime: "12 min" },
      { type: "Dinner", name: "Pizza Night (GF Tortilla Crust)", description: "Stacked GF corn tortillas, tomato sauce, mozzarella, ground beef crumbles, baked till crisp. Swap in a store-bought GF crust if you'd rather — adds a few dollars to the list.", calories: 640, protein: 51, prepTime: "20 min" },
      { type: "Snack", name: "Cottage Cheese & Berries", description: "Cottage cheese with thawed mixed berries.", calories: 200, protein: 20, prepTime: "1 min" },
    ],
  },
  {
    day: "Sunday",
    meals: [
      { type: "Breakfast", name: "Protein Oats with Berries", description: "GF oats cooked, stirred with Greek yogurt, topped with berries and honey.", calories: 460, protein: 22, prepTime: "6 min" },
      { type: "Lunch", name: "Beef Taco Rice Bowl", description: "Ground beef with taco seasoning over rice, sautéed onion and spinach.", calories: 605, protein: 39, prepTime: "15 min" },
      { type: "Dinner", name: "Sushi Night: Spicy Tuna Roll + Edamame", description: "Canned tuna mixed with mayo, rolled with avocado and cucumber in rice and nori; GF tamari for dipping, steamed edamame on the side. Rolling takes a little practice, but the filling is simple.", calories: 700, protein: 48, prepTime: "25 min" },
      { type: "Snack", name: "Hard-Boiled Eggs & Cucumber", description: "2 hard-boiled eggs (boil a batch ahead), cucumber slices.", calories: 155, protein: 13, prepTime: "2 min" },
    ],
  },
];

const GROCERY_LIST = [
  {
    category: "Proteins",
    items: [
      { name: "Chicken thighs, boneless skinless (1.5kg)", cost: 10 },
      { name: "Eggs (12-pack)", cost: 4 },
      { name: "Canned tuna, in water (4 cans)", cost: 8 },
      { name: "Ground beef, lean (700g)", cost: 7 },
      { name: "Plain Greek yogurt, 2% (1kg tub)", cost: 7 },
      { name: "Dried lentils (1kg bag)", cost: 3 },
      { name: "Cottage cheese (500g)", cost: 5 },
    ],
  },
  {
    category: "Carbs & grains (GF)",
    items: [
      { name: "Certified GF rolled oats (1kg)", cost: 5 },
      { name: "Rice (2kg bag) — doubles as risotto & sushi rice", cost: 4 },
      { name: "Potatoes (2kg)", cost: 3 },
      { name: "GF corn tortillas (1 pack)", cost: 3 },
    ],
  },
  {
    category: "Produce",
    items: [
      { name: "Frozen mixed berries (500g)", cost: 4 },
      { name: "Spinach (1 bag)", cost: 3 },
      { name: "Frozen mixed vegetables (2 bags)", cost: 6 },
      { name: "Onion & garlic", cost: 2 },
      { name: "Mushrooms, cremini/champignon (250g)", cost: 3 },
      { name: "Avocado (1)", cost: 2 },
      { name: "Cucumber (1)", cost: 1 },
      { name: "Frozen edamame (1 bag)", cost: 2 },
    ],
  },
  {
    category: "Pizza & sushi night extras",
    items: [
      { name: "Mozzarella cheese, shredded (300g)", cost: 3 },
      { name: "Tomato sauce (small can, GF certified)", cost: 2 },
      { name: "Parmesan cheese (small)", cost: 3 },
      { name: "Vegetable or chicken broth (500ml, GF)", cost: 2 },
      { name: "Nori sheets (10-pack)", cost: 4 },
      { name: "Mayonnaise (small jar)", cost: 2 },
    ],
  },
  {
    category: "Pantry",
    items: [{ name: "Honey (small jar)", cost: 2 }],
  },
];
const GROCERY_TOTAL = GROCERY_LIST.reduce(
  (sum, g) => sum + g.items.reduce((s, i) => s + i.cost, 0),
  0
);
const GROCERY_BUDGET = 100;
// Not counted toward the total — pantry staples you likely already stock,
// used in small amounts across many future meals, not just this week's.
const GROCERY_PANTRY_NOTE =
  "Butter and GF soy sauce/tamari (~$2-4 combined) aren't counted above — small amounts used per meal, so they'll last well beyond this week if you don't already have them.";

function mkSets(pairs) {
  return pairs.map(([weight, reps]) => ({ weight, reps }));
}

const HISTORY_SEED = [
  {
    id: "s1",
    dayId: "dayA",
    date: "2026-08-18",
    durationMin: 52,
    exercises: [
      { name: "Barbell Hip Thrust", muscleGroup: "Glutes", sets: mkSets([[45, 12], [45, 12], [45, 12], [45, 12]]) },
      { name: "Barbell Back Squat", muscleGroup: "Quads", sets: mkSets([[45, 8], [45, 8], [45, 8], [45, 8]]) },
      { name: "Dumbbell Romanian Deadlift", muscleGroup: "Hamstrings", sets: mkSets([[15, 10], [15, 10], [15, 10]]) },
      { name: "Bulgarian Split Squat", muscleGroup: "Glutes", sets: mkSets([[0, 8], [0, 8], [0, 8]]) },
      { name: "Standing Calf Raise", muscleGroup: "Calves", sets: mkSets([[30, 15], [30, 15], [30, 15]]) },
      { name: "Bird Dog", muscleGroup: "Core", sets: mkSets([[0, 10], [0, 10], [0, 10]]) },
      { name: "Dead Bug", muscleGroup: "Core", sets: mkSets([[0, 12], [0, 12], [0, 12]]) },
    ],
  },
  {
    id: "s2",
    dayId: "dayB",
    date: "2026-08-20",
    durationMin: 48,
    exercises: [
      { name: "Lat Pulldown", muscleGroup: "Back", sets: mkSets([[40, 10], [40, 10], [40, 10], [40, 10]]) },
      { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", sets: mkSets([[8, 10], [8, 10], [8, 10]]) },
      { name: "Seated Cable Row", muscleGroup: "Back", sets: mkSets([[35, 12], [35, 12], [35, 12]]) },
      { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", sets: mkSets([[7.5, 10], [7.5, 10], [7.5, 10]]) },
      { name: "Cable Triceps Pushdown", muscleGroup: "Arms", sets: mkSets([[17.5, 10], [17.5, 10], [17.5, 10]]) },
      { name: "Pallof Press", muscleGroup: "Core", sets: mkSets([[15, 10], [15, 10], [15, 10]]) },
      { name: "Plank", muscleGroup: "Core", sets: mkSets([[0, 40], [0, 40]]) },
    ],
  },
  {
    id: "s3",
    dayId: "dayC",
    date: "2026-08-22",
    durationMin: 55,
    exercises: [
      { name: "Smith Machine Single-Leg RDL", muscleGroup: "Hamstrings", sets: mkSets([[0, 8], [0, 8], [0, 8]]) },
      { name: "Goblet Squat", muscleGroup: "Quads", sets: mkSets([[12.5, 12], [12.5, 12], [12.5, 12]]) },
      { name: "Stability Ball Hamstring Curl", muscleGroup: "Hamstrings", sets: mkSets([[0, 10], [0, 10], [0, 10]]) },
      { name: "Single-Arm Lat Pulldown", muscleGroup: "Back", sets: mkSets([[15, 10], [15, 10], [15, 10]]) },
      { name: "Glute Bridge March", muscleGroup: "Glutes", sets: mkSets([[0, 8], [0, 8], [0, 8]]) },
      { name: "Side Plank", muscleGroup: "Core", sets: mkSets([[0, 20], [0, 20]]) },
      { name: "Wall Sit", muscleGroup: "Quads", sets: mkSets([[0, 20], [0, 20]]) },
    ],
  },
  {
    id: "s4",
    dayId: "dayA",
    date: "2026-08-25",
    durationMin: 50,
    exercises: [
      { name: "Barbell Hip Thrust", muscleGroup: "Glutes", sets: mkSets([[50, 12], [50, 12], [50, 12], [50, 12]]), isPR: true },
      { name: "Barbell Back Squat", muscleGroup: "Quads", sets: mkSets([[55, 8], [55, 8], [55, 8], [55, 8]]), isPR: true },
      { name: "Dumbbell Romanian Deadlift", muscleGroup: "Hamstrings", sets: mkSets([[17.5, 10], [17.5, 10], [17.5, 10]]) },
      { name: "Bulgarian Split Squat", muscleGroup: "Glutes", sets: mkSets([[10, 8], [10, 8], [10, 8]]) },
      { name: "Standing Calf Raise", muscleGroup: "Calves", sets: mkSets([[35, 15], [35, 15], [35, 15]]) },
      { name: "Bird Dog", muscleGroup: "Core", sets: mkSets([[0, 12], [0, 12], [0, 12]]) },
      { name: "Dead Bug", muscleGroup: "Core", sets: mkSets([[0, 14], [0, 14], [0, 14]]) },
    ],
  },
  {
    id: "s5",
    dayId: "dayB",
    date: "2026-08-27",
    durationMin: 53,
    exercises: [
      { name: "Lat Pulldown", muscleGroup: "Back", sets: mkSets([[45, 10], [45, 10], [45, 10], [45, 10]]), isPR: true },
      { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", sets: mkSets([[10, 10], [10, 10], [10, 10]]) },
      { name: "Seated Cable Row", muscleGroup: "Back", sets: mkSets([[40, 12], [40, 12], [40, 12]]) },
      { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", sets: mkSets([[10, 10], [10, 10], [10, 10]]) },
      { name: "Cable Triceps Pushdown", muscleGroup: "Arms", sets: mkSets([[20, 10], [20, 10], [20, 10]]) },
      { name: "Pallof Press", muscleGroup: "Core", sets: mkSets([[17.5, 10], [17.5, 10], [17.5, 10]]) },
      { name: "Plank", muscleGroup: "Core", sets: mkSets([[0, 50], [0, 50], [0, 50]]) },
    ],
  },
  {
    id: "s6",
    dayId: "dayC",
    date: "2026-08-29",
    durationMin: 58,
    exercises: [
      { name: "Smith Machine Single-Leg RDL", muscleGroup: "Hamstrings", sets: mkSets([[5, 8], [5, 8], [5, 8]]) },
      { name: "Goblet Squat", muscleGroup: "Quads", sets: mkSets([[15, 12], [15, 12], [15, 12]]) },
      { name: "Stability Ball Hamstring Curl", muscleGroup: "Hamstrings", sets: mkSets([[0, 12], [0, 12], [0, 12]]) },
      { name: "Single-Arm Lat Pulldown", muscleGroup: "Back", sets: mkSets([[17.5, 10], [17.5, 10], [17.5, 10]]) },
      { name: "Glute Bridge March", muscleGroup: "Glutes", sets: mkSets([[0, 10], [0, 10], [0, 10]]) },
      { name: "Side Plank", muscleGroup: "Core", sets: mkSets([[0, 30], [0, 30], [0, 30]]) },
      { name: "Wall Sit", muscleGroup: "Quads", sets: mkSets([[0, 30], [0, 30]]), isPR: true },
    ],
  },
];

function dayNameForId(id) {
  const d = WORKOUT_PLAN.find((p) => p.id === id);
  return d ? d.name : id;
}

/* ---------------------------------------------------------------------
   HELPERS
--------------------------------------------------------------------- */
function fmtDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Best-effort "rest finished" cue: tries a real haptic vibration (works on
// Android Chrome; iOS Safari does not expose the Vibration API to web pages
// as of this writing, so this is a no-op there) plus a short audio beep as
// a cross-platform fallback so there's always some signal.
function triggerRestFinishedFeedback() {
  try {
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  } catch (e) {}
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {}
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStreakWeeks(history) {
  // Count consecutive weeks (ending this week) with >=3 sessions logged
  const weekBuckets = {};
  history.forEach((s) => {
    const wk = startOfWeek(new Date(s.date + "T12:00:00")).toISOString();
    weekBuckets[wk] = (weekBuckets[wk] || 0) + 1;
  });
  let streak = 0;
  let cursor = startOfWeek(TODAY);
  while (true) {
    const key = cursor.toISOString();
    if ((weekBuckets[key] || 0) >= 3) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

function computeThisWeekCount(history) {
  const wkStart = startOfWeek(TODAY);
  const wkEnd = new Date(wkStart);
  wkEnd.setDate(wkEnd.getDate() + 7);
  return history.filter((s) => {
    const d = new Date(s.date + "T12:00:00");
    return d >= wkStart && d < wkEnd;
  }).length;
}

function bestSetForExercise(history, exerciseName) {
  // returns { weight, reps, date } with the highest weight logged (ties -> most reps)
  let best = null;
  history.forEach((session) => {
    const ex = session.exercises.find((e) => e.name === exerciseName);
    if (!ex) return;
    ex.sets.forEach((set) => {
      if (
        !best ||
        set.weight > best.weight ||
        (set.weight === best.weight && set.reps > best.reps)
      ) {
        best = { weight: set.weight, reps: set.reps, date: session.date };
      }
    });
  });
  return best;
}

function lastLoggedSetsForExercise(history, exerciseName) {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const session of sorted) {
    const ex = session.exercises.find((e) => e.name === exerciseName);
    if (ex) return ex.sets;
  }
  return null;
}

function computeTopPRs(history, limit) {
  const byExercise = {};
  history.forEach((session) => {
    session.exercises.forEach((ex) => {
      if (!ex.isPR) return;
      const best = ex.sets.reduce(
        (m, s) => (s.weight > m.weight ? s : m),
        ex.sets[0]
      );
      byExercise[ex.name] = { exercise: ex.name, weight: best.weight, reps: best.reps, date: session.date };
    });
  });
  return Object.values(byExercise)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

function weeklyVolumeByMuscle(history) {
  const wkStart = startOfWeek(TODAY);
  const wkEnd = new Date(wkStart);
  wkEnd.setDate(wkEnd.getDate() + 7);
  const totals = {};
  MUSCLE_GROUPS.forEach((m) => (totals[m] = 0));
  history.forEach((session) => {
    const d = new Date(session.date + "T12:00:00");
    if (d < wkStart || d >= wkEnd) return;
    session.exercises.forEach((ex) => {
      const vol = ex.sets.reduce((sum, s) => sum + (s.weight || 1) * s.reps, 0);
      totals[ex.muscleGroup] = (totals[ex.muscleGroup] || 0) + vol;
    });
  });
  return totals;
}

function weightTrendForExercise(history, exerciseName) {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  const points = [];
  sorted.forEach((session) => {
    const ex = session.exercises.find((e) => e.name === exerciseName);
    if (!ex) return;
    const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
    points.push({ date: session.date, weight: maxWeight });
  });
  return points;
}

/* ---------------------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------------------- */
function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`border ${className}`}
      style={{
        background: COLORS.surface,
        borderColor: COLORS.border,
        borderRadius: 6,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, icon }) {
  return (
    <Card className="flex-1 p-3 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] tracking-wide"
          style={{ color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}
        >
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-2">
        <div
          className="leading-none"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 34,
            color: COLORS.textPrimary,
          }}
        >
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ color: COLORS.textFaint }}>
            {sub}
          </div>
        )}
      </div>
    </Card>
  );
}

function SectionHeading({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: 21,
          color: COLORS.textPrimary,
        }}
      >
        {children}
      </h2>
      {right}
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  const toneStyles = {
    default: { background: COLORS.surfaceAlt, color: COLORS.textSecondary },
    blue: { background: COLORS.blueDim, color: "#BFDBFF" },
  };
  return (
    <span
      className="inline-block px-2 py-1 text-xs mr-1.5 mb-1.5"
      style={{ borderRadius: 4, fontFamily: "Barlow, sans-serif", ...toneStyles[tone] }}
    >
      {children}
    </span>
  );
}

function MuscleTag({ muscleGroup, label, highlight = false }) {
  const color = muscleColor(muscleGroup);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs mr-1.5 mb-1.5"
      style={{
        borderRadius: 4,
        fontFamily: "Barlow, sans-serif",
        fontWeight: highlight ? 600 : 500,
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}55`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0 }} />
      {highlight && "🏆 "}
      {label || muscleGroup}
    </span>
  );
}

/* ---------------------------------------------------------------------
   DASHBOARD SCREEN
--------------------------------------------------------------------- */
function Dashboard({ history, prs, onStartDay, onOpenPRs }) {
  const streak = computeStreakWeeks(history);
  const thisWeek = computeThisWeekCount(history);
  const total = history.length;
  const topPRs = computeTopPRs(history, 3);
  const { weekNumber, quote } = getWeeklyQuote(TODAY);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <div>
        <div
          className="text-xs uppercase tracking-widest"
          style={{ color: COLORS.blue, fontFamily: "Barlow, sans-serif", letterSpacing: 1.5 }}
        >
          {PROGRAM.startDate} – {PROGRAM.endDate}
        </div>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 34,
            color: COLORS.textPrimary,
            lineHeight: 1,
          }}
          className="mt-1"
        >
          12-Week Rebuild
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          Muscle gain + hip &amp; pelvic alignment
        </p>
      </div>

      <Card className="p-3.5" style={{ borderLeft: `3px solid ${COLORS.blue}` }}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[11px] uppercase tracking-wide"
            style={{ color: COLORS.blue, fontFamily: "Barlow, sans-serif", fontWeight: 600, letterSpacing: 1 }}
          >
            Week {weekNumber}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: COLORS.textPrimary,
            fontStyle: "italic",
            lineHeight: 1.3,
          }}
        >
          "{quote}"
        </p>
      </Card>

      {/* current vs goal */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-[11px]" style={{ color: COLORS.textSecondary }}>
            Body weight
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.textPrimary }}
            >
              {PROGRAM.currentWeightKg}kg
            </span>
            <span className="text-xs" style={{ color: COLORS.textFaint }}>
              → {PROGRAM.goalWeightKg}kg goal
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px]" style={{ color: COLORS.textSecondary }}>
            Wall test gap
          </div>
          <div className="mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.textPrimary }}>
            {PROGRAM.wallTestCurrent}
          </div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.textFaint }}>
            → {PROGRAM.wallTestGoal}
          </div>
        </Card>
      </div>

      {/* stat boxes */}
      <div className="flex gap-3">
        <StatBox
          label="Streak"
          value={streak}
          sub={streak === 1 ? "week on track" : "weeks on track"}
          icon={<Flame size={16} color={COLORS.amber} />}
        />
        <StatBox
          label="This week"
          value={`${thisWeek}/3`}
          sub="workouts logged"
          icon={<Dumbbell size={16} color={COLORS.blue} />}
        />
        <StatBox
          label="Total"
          value={total}
          sub="workouts done"
          icon={<TrendingUp size={16} color={COLORS.green} />}
        />
      </div>

      {/* quick launch */}
      <div>
        <SectionHeading>Start today's session</SectionHeading>
        <div className="space-y-2.5">
          {WORKOUT_PLAN.map((day) => (
            <button
              key={day.id}
              onClick={() => onStartDay(day.id)}
              className="w-full flex items-center justify-between p-3.5 text-left active:opacity-80 transition-opacity"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6 }}
            >
              <div>
                <div
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.textPrimary }}
                >
                  {day.shortName}
                </div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                  {day.focus} · {day.estMinutes}
                </div>
              </div>
              <div
                className="flex items-center justify-center"
                style={{ width: 34, height: 34, borderRadius: 4, background: COLORS.blue }}
              >
                <Dumbbell size={16} color="#04101F" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* top PRs */}
      <div>
        <SectionHeading>Personal records</SectionHeading>
        <Card className="p-3.5">
          {topPRs.length === 0 ? (
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Finish a workout to start logging PRs.
            </p>
          ) : (
            <div className="space-y-3">
              {topPRs.map((pr, i) => (
                <div key={pr.exercise} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 30, height: 30, borderRadius: 4, background: COLORS.blueDim }}
                  >
                    <Trophy size={15} color={COLORS.amber} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="truncate"
                      style={{ fontFamily: "Barlow, sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.textPrimary }}
                    >
                      {pr.exercise}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.textFaint }}>
                      {fmtDate(pr.date)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.blue }}>
                      {pr.weight > 0 ? `${pr.weight}lb` : `${pr.reps}s`}
                    </div>
                    {pr.weight > 0 && (
                      <div className="text-xs" style={{ color: COLORS.textFaint }}>
                        × {pr.reps} reps
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   WORKOUT SCREEN
--------------------------------------------------------------------- */
function buildSessionFromPlan(dayId, history) {
  const day = WORKOUT_PLAN.find((d) => d.id === dayId);
  return {
    dayId,
    dayName: day.name,
    startTime: Date.now(),
    exercises: day.exercises.map((ex) => {
      const lastSets = lastLoggedSetsForExercise(history, ex.name);
      return {
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        cue: ex.cue,
        isHold: !!ex.isHold,
        restSeconds: ex.restSeconds || 45,
        sets: Array.from({ length: ex.targetSets }).map((_, i) => {
          const prev = lastSets && lastSets[i] ? lastSets[i] : null;
          return {
            setNumber: i + 1,
            previous: prev,
            weight: prev ? String(prev.weight) : "",
            reps: prev ? String(prev.reps) : "",
            completed: false,
          };
        }),
      };
    }),
  };
}

function PickerSheet({ existingNames, onAdd, onClose }) {
  const grouped = MUSCLE_GROUPS.map((mg) => ({
    muscleGroup: mg,
    items: EXERCISE_LIBRARY.filter((e) => e.muscleGroup === mg && !existingNames.includes(e.name)),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className="mt-3 border-t pt-3"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.textPrimary }}>
          Add an exercise
        </span>
        <button onClick={onClose} className="p-1" aria-label="Close picker">
          <X size={18} color={COLORS.textSecondary} />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {grouped.map((g) => (
          <div key={g.muscleGroup}>
            <div className="text-xs mb-1.5" style={{ color: COLORS.textFaint }}>
              {g.muscleGroup}
            </div>
            <div className="space-y-1.5">
              {g.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAdd(item)}
                  className="w-full flex items-center justify-between px-3 py-2 active:opacity-80"
                  style={{ background: COLORS.surfaceAlt, borderRadius: 4 }}
                >
                  <span className="text-sm" style={{ color: COLORS.textPrimary, fontFamily: "Barlow, sans-serif" }}>
                    {item.name}
                  </span>
                  <Plus size={16} color={COLORS.blue} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExerciseLogger({ exercise, onChangeSet, onToggleComplete, onAddSet, onDeleteSet, onDeleteExercise }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between mb-1">
        <div className="min-w-0">
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.textPrimary }}>
            {exercise.name}
          </div>
          <MuscleTag muscleGroup={exercise.muscleGroup} />
        </div>
        <div className="flex-shrink-0 ml-2">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 active:opacity-70"
              aria-label="Remove exercise from this workout"
            >
              <Trash2 size={16} color={COLORS.textFaint} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDeleteExercise}
                className="text-xs px-2 py-1 active:opacity-85"
                style={{ background: "#3A1418", border: "1px solid #6B2028", borderRadius: 4, color: "#FF8A8A", fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 active:opacity-85"
                style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: COLORS.textSecondary, lineHeight: 1.4 }}>
        {exercise.cue}
      </p>

      <div>
        <div
          className="grid text-[11px] pb-1.5 mb-1.5 border-b"
          style={{
            gridTemplateColumns: "28px 1fr 64px 56px 34px 26px",
            gap: 8,
            color: COLORS.textFaint,
            borderColor: COLORS.border,
          }}
        >
          <span>Set</span>
          <span>Previous</span>
          <span>{exercise.isHold ? "Sec" : "Weight"}</span>
          <span>{exercise.isHold ? "" : "Reps"}</span>
          <span></span>
          <span></span>
        </div>

        {exercise.sets.map((set, idx) => (
          <div
            key={idx}
            className="grid items-center py-1.5"
            style={{
              gridTemplateColumns: "28px 1fr 64px 56px 34px 26px",
              gap: 8,
              background: set.completed ? "rgba(51,209,122,0.12)" : "transparent",
              borderRadius: 4,
            }}
          >
            <span className="text-sm" style={{ color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}>
              {set.setNumber}
            </span>
            <span className="text-xs truncate" style={{ color: COLORS.textFaint }}>
              {set.previous
                ? exercise.isHold
                  ? `${set.previous.reps}s`
                  : `${set.previous.weight}lb × ${set.previous.reps}`
                : "—"}
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder={exercise.isHold ? "sec" : "lb"}
              value={exercise.isHold ? set.reps : set.weight}
              onChange={(e) =>
                exercise.isHold
                  ? onChangeSet(idx, "reps", e.target.value)
                  : onChangeSet(idx, "weight", e.target.value)
              }
              className="text-sm px-2 py-1 w-full outline-none"
              style={{
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
                color: COLORS.textPrimary,
              }}
            />
            {exercise.isHold ? (
              <span />
            ) : (
              <input
                type="number"
                inputMode="numeric"
                placeholder="reps"
                value={set.reps}
                onChange={(e) => onChangeSet(idx, "reps", e.target.value)}
                className="text-sm px-2 py-1 w-full outline-none"
                style={{
                  background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 4,
                  color: COLORS.textPrimary,
                }}
              />
            )}
            <button
              onClick={() => onToggleComplete(idx)}
              className="flex items-center justify-center"
              aria-label="Mark set complete"
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: set.completed ? COLORS.green : COLORS.surfaceAlt,
                border: `1px solid ${set.completed ? COLORS.green : COLORS.border}`,
                justifySelf: "center",
              }}
            >
              <Check size={15} color={set.completed ? "#04120A" : COLORS.textFaint} />
            </button>
            {exercise.sets.length > 1 ? (
              <button
                onClick={() => onDeleteSet(idx)}
                className="flex items-center justify-center active:opacity-70"
                aria-label="Delete set"
              >
                <Trash2 size={14} color={COLORS.textFaint} />
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onAddSet}
          className="flex items-center gap-1.5 text-sm active:opacity-70"
          style={{ color: COLORS.blue, fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
        >
          <Plus size={15} /> Add set
        </button>
        {exercise.restSeconds && (
          <span className="text-xs" style={{ color: COLORS.textFaint }}>
            Rest {exercise.restSeconds}s between sets
          </span>
        )}
      </div>
    </Card>
  );
}

function WorkoutScreen({ session, history, onStartDay, onUpdateSession, onFinish, onDiscard, onStartRest }) {
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - session.startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session]);

  if (!session) {
    return (
      <div className="px-4 pt-5 pb-6">
        <SectionHeading>Pick today's workout</SectionHeading>
        <div className="space-y-2.5">
          {WORKOUT_PLAN.map((day) => (
            <button
              key={day.id}
              onClick={() => onStartDay(day.id)}
              className="w-full flex items-center justify-between p-3.5 text-left active:opacity-80"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6 }}
            >
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.textPrimary }}>
                  {day.shortName}
                </div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                  {day.focus} · {day.estMinutes}
                </div>
              </div>
              <ChevronDown size={18} color={COLORS.textFaint} style={{ transform: "rotate(-90deg)" }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const planDay = WORKOUT_PLAN.find((d) => d.id === session.dayId);
  const existingNames = session.exercises.map((e) => e.name);

  function updateExercise(exId, updater) {
    onUpdateSession({
      ...session,
      exercises: session.exercises.map((ex) => (ex.id === exId ? updater(ex) : ex)),
    });
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs" style={{ color: COLORS.textSecondary }}>
            {TODAY.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · Target {planDay.estMinutes}
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.textPrimary }}>
            {planDay.name}
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5"
          style={{ background: COLORS.surfaceAlt, borderRadius: 4 }}
        >
          <Timer size={15} color={COLORS.blue} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.textPrimary }}>
            {fmtElapsed(elapsed)}
          </span>
        </div>
      </div>

      {/* warmup */}
      <Card className="p-3.5">
        <div className="text-xs mb-2" style={{ color: COLORS.amber, fontFamily: "Barlow, sans-serif", fontWeight: 600 }}>
          Warm-up · 5 min
        </div>
        <ul className="space-y-1">
          {planDay.warmup.map((w, i) => (
            <li key={i} className="text-sm" style={{ color: COLORS.textSecondary }}>
              · {w}
            </li>
          ))}
        </ul>
      </Card>

      {/* exercises, one at a time */}
      <div className="space-y-3">
        {session.exercises.map((ex) => (
          <ExerciseLogger
            key={ex.id}
            exercise={ex}
            onChangeSet={(idx, field, value) =>
              updateExercise(ex.id, (e) => ({
                ...e,
                sets: e.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
              }))
            }
            onToggleComplete={(idx) => {
              const wasCompleted = ex.sets[idx].completed;
              updateExercise(ex.id, (e) => ({
                ...e,
                sets: e.sets.map((s, i) => (i === idx ? { ...s, completed: !s.completed } : s)),
              }));
              if (!wasCompleted && onStartRest) {
                onStartRest(ex.restSeconds || 45, ex.name);
              }
            }}
            onAddSet={() =>
              updateExercise(ex.id, (e) => {
                const prev = e.sets[e.sets.length - 1]?.previous || null;
                return {
                  ...e,
                  sets: [
                    ...e.sets,
                    {
                      setNumber: e.sets.length + 1,
                      previous: prev,
                      weight: prev ? String(prev.weight) : "",
                      reps: prev ? String(prev.reps) : "",
                      completed: false,
                    },
                  ],
                };
              })
            }
            onDeleteSet={(idx) =>
              updateExercise(ex.id, (e) => {
                if (e.sets.length <= 1) return e;
                return {
                  ...e,
                  sets: e.sets.filter((_, i) => i !== idx).map((s, i) => ({ ...s, setNumber: i + 1 })),
                };
              })
            }
            onDeleteExercise={() =>
              onUpdateSession({
                ...session,
                exercises: session.exercises.filter((e) => e.id !== ex.id),
              })
            }
          />
        ))}
      </div>

      {/* add exercise */}
      <Card className="p-3.5">
        {!showPicker ? (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-1.5 text-sm py-1 active:opacity-70"
            style={{ color: COLORS.blue, fontFamily: "Barlow, sans-serif", fontWeight: 600 }}
          >
            <Plus size={16} /> Add exercise
          </button>
        ) : (
          <PickerSheet
            existingNames={existingNames}
            onClose={() => setShowPicker(false)}
            onAdd={(item) => {
              const lastSets = lastLoggedSetsForExercise(history, item.name);
              onUpdateSession({
                ...session,
                exercises: [
                  ...session.exercises,
                  {
                    id: `${item.id}-${Date.now()}`,
                    name: item.name,
                    muscleGroup: item.muscleGroup,
                    cue: item.cue,
                    isHold: !!item.isHold,
                    restSeconds: item.restSeconds || 45,
                    sets: Array.from({ length: item.targetSets }).map((_, i) => {
                      const prev = lastSets && lastSets[i] ? lastSets[i] : null;
                      return {
                        setNumber: i + 1,
                        previous: prev,
                        weight: prev ? String(prev.weight) : "",
                        reps: prev ? String(prev.reps) : "",
                        completed: false,
                      };
                    }),
                  },
                ],
              });
              setShowPicker(false);
            }}
          />
        )}
      </Card>

      {/* cooldown */}
      <Card className="p-3.5">
        <div className="text-xs mb-2" style={{ color: COLORS.blue, fontFamily: "Barlow, sans-serif", fontWeight: 600 }}>
          Cooldown
        </div>
        <ul className="space-y-1">
          {planDay.cooldown.map((c, i) => (
            <li key={i} className="text-sm" style={{ color: COLORS.textSecondary }}>
              · {c}
            </li>
          ))}
        </ul>
      </Card>

      {/* finish / discard */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onFinish(elapsed)}
          className="flex-1 py-3 text-center active:opacity-85"
          style={{ background: COLORS.blue, borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: "#04101F" }}
        >
          Finish workout
        </button>
        {!confirmDiscard ? (
          <button
            onClick={() => setConfirmDiscard(true)}
            className="px-4 py-3 text-center active:opacity-85"
            style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.textSecondary }}
          >
            Discard
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onDiscard}
              className="px-3 py-3 text-center active:opacity-85"
              style={{ background: "#3A1418", border: "1px solid #6B2028", borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#FF8A8A" }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDiscard(false)}
              className="px-3 py-3 text-center active:opacity-85"
              style={{ border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.textSecondary }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   HISTORY SCREEN
--------------------------------------------------------------------- */
function HistoryScreen({ history }) {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="px-4 pt-5 pb-6">
      <SectionHeading>Workout history</SectionHeading>
      <div className="space-y-3">
        {sorted.map((session) => {
          const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
          const hasPR = session.exercises.some((e) => e.isPR);
          return (
            <Card key={session.id} className="p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.textPrimary }}>
                    {dayNameForId(session.dayId)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                    {fmtDate(session.date)} · {session.durationMin} min · {totalSets} sets
                  </div>
                </div>
                {hasPR && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 flex-shrink-0"
                    style={{ background: COLORS.blueDim, borderRadius: 4 }}
                  >
                    <Trophy size={13} color={COLORS.amber} />
                    <span className="text-[11px]" style={{ color: COLORS.amber, fontWeight: 600 }}>
                      PR
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap">
                {session.exercises.map((ex) => (
                  <MuscleTag key={ex.name} muscleGroup={ex.muscleGroup} label={ex.name} highlight={ex.isPR} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   PROGRESS SCREEN
--------------------------------------------------------------------- */
function VolumeBar({ label, value, max, color = COLORS.blue }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs flex items-center gap-1.5" style={{ color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }} />
          {label}
        </span>
        <span className="text-xs" style={{ color: COLORS.textFaint }}>
          {Math.round(value).toLocaleString()} lb
        </span>
      </div>
      <div style={{ background: COLORS.surfaceAlt, borderRadius: 3, height: 10 }}>
        <div
          style={{
            width: `${pct}%`,
            background: color,
            height: 10,
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function Sparkline({ points, color }) {
  if (points.length === 0) return null;
  const w = 220;
  const h = 44;
  const values = points.map((p) => p.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p.weight - min) / range) * (h - 8) - 4;
    return [x, y];
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
    </svg>
  );
}

function ProgressScreen({ history }) {
  const volumes = weeklyVolumeByMuscle(history);
  const maxVol = Math.max(...Object.values(volumes), 1);
  const trackedExercises = [
    { name: "Barbell Back Squat", muscleGroup: "Quads" },
    { name: "Barbell Hip Thrust", muscleGroup: "Glutes" },
    { name: "Lat Pulldown", muscleGroup: "Back" },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "Hamstrings" },
    { name: "Goblet Squat", muscleGroup: "Quads" },
  ];

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <div>
        <SectionHeading>Weekly volume by muscle group</SectionHeading>
        <Card className="p-3.5">
          {MUSCLE_GROUPS.map((mg) => (
            <VolumeBar key={mg} label={mg} value={volumes[mg] || 0} max={maxVol} color={muscleColor(mg)} />
          ))}
        </Card>
      </div>

      <div>
        <SectionHeading>Strength trends</SectionHeading>
        <div className="space-y-3">
          {trackedExercises.map(({ name, muscleGroup }) => {
            const points = weightTrendForExercise(history, name);
            if (points.length === 0) return null;
            const best = bestSetForExercise(history, name);
            const color = muscleColor(muscleGroup);
            return (
              <Card key={name} className="p-3.5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.textPrimary }}>
                      {name}
                    </div>
                    <MuscleTag muscleGroup={muscleGroup} />
                    <div className="text-xs mt-0.5" style={{ color: COLORS.textFaint }}>
                      {points.length} sessions logged
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, color }}>
                      {best.weight}lb
                    </div>
                    <div className="text-xs" style={{ color: COLORS.textFaint }}>
                      PR × {best.reps}
                    </div>
                  </div>
                </div>
                <Sparkline points={points} color={color} />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MEALS SCREEN
--------------------------------------------------------------------- */
function MealTypeIcon({ type }) {
  const color = MEAL_TYPE_COLORS[type] || COLORS.textFaint;
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />;
}

function MealsScreen() {
  const [selectedDay, setSelectedDay] = useState(0);
  const day = WEEKLY_MEAL_PLAN[selectedDay];
  const dayCalories = day.meals.reduce((sum, m) => sum + m.calories, 0);
  const dayProtein = day.meals.reduce((sum, m) => sum + m.protein, 0);

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.textPrimary }}>
          Weekly Meal Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
          Gluten-free · $100 CAD/week budget · fuels your training
        </p>
      </div>

      {/* daily targets */}
      <div className="flex gap-3">
        <Card className="flex-1 p-3">
          <div className="text-[11px]" style={{ color: COLORS.textSecondary }}>
            Daily calorie target
          </div>
          <div className="mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.textPrimary }}>
            {MEAL_TARGETS.calorieRange}
          </div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.textFaint }}>
            slow lean gain, ~58 → 59kg
          </div>
        </Card>
        <Card className="flex-1 p-3">
          <div className="text-[11px]" style={{ color: COLORS.textSecondary }}>
            Daily protein minimum
          </div>
          <div className="mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.blue }}>
            {MEAL_TARGETS.proteinMin}g+
          </div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.textFaint }}>
            ~1.8g per kg bodyweight
          </div>
        </Card>
      </div>

      {/* day tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        {WEEKLY_MEAL_PLAN.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(i)}
            className="flex-shrink-0 px-3 py-1.5 text-xs active:opacity-80"
            style={{
              borderRadius: 4,
              fontFamily: "Barlow, sans-serif",
              fontWeight: 600,
              background: i === selectedDay ? COLORS.blue : COLORS.surfaceAlt,
              color: i === selectedDay ? "#04101F" : COLORS.textSecondary,
              border: `1px solid ${i === selectedDay ? COLORS.blue : COLORS.border}`,
            }}
          >
            {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* meals for selected day */}
      <div className="space-y-3">
        {day.meals.map((meal, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <MealTypeIcon type={meal.type} />
                  <span
                    className="text-[11px] uppercase tracking-wide"
                    style={{ color: MEAL_TYPE_COLORS[meal.type], fontFamily: "Barlow, sans-serif", fontWeight: 600, letterSpacing: 1 }}
                  >
                    {meal.type} · {meal.prepTime}
                  </span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.textPrimary }}>
                  {meal.name}
                </div>
                <p className="text-xs mt-1" style={{ color: COLORS.textSecondary, lineHeight: 1.4 }}>
                  {meal.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.textPrimary }}>
                  {meal.calories}
                </div>
                <div className="text-[10px]" style={{ color: COLORS.textFaint }}>
                  kcal
                </div>
                <div className="text-xs mt-1" style={{ color: COLORS.blue, fontWeight: 600 }}>
                  {meal.protein}g protein
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* day total */}
        <Card className="p-3.5" style={{ background: COLORS.surfaceAlt }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.textPrimary }}>
              {day.day} total
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: COLORS.textPrimary }}>
                {dayCalories} kcal
              </span>
              <span className="text-sm" style={{ color: COLORS.blue, fontWeight: 600 }}>
                {dayProtein}g protein
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* grocery list */}
      <div>
        <SectionHeading
          right={
            <span className="text-xs" style={{ color: COLORS.textFaint }}>
              ~${GROCERY_TOTAL} CAD of ${GROCERY_BUDGET}
            </span>
          }
        >
          Weekly grocery list
        </SectionHeading>
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 mb-3">
            <ShoppingCart size={14} color={COLORS.textSecondary} />
            <span className="text-xs" style={{ color: COLORS.textSecondary }}>
              Leaves ~${GROCERY_BUDGET - GROCERY_TOTAL} buffer for fresh swaps or extras
            </span>
          </div>
          <div className="space-y-3">
            {GROCERY_LIST.map((group) => (
              <div key={group.category}>
                <div className="text-xs mb-1.5" style={{ color: COLORS.textFaint }}>
                  {group.category}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: COLORS.textPrimary, fontFamily: "Barlow, sans-serif" }}>
                        {item.name}
                      </span>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: COLORS.textFaint }}>
                        ${item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 pt-3 border-t" style={{ color: COLORS.textFaint, borderColor: COLORS.border, lineHeight: 1.4 }}>
            {GROCERY_PANTRY_NOTE}
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   REST TIMER BAR
--------------------------------------------------------------------- */
function RestTimerBar({ restTimer, onSkip, onAddTime }) {
  const { secondsLeft, totalSeconds, label, justFinished } = restTimer;
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;

  return (
    <div
      className="flex-shrink-0 px-4 py-3 border-t"
      style={{
        background: justFinished ? "rgba(51,209,122,0.15)" : COLORS.surfaceAlt,
        borderColor: COLORS.border,
      }}
    >
      {justFinished ? (
        <div className="flex items-center justify-center">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.green }}>
            Rest complete — back to it 💪
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs truncate" style={{ color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}>
              Resting{label ? ` — ${label}` : ""}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onAddTime}
                className="text-xs px-2 py-0.5 active:opacity-70"
                style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}
              >
                +15s
              </button>
              <button
                onClick={onSkip}
                className="text-xs px-2 py-0.5 active:opacity-70"
                style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.textSecondary, fontFamily: "Barlow, sans-serif" }}
              >
                Skip
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: COLORS.blue, minWidth: 56 }}
            >
              {fmtElapsed(secondsLeft)}
            </span>
            <div className="flex-1" style={{ background: COLORS.surface, borderRadius: 3, height: 8 }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: COLORS.blue,
                  height: 8,
                  borderRadius: 3,
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   BOTTOM NAV
--------------------------------------------------------------------- */
function BottomNav({ active, onChange }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "workout", label: "Workout", icon: Dumbbell },
    { id: "meals", label: "Meals", icon: Utensils },
    { id: "history", label: "History", icon: HistoryIcon },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];
  return (
    <div
      className="flex border-t flex-shrink-0"
      style={{ background: COLORS.surface, borderColor: COLORS.border }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            <Icon size={20} color={isActive ? COLORS.blue : COLORS.textFaint} />
            <span
              className="text-[10px]"
              style={{
                fontFamily: "Barlow, sans-serif",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? COLORS.blue : COLORS.textFaint,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------
   LOCAL PERSISTENCE
--------------------------------------------------------------------- */
const STORAGE_KEYS = {
  history: "fio-workout-tracker-history-v1",
  session: "fio-workout-tracker-session-v1",
};

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage can be unavailable in some private/browser contexts.
  }
}

function todayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ---------------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------------- */
export default function FitnessTracker() {
  const [history, setHistory] = useState(() => readStorage(STORAGE_KEYS.history, HISTORY_SEED));
  const [session, setSession] = useState(() => readStorage(STORAGE_KEYS.session, null));
  const [screen, setScreen] = useState(() => (readStorage(STORAGE_KEYS.session, null) ? "workout" : "dashboard"));
  const [restTimer, setRestTimer] = useState(null);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.history, history);
  }, [history]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.session, session);
  }, [session]);

  function startRestTimer(seconds, label) {
    setRestTimer({ secondsLeft: seconds, totalSeconds: seconds, label, justFinished: false });
  }

  useEffect(() => {
    if (!restTimer) return;
    if (restTimer.justFinished) {
      const t = setTimeout(() => setRestTimer(null), 2500);
      return () => clearTimeout(t);
    }
    if (restTimer.secondsLeft <= 0) {
      triggerRestFinishedFeedback();
      setRestTimer((rt) => (rt ? { ...rt, justFinished: true } : rt));
      return;
    }
    const t = setTimeout(() => {
      setRestTimer((rt) => (rt ? { ...rt, secondsLeft: rt.secondsLeft - 1 } : rt));
    }, 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  function startDay(dayId) {
    setSession(buildSessionFromPlan(dayId, history));
    setRestTimer(null);
    setScreen("workout");
  }

  function finishWorkout(elapsedSeconds) {
    if (!session) return;
    const exercisesLogged = session.exercises
      .map((ex) => {
        const loggedSets = ex.sets
          .filter((s) => s.completed && (ex.isHold ? s.reps !== "" : s.weight !== "" && s.reps !== ""))
          .map((s) => ({
            weight: ex.isHold ? 0 : parseFloat(s.weight) || 0,
            reps: parseFloat(s.reps) || 0,
          }));
        return { name: ex.name, muscleGroup: ex.muscleGroup, sets: loggedSets };
      })
      .filter((ex) => ex.sets.length > 0);

    if (exercisesLogged.length === 0) {
      // nothing logged — just discard rather than saving an empty session
      setSession(null);
      setScreen("dashboard");
      return;
    }

    const withPRFlags = exercisesLogged.map((ex) => {
      const priorBest = bestSetForExercise(history, ex.name);
      const newBest = ex.sets.reduce((m, s) => (s.weight > m.weight ? s : m), ex.sets[0]);
      const isPR = !priorBest || newBest.weight > priorBest.weight;
      return { ...ex, isPR };
    });

    const newSession = {
      id: `s${Date.now()}`,
      dayId: session.dayId,
      date: todayDateKey(),
      durationMin: Math.max(1, Math.round(elapsedSeconds / 60)),
      exercises: withPRFlags,
    };

    setHistory((h) => [...h, newSession]);
    setSession(null);
    setRestTimer(null);
    setScreen("history");
  }

  function discardWorkout() {
    setSession(null);
    setRestTimer(null);
    setScreen("dashboard");
  }

  return (
    <div
      className="w-full mx-auto flex flex-col app-root"
      style={{
        maxWidth: 480,
        background: COLORS.base,
        fontFamily: "Barlow, sans-serif",
      }}
    >
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        * { box-sizing: border-box; }
        .app-root { height: 100vh; height: 100dvh; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        {screen === "dashboard" && (
          <Dashboard history={history} onStartDay={startDay} />
        )}
        {screen === "workout" && (
          <WorkoutScreen
            session={session}
            history={history}
            onStartDay={startDay}
            onUpdateSession={setSession}
            onFinish={finishWorkout}
            onDiscard={discardWorkout}
            onStartRest={startRestTimer}
          />
        )}
        {screen === "meals" && <MealsScreen />}
        {screen === "history" && <HistoryScreen history={history} />}
        {screen === "progress" && <ProgressScreen history={history} />}
      </div>

      {screen === "workout" && restTimer && (
        <RestTimerBar
          restTimer={restTimer}
          onSkip={() => setRestTimer(null)}
          onAddTime={() =>
            setRestTimer((rt) =>
              rt && !rt.justFinished ? { ...rt, secondsLeft: rt.secondsLeft + 15, totalSeconds: rt.totalSeconds + 15 } : rt
            )
          }
        />
      )}

      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
}