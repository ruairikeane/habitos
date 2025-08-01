import { colors } from '../styles';
import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Health & Wellness',
    color: colors.health,
    icon: 'heart',
  },
  {
    name: 'Fitness',
    color: colors.fitness,
    icon: 'fitness',
  },
  {
    name: 'Productivity',
    color: colors.productivity,
    icon: 'checkmark-circle',
  },
  {
    name: 'Learning',
    color: colors.learning,
    icon: 'book',
  },
  {
    name: 'Mindfulness',
    color: colors.mindfulness,
    icon: 'leaf',
  },
  {
    name: 'Personal Care',
    color: colors.personalCare,
    icon: 'person',
  },
  {
    name: 'Social',
    color: colors.social,
    icon: 'people',
  },
  {
    name: 'Creative',
    color: colors.creative,
    icon: 'color-palette',
  },
];

export const HABIT_TIPS = [
  {
    title: "Start Small",
    content: "Begin with habits that take less than 2 minutes to complete. Success builds momentum.",
    category: 'getting-started',
  },
  {
    title: "Habit Stacking",
    content: "Link new habits to existing ones: 'After I pour my coffee, I will write 3 gratitudes.'",
    category: 'habit-stacking',
  },
  {
    title: "Environment Design",
    content: "Make good habits obvious and bad habits invisible by changing your environment.",
    category: 'environment',
  },
  {
    title: "The 1% Rule",
    content: "Improving just 1% each day leads to 37x better results over a year through compound growth.",
    category: 'psychology',
  },
  {
    title: "Identity-Based Habits",
    content: "Focus on who you want to become, not what you want to achieve. 'I am someone who exercises.'",
    category: 'psychology',
  },
  {
    title: "Implementation Intentions",
    content: "Plan when and where: 'When I enter my kitchen, I will drink a glass of water.'",
    category: 'getting-started',
  },
];

// Extended tips collection for the tips library
export const EXTENDED_HABIT_TIPS = [
  ...HABIT_TIPS,
  {
    title: "Habit Tracking",
    content: "What gets measured gets managed. Track your habits to stay aware of your progress.",
    category: 'psychology',
  },
  {
    title: "Motivation vs Systems",
    content: "You don't rise to the level of your goals, you fall to the level of your systems.",
    category: 'motivation',
  },
  {
    title: "The Plateau of Latent Potential",
    content: "Habits often appear to make no difference until you cross a critical threshold.",
    category: 'psychology',
  },
  {
    title: "Temptation Bundling",
    content: "Pair an action you want to do with an action you need to do.",
    category: 'habit-stacking',
  },
  {
    title: "Make It Obvious",
    content: "The 1st Law of Behavior Change: Make the cue obvious. Use implementation intentions.",
    category: 'getting-started',
  },
  {
    title: "Make It Attractive",
    content: "The 2nd Law of Behavior Change: Make the habit attractive using temptation bundling.",
    category: 'psychology',
  },
  {
    title: "Make It Easy",
    content: "The 3rd Law of Behavior Change: Make the habit easy by reducing friction.",
    category: 'getting-started',
  },
  {
    title: "Make It Satisfying",
    content: "The 4th Law of Behavior Change: Make the habit satisfying with immediate rewards.",
    category: 'psychology',
  },
  {
    title: "The Power of Tiny Changes",
    content: "Small changes in daily habits create remarkable results when done consistently over time.",
    category: 'motivation',
  },
  {
    title: "Habit Stacking Formula",
    content: "After I [existing habit], I will [new habit]. This creates a clear trigger for your new behavior.",
    category: 'habit-stacking',
  },
  {
    title: "Design Your Environment",
    content: "Change your environment so the cues of good habits are obvious and bad habits are invisible.",
    category: 'environment',
  },
  {
    title: "Never Miss Twice",
    content: "Missing once is an accident. Missing twice is the start of a new habit. Get back on track quickly.",
    category: 'motivation',
  },
  {
    title: "The 66-Day Reality",
    content: "Research shows it takes an average of 66 days (not 21!) to form a habit. The range is 18-254 days depending on complexity. Be patient with yourself.",
    category: 'psychology',
  },
  {
    title: "The Habit Loop",
    content: "Every habit follows the same pattern: Cue → Routine → Reward. Understanding this loop helps you design better habits and break bad ones.",
    category: 'psychology',
  },
];

export const STACKING_TEMPLATES = [
  "After I [existing habit], I will [new habit]",
  "Before I [existing habit], I will [new habit]", 
  "When I [situation], I will [new habit]",
  "At [time] in [location], I will [new habit]",
];