import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: _buildBottomNavigation(context),
    );
  }

  Widget _buildBottomNavigation(BuildContext context) {
    final currentLocation = GoRouterState.of(context).uri.path;
    
    int selectedIndex = 0;
    if (currentLocation.startsWith('/habits')) {
      selectedIndex = 1;
    } else if (currentLocation.startsWith('/statistics')) {
      selectedIndex = 2;
    } else if (currentLocation.startsWith('/tips')) {
      selectedIndex = 3;
    } else if (currentLocation.startsWith('/settings')) {
      selectedIndex = 4;
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            offset: const Offset(0, -2),
            blurRadius: 8,
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: AppSpacing.bottomNavHeight,
          padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                icon: Icons.home_outlined,
                selectedIcon: Icons.home,
                label: 'Home',
                isSelected: selectedIndex == 0,
                onTap: () => context.go('/home'),
              ),
              _buildNavItem(
                context,
                icon: Icons.check_circle_outline,
                selectedIcon: Icons.check_circle,
                label: 'Habits',
                isSelected: selectedIndex == 1,
                onTap: () => context.go('/habits'),
              ),
              _buildNavItem(
                context,
                icon: Icons.analytics_outlined,
                selectedIcon: Icons.analytics,
                label: 'Stats',
                isSelected: selectedIndex == 2,
                onTap: () => context.go('/statistics'),
              ),
              _buildNavItem(
                context,
                icon: Icons.lightbulb_outline,
                selectedIcon: Icons.lightbulb,
                label: 'Tips',
                isSelected: selectedIndex == 3,
                onTap: () => context.go('/tips'),
              ),
              _buildNavItem(
                context,
                icon: Icons.settings_outlined,
                selectedIcon: Icons.settings,
                label: 'Settings',
                isSelected: selectedIndex == 4,
                onTap: () => context.go('/settings'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.xs,
          vertical: AppSpacing.xs,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? selectedIcon : icon,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
              size: AppSpacing.iconMd,
            ),
            SizedBox(height: AppSpacing.xxs),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textMuted,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}