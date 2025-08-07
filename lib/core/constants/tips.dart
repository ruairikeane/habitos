class HabitTip {
  final String title;
  final String content;
  final String category;

  const HabitTip({
    required this.title,
    required this.content,
    required this.category,
  });

  factory HabitTip.fromJson(Map<String, dynamic> json) {
    return HabitTip(
      title: json['title'] as String,
      content: json['content'] as String,
      category: json['category'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      'category': category,
    };
  }
}

// Basic habit tips for daily rotation
const List<HabitTip> habitTips = [
  HabitTip(
    title: "Start Small",
    content: "Begin with habits that take less than 2 minutes to complete. Success builds momentum.",
    category: 'getting-started',
  ),
  HabitTip(
    title: "Habit Stacking",
    content: "Link new habits to existing ones: 'After I pour my coffee, I will write 3 gratitudes.'",
    category: 'habit-stacking',
  ),
  HabitTip(
    title: "Environment Design",
    content: "Make good habits obvious and bad habits invisible by changing your environment.",
    category: 'environment',
  ),
  HabitTip(
    title: "The 1% Rule",
    content: "Improving just 1% each day leads to 37x better results over a year through compound growth.",
    category: 'psychology',
  ),
  HabitTip(
    title: "Identity-Based Habits",
    content: "Focus on who you want to become, not what you want to achieve. 'I am someone who exercises.'",
    category: 'psychology',
  ),
  HabitTip(
    title: "Implementation Intentions",
    content: "Plan when and where: 'When I enter my kitchen, I will drink a glass of water.'",
    category: 'getting-started',
  ),
];

// Extended tips collection for the tips library
const List<HabitTip> extendedHabitTips = [
  ...habitTips,
  HabitTip(
    title: "Habit Tracking",
    content: "What gets measured gets managed. Track your habits to stay aware of your progress.",
    category: 'psychology',
  ),
  HabitTip(
    title: "Motivation vs Systems",
    content: "You don't rise to the level of your goals, you fall to the level of your systems.",
    category: 'motivation',
  ),
  HabitTip(
    title: "The Plateau of Latent Potential",
    content: "Habits often appear to make no difference until you cross a critical threshold.",
    category: 'psychology',
  ),
  HabitTip(
    title: "Temptation Bundling",
    content: "Pair an action you want to do with an action you need to do.",
    category: 'habit-stacking',
  ),
  HabitTip(
    title: "Make It Obvious",
    content: "The 1st Law of Behavior Change: Make the cue obvious. Use implementation intentions.",
    category: 'getting-started',
  ),
  HabitTip(
    title: "Make It Attractive",
    content: "The 2nd Law of Behavior Change: Make the habit attractive using temptation bundling.",
    category: 'psychology',
  ),
  HabitTip(
    title: "Make It Easy",
    content: "The 3rd Law of Behavior Change: Make the habit easy by reducing friction.",
    category: 'getting-started',
  ),
  HabitTip(
    title: "Make It Satisfying",
    content: "The 4th Law of Behavior Change: Make the habit satisfying with immediate rewards.",
    category: 'psychology',
  ),
  HabitTip(
    title: "The Power of Tiny Changes",
    content: "Small changes in daily habits create remarkable results when done consistently over time.",
    category: 'motivation',
  ),
  HabitTip(
    title: "Habit Stacking Formula",
    content: "After I [existing habit], I will [new habit]. This creates a clear trigger for your new behavior.",
    category: 'habit-stacking',
  ),
  HabitTip(
    title: "Design Your Environment",
    content: "Change your environment so the cues of good habits are obvious and bad habits are invisible.",
    category: 'environment',
  ),
  HabitTip(
    title: "Never Miss Twice",
    content: "Missing once is an accident. Missing twice is the start of a new habit. Get back on track quickly.",
    category: 'motivation',
  ),
  HabitTip(
    title: "The 66-Day Reality",
    content: "Research shows it takes an average of 66 days (not 21!) to form a habit. The range is 18-254 days depending on complexity. Be patient with yourself.",
    category: 'psychology',
  ),
  HabitTip(
    title: "The Habit Loop",
    content: "Every habit follows the same pattern: Cue → Routine → Reward. Understanding this loop helps you design better habits and break bad ones.",
    category: 'psychology',
  ),
];

// Habit stacking templates
const List<String> stackingTemplates = [
  "After I [existing habit], I will [new habit]",
  "Before I [existing habit], I will [new habit]", 
  "When I [situation], I will [new habit]",
  "At [time] in [location], I will [new habit]",
];

// Tip categories for filtering
const List<String> tipCategories = [
  'getting-started',
  'habit-stacking',
  'environment',
  'psychology',
  'motivation',
];

// Get tips by category
List<HabitTip> getTipsByCategory(String category) {
  return extendedHabitTips
      .where((tip) => tip.category == category)
      .toList();
}

// Get random tip from basic tips for daily display
HabitTip getRandomTip() {
  final random = DateTime.now().millisecondsSinceEpoch % habitTips.length;
  return habitTips[random];
}

// Get tip of the day (based on day of year)
HabitTip getTipOfTheDay() {
  final dayOfYear = DateTime.now().difference(DateTime(DateTime.now().year, 1, 1)).inDays;
  final tipIndex = dayOfYear % habitTips.length;
  return habitTips[tipIndex];
}