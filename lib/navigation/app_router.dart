import 'package:go_router/go_router.dart';
import '../presentation/screens/auth/sign_in_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/habits/habits_screen.dart';
import '../presentation/screens/habits/add_habit_screen.dart';
import '../presentation/screens/habits/habit_detail_screen.dart';
import '../presentation/screens/statistics/statistics_screen.dart';
import '../presentation/screens/tips/tips_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/settings/profile_screen.dart';
import '../presentation/screens/settings/notifications_screen.dart';
import '../presentation/widgets/common/main_scaffold.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/auth',
    routes: [
      // Auth routes
      GoRoute(
        path: '/auth',
        name: 'auth',
        builder: (context, state) => const SignInScreen(),
      ),
      
      // Main app routes with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/habits',
            name: 'habits',
            builder: (context, state) => const HabitsScreen(),
            routes: [
              GoRoute(
                path: 'add',
                name: 'add-habit',
                builder: (context, state) => const AddHabitScreen(),
              ),
              GoRoute(
                path: 'detail/:habitId',
                name: 'habit-detail',
                builder: (context, state) => HabitDetailScreen(
                  habitId: state.pathParameters['habitId']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/statistics',
            name: 'statistics',
            builder: (context, state) => const StatisticsScreen(),
          ),
          GoRoute(
            path: '/tips',
            name: 'tips',
            builder: (context, state) => const TipsScreen(),
          ),
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
        ],
      ),
    ],
  );
}