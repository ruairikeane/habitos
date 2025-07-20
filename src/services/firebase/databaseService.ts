import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { firestore, COLLECTIONS, handleFirebaseError } from './config';
import type { Habit, HabitEntry, Category, HabitWithCategory } from '@/types';

export class FirebaseDatabaseService {
  /**
   * Categories
   */
  static async getCategories(userId: string): Promise<Category[]> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const categoriesRef = collection(firestore, COLLECTIONS.CATEGORIES);
      const q = query(categoriesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().createdAt,
          updated_at: doc.data().updatedAt
        } as Category);
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async createCategory(userId: string, category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const categoriesRef = collection(firestore, COLLECTIONS.CATEGORIES);
      const now = new Date().toISOString();
      
      const categoryData = {
        ...category,
        userId,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(categoriesRef, categoryData);
      
      return {
        id: docRef.id,
        user_id: userId,
        created_at: now,
        updated_at: now,
        ...category
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const categoryRef = doc(firestore, COLLECTIONS.CATEGORIES, categoryId);
      await deleteDoc(categoryRef);
      console.log(`Firebase: Deleted category ${categoryId}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const categoryRef = doc(firestore, COLLECTIONS.CATEGORIES, categoryId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(categoryRef, updateData);
      console.log(`Firebase: Updated category ${categoryId}`, updates);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * Habits
   */
  static async getHabits(userId: string): Promise<HabitWithCategory[]> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const habitsRef = collection(firestore, COLLECTIONS.HABITS);
      // Simplified query to avoid index requirement - filter active habits in code
      const q = query(
        habitsRef, 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const categories = await this.getCategories(userId);

      const habits: HabitWithCategory[] = [];
      querySnapshot.forEach((doc) => {
        const habitData = doc.data();
        
        // Client-side filter for active habits only
        if (habitData.isActive !== true) {
          return;
        }
        
        const category = categories.find(c => c.id === habitData.categoryId);
        
        habits.push({
          id: doc.id,
          user_id: userId,
          category_id: habitData.categoryId,
          name: habitData.name,
          description: habitData.description,
          frequency: habitData.frequency,
          reminder_time: habitData.reminderTime,
          is_active: habitData.isActive,
          created_at: habitData.createdAt,
          updated_at: habitData.updatedAt,
          category: category || {
            id: habitData.categoryId,
            name: 'Default',
            color: '#8B7355',
            icon: 'star',
            user_id: userId,
            created_at: habitData.createdAt,
            updated_at: habitData.updatedAt
          }
        });
      });

      // Client-side sort by createdAt descending
      habits.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return habits;
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async createHabit(userId: string, habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<HabitWithCategory> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const habitsRef = collection(firestore, COLLECTIONS.HABITS);
      const now = new Date().toISOString();
      
      const habitData: any = {
        userId,
        categoryId: habit.category_id,
        name: habit.name,
        frequency: habit.frequency,
        isActive: habit.is_active ?? true,
        createdAt: now,
        updatedAt: now
      };

      // Only add fields that are not undefined
      if (habit.description !== undefined && habit.description !== null) {
        habitData.description = habit.description;
      }
      if (habit.reminder_time !== undefined && habit.reminder_time !== null) {
        habitData.reminderTime = habit.reminder_time;
      }

      const docRef = await addDoc(habitsRef, habitData);
      
      // Get the category
      const categories = await this.getCategories(userId);
      const category = categories.find(c => c.id === habit.category_id);
      
      return {
        id: docRef.id,
        user_id: userId,
        category_id: habit.category_id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        reminder_time: habit.reminder_time,
        is_active: habit.is_active ?? true,
        created_at: now,
        updated_at: now,
        category: category || {
          id: habit.category_id,
          name: 'Default',
          color: '#8B7355',
          icon: 'star',
          user_id: userId,
          created_at: now,
          updated_at: now
        }
      };
    } catch (error) {
      console.error('Error creating habit:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const habitRef = doc(firestore, COLLECTIONS.HABITS, habitId);
      
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.reminder_time !== undefined) updateData.reminderTime = updates.reminder_time;
      if (updates.is_active !== undefined) updateData.isActive = updates.is_active;
      if (updates.category_id !== undefined) updateData.categoryId = updates.category_id;

      await updateDoc(habitRef, updateData);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const batch = writeBatch(firestore);
      
      // Delete the habit
      const habitRef = doc(firestore, COLLECTIONS.HABITS, habitId);
      batch.delete(habitRef);
      
      // Delete all habit entries
      const entriesRef = collection(firestore, COLLECTIONS.HABIT_ENTRIES);
      const entriesQuery = query(entriesRef, where('habitId', '==', habitId));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      entriesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * Habit Entries
   */
  static async getHabitEntries(userId: string, habitId?: string, date?: string): Promise<HabitEntry[]> {
    try {
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const entriesRef = collection(firestore, COLLECTIONS.HABIT_ENTRIES);
      // Simplified query to avoid index requirement - filter by user only
      const q = query(entriesRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      const entries: HabitEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Client-side filtering for habitId and date to avoid index requirements
        if (habitId && data.habitId !== habitId) {
          return;
        }
        
        if (date && data.date !== date) {
          return;
        }
        
        entries.push({
          id: doc.id,
          habit_id: data.habitId,
          user_id: data.userId,
          entry_date: data.date,
          is_completed: data.isCompleted,
          completed_at: data.completedAt,
          notes: data.notes,
          created_at: data.createdAt
        });
      });

      return entries;
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  static async toggleHabitCompletion(userId: string, habitId: string, date: string): Promise<void> {
    try {
      console.log('Firebase: toggleHabitCompletion called with:', { userId, habitId, date });
      
      if (!firestore) {
        throw new Error('Firebase not initialized');
      }

      const entriesRef = collection(firestore, COLLECTIONS.HABIT_ENTRIES);
      // Simplified query to avoid index requirement - filter by user only
      const q = query(entriesRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      
      // Client-side filtering to find the specific entry
      const matchingDocs = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.habitId === habitId && data.date === date;
      });
      
      console.log('Firebase: Found', matchingDocs.length, 'existing entries for this date');
      
      if (matchingDocs.length === 0) {
        // Create new entry
        console.log('Firebase: Creating new entry - marking as completed');
        await addDoc(entriesRef, {
          userId,
          habitId,
          date,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          notes: '',
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing entry
        const entryDoc = matchingDocs[0];
        const currentData = entryDoc.data();
        const newCompleted = !currentData.isCompleted;
        
        console.log('Firebase: Updating existing entry from', currentData.isCompleted, 'to', newCompleted);
        
        await updateDoc(entryDoc.ref, {
          isCompleted: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : null
        });
      }
      
      console.log('Firebase: toggleHabitCompletion completed successfully');
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw new Error(handleFirebaseError(error));
    }
  }

  /**
   * Real-time listeners
   */
  static listenToHabits(userId: string, callback: (habits: HabitWithCategory[]) => void) {
    if (!firestore) {
      return () => {};
    }

    const habitsRef = collection(firestore, COLLECTIONS.HABITS);
    // Simplified query to avoid index requirement - filter active habits in code
    const q = query(
      habitsRef,
      where('userId', '==', userId)
    );

    return onSnapshot(q, async (snapshot) => {
      try {
        const categories = await this.getCategories(userId);
        const habits: HabitWithCategory[] = [];
        
        snapshot.forEach((doc) => {
          const habitData = doc.data();
          
          // Client-side filter for active habits only
          if (habitData.isActive !== true) {
            return;
          }
          
          const category = categories.find(c => c.id === habitData.categoryId);
          
          habits.push({
            id: doc.id,
            user_id: userId,
            category_id: habitData.categoryId,
            name: habitData.name,
            description: habitData.description,
            frequency: habitData.frequency,
            reminder_time: habitData.reminderTime,
            is_active: habitData.isActive,
            created_at: habitData.createdAt,
            updated_at: habitData.updatedAt,
            category: category || {
              id: habitData.categoryId,
              name: 'Default',
              color: '#8B7355',
              icon: 'star',
              user_id: userId,
              created_at: habitData.createdAt,
              updated_at: habitData.updatedAt
            }
          });
        });
        
        // Client-side sort by createdAt descending
        habits.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        callback(habits);
      } catch (error) {
        console.error('Error in habits listener:', error);
      }
    });
  }

  static listenToHabitEntries(userId: string, callback: (entries: HabitEntry[]) => void) {
    if (!firestore) {
      return () => {};
    }

    const entriesRef = collection(firestore, COLLECTIONS.HABIT_ENTRIES);
    const q = query(entriesRef, where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
      const entries: HabitEntry[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          habit_id: data.habitId,
          user_id: data.userId,
          entry_date: data.date,
          is_completed: data.isCompleted,
          completed_at: data.completedAt,
          notes: data.notes,
          created_at: data.createdAt
        });
      });
      
      callback(entries);
    });
  }
}