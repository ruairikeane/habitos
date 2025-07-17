// Tips and educational content type definitions

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: TipCategory;
  type: TipType;
  difficulty: TipDifficulty;
  tags: string[];
  examples?: string[];
  relatedTips?: string[]; // Tip IDs
  createdDate: Date;
  isBookmarked?: boolean;
  isHelpful?: boolean;
}

export enum TipCategory {
  HABIT_FORMATION = 'habit_formation',
  HABIT_STACKING = 'habit_stacking',
  IMPLEMENTATION = 'implementation',
  MOTIVATION = 'motivation',
  TROUBLESHOOTING = 'troubleshooting',
  SCIENCE = 'science',
  PSYCHOLOGY = 'psychology'
}

export enum TipType {
  DAILY = 'daily',
  CONTEXTUAL = 'contextual',
  EDUCATIONAL = 'educational',
  TEMPLATE = 'template',
  CHALLENGE = 'challenge'
}

export enum TipDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface HabitStackTemplate {
  id: string;
  name: string;
  description: string;
  formula: string; // "After I [trigger], I will [new habit]"
  trigger: string;
  newHabit: string;
  examples: string[];
  category: string;
  difficulty: TipDifficulty;
}

export interface ImplementationIntention {
  id: string;
  name: string;
  description: string;
  formula: string; // "When [situation], then I will [action]"
  situation: string;
  action: string;
  examples: string[];
  type: 'time_based' | 'location_based' | 'trigger_based';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  duration: number; // days
  instructions: string[];
  tips: string[];
  successCriteria: string[];
  startDate?: Date;
  isCompleted?: boolean;
  progress?: number; // 0-1
}