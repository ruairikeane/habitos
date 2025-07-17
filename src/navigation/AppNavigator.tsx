// React import not needed for this file
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from '@/styles';
import type { RootStackParamList } from '@/types';

import { TabNavigator } from './TabNavigator';
import { AddHabitScreen, HabitDetailScreen, EditHabitScreen } from '@/screens';
import { NotificationSettingsScreen } from '@/screens/Settings/NotificationSettingsScreen';
import { TipsLibraryScreen } from '@/screens/Settings/TipsLibraryScreen';
import { AppearanceScreen } from '@/screens/Settings/AppearanceScreen';
import { DataBackupScreen } from '@/screens/Settings/DataBackupScreen';
import { ProfileScreen } from '@/screens/Settings/ProfileScreen';
import { HelpSupportScreen } from '@/screens/Settings/HelpSupportScreen';
import { AboutScreen } from '@/screens/Settings/AboutScreen';
import { DataSyncScreen } from '@/screens/Settings/DataSyncScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            ...typography.h4,
            color: colors.textPrimary,
          },
          headerTintColor: colors.textPrimary,
          headerBackVisible: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{
            headerShown: false, // We'll use custom header in the screen
          }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{
            headerShown: false, // We'll use custom header in the screen
          }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="EditHabit"
          component={EditHabitScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="TipsLibrary"
          component={TipsLibraryScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="DataSync"
          component={DataSyncScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="Appearance"
          component={AppearanceScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="DataBackup"
          component={DataBackupScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            headerShown: false, // Using custom header in the screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}