import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../presentation/screens/auth/sign_in_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/habits/habits_screen.dart';
import '../presentation/screens/habits/add_habit_screen.dart';
import '../presentation/screens/habits/edit_habit_screen.dart';
import '../presentation/screens/habits/habit_detail_screen.dart';
import '../presentation/screens/statistics/statistics_screen.dart';
import '../presentation/screens/tips/tips_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/settings/profile_screen.dart';
import '../presentation/screens/settings/notifications_screen.dart';
import '../presentation/widgets/common/main_scaffold.dart';

class AppRouter {
  // Map route paths to bottom navigation indices
  static final Map<String, int> _routeIndices = {
    '/home': 0,
    '/habits': 1,
    '/statistics': 2,
  };

  static int? _lastIndex;

  static Page<T> _buildPageWithSlideTransition<T extends Object?>(
    BuildContext context,
    GoRouterState state,
    Widget child,
  ) {
    return CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 150), // Quick and smooth
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        // Simple fade transition - works great on simulators
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: Curves.easeInOut,
          ),
          child: child,
        );
      },
    );
  }

  static final router = GoRouter(
    initialLocation: '/auth',
    routes: [
      // Auth routes
      GoRoute(
        path: '/auth',
        name: 'auth',
        builder: (context, state) => const SignInScreen(),
      ),
      
      // Standalone routes (without bottom navigation)
      GoRoute(
        path: '/habits/add',
        name: 'add-habit',
        builder: (context, state) => const AddHabitScreen(),
      ),
      GoRoute(
        path: '/habits/detail/:habitId',
        name: 'habit-detail',
        builder: (context, state) => HabitDetailScreen(
          habitId: state.pathParameters['habitId']!,
        ),
      ),
      GoRoute(
        path: '/habits/edit/:habitId',
        name: 'edit-habit',
        builder: (context, state) => EditHabitScreen(
          habitId: state.pathParameters['habitId']!,
        ),
      ),
      
      // Settings and Tips - now standalone full-screen
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
        routes: [
          GoRoute(
            path: 'profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: 'notifications',
            name: 'notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/tips',
        name: 'tips',
        builder: (context, state) => const TipsScreen(),
      ),
      
      // Main app routes with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            pageBuilder: (context, state) => _buildPageWithSlideTransition(
              context,
              state,
              const HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/habits',
            name: 'habits',
            pageBuilder: (context, state) => _buildPageWithSlideTransition(
              context,
              state,
              const HabitsScreen(),
            ),
          ),
          GoRoute(
            path: '/statistics',
            name: 'statistics',
            pageBuilder: (context, state) => _buildPageWithSlideTransition(
              context,
              state,
              const StatisticsScreen(),
            ),
          ),
        ],
      ),
    ],
  );
}