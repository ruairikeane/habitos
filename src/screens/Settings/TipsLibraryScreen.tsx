import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { EXTENDED_HABIT_TIPS } from '@/services/defaultData';
import type { TipsLibraryScreenProps } from '@/types';

const TIP_CATEGORIES = [
  { id: 'all', name: 'All Tips', icon: 'library-outline' },
  { id: 'getting-started', name: 'Getting Started', icon: 'play-outline' },
  { id: 'habit-stacking', name: 'Habit Stacking', icon: 'link-outline' },
  { id: 'psychology', name: 'Psychology', icon: 'brain-outline' },
  { id: 'environment', name: 'Environment', icon: 'home-outline' },
  { id: 'motivation', name: 'Motivation', icon: 'flame-outline' },
];


export function TipsLibraryScreen({ navigation }: TipsLibraryScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedTips, setBookmarkedTips] = useState<Set<number>>(new Set());

  const filteredTips = EXTENDED_HABIT_TIPS.filter(tip => {
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (index: number) => {
    const newBookmarks = new Set(bookmarkedTips);
    if (newBookmarks.has(index)) {
      newBookmarks.delete(index);
    } else {
      newBookmarks.add(index);
    }
    setBookmarkedTips(newBookmarks);
  };

  const getTipColor = (index: number) => {
    const colors_list = [
      colors.health,
      colors.learning,
      colors.mindfulness,
      colors.personalCare,
      colors.social,
      colors.creative,
    ];
    return colors_list[index % colors_list.length];
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Tips Library
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[typography.body, styles.searchInput]}
              placeholder="Search tips..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          {TIP_CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? colors.surface : colors.textSecondary} 
              />
              <Text style={[
                typography.caption, 
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tips Grid */}
        <View style={styles.tipsSection}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            {selectedCategory === 'all' ? 'All Tips' : TIP_CATEGORIES.find(c => c.id === selectedCategory)?.name} 
            ({filteredTips.length})
          </Text>

          {filteredTips.length === 0 ? (
            <View style={[globalStyles.card, styles.emptyCard]}>
              <Text style={[typography.body, styles.emptyText]}>
                No tips found matching your search.
              </Text>
            </View>
          ) : (
            filteredTips.map((tip, index) => {
              const tipColor = getTipColor(index);
              const isBookmarked = bookmarkedTips.has(index);
              
              return (
                <View 
                  key={index} 
                  style={[
                    globalStyles.card, 
                    styles.tipCard,
                    { 
                      borderLeftColor: tipColor,
                      backgroundColor: tipColor + '08'
                    }
                  ]}
                >
                  <View style={styles.tipHeader}>
                    <Text style={[typography.h5, styles.tipTitle, { color: tipColor }]}>
                      {tip.title}
                    </Text>
                    <TouchableOpacity 
                      style={styles.bookmarkButton}
                      onPress={() => toggleBookmark(index)}
                    >
                      <Ionicons 
                        name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={isBookmarked ? colors.warning : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[typography.body, styles.tipContent]}>
                    {tip.content}
                  </Text>
                  
                  {tip.category && (
                    <Text style={[typography.caption, styles.tipCategory]}>
                      {TIP_CATEGORIES.find(c => c.id === tip.category)?.name || 'General'}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  searchSection: {
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoryFilters: {
    marginBottom: spacing.lg,
  },
  categoryFiltersContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  tipsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  tipCard: {
    borderLeftWidth: 4,
    gap: spacing.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tipTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  tipContent: {
    lineHeight: 22,
  },
  tipCategory: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});