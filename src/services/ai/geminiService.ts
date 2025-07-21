import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HabitWithCategory } from '@/types';

interface HabitSuggestion {
  name: string;
  category: string;
  reasoning: string;
  stackingOpportunity?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  estimatedMinutes: number;
}

interface AIAnalysis {
  suggestions: HabitSuggestion[];
  insights: string[];
  habitPatterns: string[];
  recommendations: string[];
}

class GeminiService {
  private genAI?: GoogleGenerativeAI;
  private model?: any;

  constructor() {
    // Initialize with API key from environment
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('🤖 Gemini API key not found. AI suggestions will use fallback logic.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('🤖 Gemini AI initialized successfully! Ready for intelligent suggestions.');
  }

  /**
   * Generate intelligent habit suggestions based on user's existing habits
   */
  async generateHabitSuggestions(
    currentHabits: HabitWithCategory[],
    userPreferences?: {
      timeAvailable?: number; // minutes per day
      focusAreas?: string[]; // areas they want to improve
      challengeLevel?: 'gentle' | 'moderate' | 'ambitious';
      lifestyle?: 'student' | 'professional' | 'parent' | 'retiree' | 'entrepreneur';
    }
  ): Promise<AIAnalysis> {
    try {
      if (!this.model) {
        return this.getFallbackSuggestions(currentHabits);
      }

      const prompt = this.buildPrompt(currentHabits, userPreferences);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      return this.parseAIResponse(analysisText);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackSuggestions(currentHabits);
    }
  }

  /**
   * Build sophisticated prompt for Gemini
   */
  private buildPrompt(
    habits: HabitWithCategory[],
    preferences?: any
  ): string {
    const habitsList = habits.map(h => 
      `- "${h.name}" (${h.category.name}, ${h.frequency})`
    ).join('\n');

    const preferencesText = preferences ? `
User Preferences:
- Available time: ${preferences.timeAvailable || 'not specified'} minutes/day
- Focus areas: ${preferences.focusAreas?.join(', ') || 'not specified'}
- Challenge level: ${preferences.challengeLevel || 'moderate'}
- Lifestyle: ${preferences.lifestyle || 'not specified'}
    ` : '';

    return `You are an expert habit coach and behavioral scientist. Analyze this user's current habits and provide intelligent, personalized recommendations.

Current Habits:
${habitsList || 'No habits yet (new user)'}

${preferencesText}

Please provide a JSON response with this exact structure:
{
  "suggestions": [
    {
      "name": "Specific habit recommendation",
      "category": "Health & Wellness|Productivity|Learning|Mindfulness|Personal Care|Social|Creative|Fitness",
      "reasoning": "Why this habit makes sense for this user specifically",
      "stackingOpportunity": "How to stack with existing habits (if applicable)",
      "difficulty": "easy|medium|hard",
      "timeOfDay": "morning|afternoon|evening|anytime",
      "estimatedMinutes": 5-30
    }
  ],
  "insights": [
    "Observation about their current habit patterns",
    "Another insight about balance or gaps"
  ],
  "habitPatterns": [
    "Pattern you notice in their habits"
  ],
  "recommendations": [
    "High-level strategic advice for habit building"
  ]
}

Guidelines:
1. Suggest 4-6 highly relevant habits
2. Look for habit stacking opportunities with existing habits
3. Consider missing categories for life balance
4. Provide specific, actionable habit names (not generic)
5. Explain reasoning based on their current patterns
6. Consider difficulty progression (don't overwhelm)
7. Think about complementary habits that enhance existing ones
8. For new users, suggest foundational keystone habits

Make suggestions feel personal and intelligent, not generic.`;
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(response: string): AIAnalysis {
    try {
      // Clean up response to extract JSON - handle markdown code blocks
      let jsonText = response;
      
      // Remove markdown code blocks if present
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Fallback to finding JSON object
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonText);
      
      // Validate structure
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid response structure');
      }

      return {
        suggestions: parsed.suggestions.map((s: any) => ({
          name: s.name || 'Untitled habit',
          category: s.category || 'Productivity',
          reasoning: s.reasoning || 'AI-recommended habit',
          stackingOpportunity: s.stackingOpportunity,
          difficulty: s.difficulty || 'easy',
          timeOfDay: s.timeOfDay || 'anytime',
          estimatedMinutes: s.estimatedMinutes || 10
        })),
        insights: parsed.insights || [],
        habitPatterns: parsed.habitPatterns || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw response:', response);
      
      // Return fallback if parsing fails
      return {
        suggestions: [
          {
            name: 'Start with a simple morning routine',
            category: 'Productivity',
            reasoning: 'Building consistency with morning habits creates momentum for the day',
            difficulty: 'easy',
            timeOfDay: 'morning',
            estimatedMinutes: 10
          }
        ],
        insights: ['AI analysis temporarily unavailable'],
        habitPatterns: [],
        recommendations: ['Start small and build consistency']
      };
    }
  }

  /**
   * Fallback suggestions when AI is unavailable
   */
  private getFallbackSuggestions(habits: HabitWithCategory[]): AIAnalysis {
    // Use existing hardcoded logic as fallback
    const suggestions = this.getStaticSuggestions(habits);
    
    return {
      suggestions: suggestions.map(s => ({
        name: s.name,
        category: s.category,
        reasoning: s.reason,
        difficulty: 'easy',
        timeOfDay: 'anytime',
        estimatedMinutes: 10
      })),
      insights: [
        `You have habits in ${new Set(habits.map(h => h.category.name)).size} categories`,
        habits.length === 0 ? 'Start with foundational habits' : 'Consider expanding to new areas'
      ],
      habitPatterns: this.analyzePatterns(habits),
      recommendations: ['Build consistency before adding complexity']
    };
  }

  private getStaticSuggestions(habits: HabitWithCategory[]) {
    // Your existing suggestion logic as fallback
    if (habits.length === 0) {
      return [
        { name: "Drink a glass of water when you wake up", category: "Health & Wellness", reason: "Start your day with hydration" },
        { name: "Make your bed every morning", category: "Productivity", reason: "Begin each day with a small win" },
        { name: "Read 5 pages before bed", category: "Learning", reason: "Build a learning habit" },
        { name: "Take 3 deep breaths before meals", category: "Mindfulness", reason: "Practice mindful eating" }
      ];
    }
    
    // Add your existing suggestion logic here...
    return [];
  }

  private analyzePatterns(habits: HabitWithCategory[]): string[] {
    const patterns = [];
    const categories = habits.map(h => h.category.name.toLowerCase());
    
    if (categories.includes('health') && categories.includes('fitness')) {
      patterns.push('Strong focus on physical wellness');
    }
    
    if (habits.some(h => h.name.toLowerCase().includes('morning'))) {
      patterns.push('Morning routine oriented');
    }
    
    return patterns;
  }

  /**
   * Get contextual insights about user's habit journey
   */
  async getHabitInsights(habits: HabitWithCategory[]): Promise<string[]> {
    try {
      if (!this.model || habits.length === 0) {
        return ['Start building your first habit to unlock personalized insights!'];
      }

      const prompt = `Analyze these habits and provide 2-3 encouraging insights about the user's progress:
      
${habits.map(h => `- ${h.name} (${h.category.name})`).join('\n')}

Provide insights as a JSON array of strings focusing on:
1. Positive patterns you notice
2. Balance across life areas
3. Potential for growth

Format: ["insight 1", "insight 2", "insight 3"]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : ['Great progress on your habit journey!'];
    } catch (error) {
      console.error('Error getting insights:', error);
      return [`You have ${habits.length} active habits across ${new Set(habits.map(h => h.category.name)).size} categories!`];
    }
  }
}

export const geminiService = new GeminiService();
export type { HabitSuggestion, AIAnalysis };