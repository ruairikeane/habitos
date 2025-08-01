import { FirebaseDatabaseService } from '../../services/firebase';
import { DEFAULT_CATEGORIES } from '../../services/defaultData';

export async function initializeNewUser(userId: string) {
  try {
    console.log('Initializing new user with default categories:', userId);
    
    // Create default categories for the new user in Firebase
    for (const categoryData of DEFAULT_CATEGORIES) {
      try {
        await FirebaseDatabaseService.createCategory(userId, categoryData);
        console.log('Created default category:', categoryData.name);
      } catch (error) {
        console.error('Error creating category:', categoryData.name, error);
      }
    }

    console.log('Default categories created for user:', userId);
    return true;
  } catch (error) {
    console.error('Error initializing user:', error);
    return false;
  }
}