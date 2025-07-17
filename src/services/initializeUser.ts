import { supabase } from '@/services/supabase';
import { DEFAULT_CATEGORIES } from '@/services/defaultData';

export async function initializeNewUser(userId: string) {
  try {
    // Create default categories for the new user
    const categoriesWithUserId = DEFAULT_CATEGORIES.map(category => ({
      ...category,
      user_id: userId,
    }));

    const { error } = await supabase
      .from('categories')
      .insert(categoriesWithUserId);

    if (error) {
      console.error('Error creating default categories:', error);
      return false;
    }

    console.log('Default categories created for user:', userId);
    return true;
  } catch (error) {
    console.error('Error initializing user:', error);
    return false;
  }
}