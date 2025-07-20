import React, { createContext, useContext, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/styles';
import type { TabParamList } from '@/types';

// Create context for scroll refs
export const ScrollToTopContext = createContext<{
  scrollRefs: React.MutableRefObject<Record<string, () => void>>;
}>({
  scrollRefs: { current: {} }
});

// Custom hook to register scroll functions
export const useScrollToTop = (tabName: string, scrollFunction: () => void) => {
  const { scrollRefs } = useContext(ScrollToTopContext);
  
  React.useEffect(() => {
    console.log(`📝 Registering scroll function for ${tabName}`);
    scrollRefs.current[tabName] = scrollFunction;
    
    return () => {
      console.log(`🗑️ Unregistering scroll function for ${tabName}`);
      delete scrollRefs.current[tabName];
    };
  }, [tabName, scrollFunction, scrollRefs]);
};

// Import screens
import { HomeScreen } from '@/screens/Home/HomeScreen';
import { HabitsScreen } from '@/screens/Habits/HabitsScreen';
import { StatisticsScreen } from '@/screens/Statistics/StatisticsScreen';
import { TipsScreen } from '@/screens/Tips/TipsScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const scrollRefs = useRef<Record<string, () => void>>({});

  return (
    <ScrollToTopContext.Provider value={{ scrollRefs }}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Habits':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Tips':
              iconName = focused ? 'bulb' : 'bulb-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          ...typography.tabLabel,
          fontSize: 12,
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          ...typography.h4,
          color: colors.textPrimary,
        },
        headerTintColor: colors.textPrimary,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Today',
          headerTitle: 'Today\'s Habits',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentTabRoute = state.routes[state.index];
            if (currentTabRoute.name === route.name) {
              console.log(`🔝 Tab press detected on current tab: ${route.name}`);
              const scrollToTop = scrollRefs.current[route.name];
              if (scrollToTop) {
                console.log(`🔝 Executing scroll for ${route.name}`);
                scrollToTop();
              } else {
                console.log(`🔝 No scroll function registered for ${route.name}`);
              }
            }
          },
        })}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          title: 'Habits',
          headerTitle: 'My Habits',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentTabRoute = state.routes[state.index];
            if (currentTabRoute.name === route.name) {
              console.log(`🔝 Tab press detected on current tab: ${route.name}`);
              const scrollToTop = scrollRefs.current[route.name];
              if (scrollToTop) {
                console.log(`🔝 Executing scroll for ${route.name}`);
                scrollToTop();
              } else {
                console.log(`🔝 No scroll function registered for ${route.name}`);
              }
            }
          },
        })}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Stats',
          headerTitle: 'Progress & Insights',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentTabRoute = state.routes[state.index];
            if (currentTabRoute.name === route.name) {
              console.log(`🔝 Tab press detected on current tab: ${route.name}`);
              const scrollToTop = scrollRefs.current[route.name];
              if (scrollToTop) {
                console.log(`🔝 Executing scroll for ${route.name}`);
                scrollToTop();
              } else {
                console.log(`🔝 No scroll function registered for ${route.name}`);
              }
            }
          },
        })}
      />
      <Tab.Screen
        name="Tips"
        component={TipsScreen}
        options={{
          title: 'Tips',
          headerTitle: 'Tips & Suggestions',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentTabRoute = state.routes[state.index];
            if (currentTabRoute.name === route.name) {
              console.log(`🔝 Tab press detected on current tab: ${route.name}`);
              const scrollToTop = scrollRefs.current[route.name];
              if (scrollToTop) {
                console.log(`🔝 Executing scroll for ${route.name}`);
                scrollToTop();
              } else {
                console.log(`🔝 No scroll function registered for ${route.name}`);
              }
            }
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentTabRoute = state.routes[state.index];
            if (currentTabRoute.name === route.name) {
              console.log(`🔝 Tab press detected on current tab: ${route.name}`);
              const scrollToTop = scrollRefs.current[route.name];
              if (scrollToTop) {
                console.log(`🔝 Executing scroll for ${route.name}`);
                scrollToTop();
              } else {
                console.log(`🔝 No scroll function registered for ${route.name}`);
              }
            }
          },
        })}
      />
    </Tab.Navigator>
    </ScrollToTopContext.Provider>
  );
}