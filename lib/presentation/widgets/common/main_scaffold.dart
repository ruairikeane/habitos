import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../providers/scroll_provider.dart';
import '../../providers/auth_provider.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: _buildSideDrawer(context),
      appBar: _buildAppBar(context),
      body: child,
      bottomNavigationBar: _buildBottomNavigation(context),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    final currentLocation = GoRouterState.of(context).uri.path;
    
    String title = 'Good morning!';
    if (currentLocation.startsWith('/habits')) {
      title = 'My Habits';
    } else if (currentLocation.startsWith('/statistics')) {
      title = 'Statistics';
    }

    return AppBar(
      leading: Builder(
        builder: (context) => IconButton(
          icon: Icon(Icons.menu, color: AppColors.textPrimary),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),
      title: Text(
        title,
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
      backgroundColor: AppColors.background,
      elevation: 0,
      actions: [
        // Add button for habits screen
        if (currentLocation.startsWith('/habits'))
          IconButton(
            onPressed: () {
              context.push('/habits/add');
            },
            icon: Icon(
              Icons.add,
              color: AppColors.primary,
            ),
            tooltip: 'Add Habit',
          ),
        Consumer<AuthProvider>(
          builder: (context, auth, child) {
            return Padding(
              padding: EdgeInsets.only(right: AppSpacing.md),
              child: CircleAvatar(
                backgroundColor: AppColors.primary,
                radius: 18,
                child: Text(
                  auth.user?.displayName?.substring(0, 1).toUpperCase() ?? 'U',
                  style: TextStyle(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildBottomNavigation(BuildContext context) {
    final currentLocation = GoRouterState.of(context).uri.path;
    
    int selectedIndex = 0;
    if (currentLocation.startsWith('/habits')) {
      selectedIndex = 1;
    } else if (currentLocation.startsWith('/statistics')) {
      selectedIndex = 2;
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
                label: 'Today',
                isSelected: selectedIndex == 0,
                onTap: () => context.go('/home'),
                routeName: 'home',
              ),
              _buildNavItem(
                context,
                icon: Icons.check_circle_outline,
                selectedIcon: Icons.check_circle,
                label: 'Habits',
                isSelected: selectedIndex == 1,
                onTap: () => context.go('/habits'),
                routeName: 'habits',
              ),
              _buildNavItem(
                context,
                icon: Icons.analytics_outlined,
                selectedIcon: Icons.analytics,
                label: 'Statistics',
                isSelected: selectedIndex == 2,
                onTap: () => context.go('/statistics'),
                routeName: 'statistics',
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
    String? routeName,
  }) {
    return GestureDetector(
      onTap: () {
        // If already on the current tab, scroll to top
        if (isSelected && routeName != null) {
          final scrollProvider = Provider.of<ScrollProvider>(context, listen: false);
          scrollProvider.scrollToTop(routeName);
        } else {
          // Otherwise navigate to the route
          onTap();
        }
      },
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

  Widget _buildSideDrawer(BuildContext context) {
    return Drawer(
      width: MediaQuery.of(context).size.width, // Full screen width
      backgroundColor: AppColors.background,
      child: SafeArea(
        child: Column(
          children: [
            // Header with close button
            Container(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Menu',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close, color: AppColors.textPrimary),
                  ),
                ],
              ),
            ),
            
            Divider(color: AppColors.border),
            
            // User Profile Section
            _buildUserProfileSection(context),
            
            SizedBox(height: AppSpacing.md),
            
            // Menu Items
            Expanded(
              child: ListView(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                children: [
                  _buildMenuSection(
                    context,
                    title: 'Settings',
                    items: [
                      _buildMenuItem(
                        context,
                        icon: Icons.notifications_outlined,
                        title: 'Notifications',
                        subtitle: 'Manage reminder settings',
                        onTap: () {
                          Navigator.pop(context);
                          context.push('/settings/notifications');
                        },
                      ),
                      _buildMenuItem(
                        context,
                        icon: Icons.palette_outlined,
                        title: 'Theme',
                        subtitle: 'Light theme',
                        onTap: () {
                          // TODO: Show theme picker
                        },
                      ),
                      _buildMenuItem(
                        context,
                        icon: Icons.person_outline,
                        title: 'Profile',
                        subtitle: 'Manage your account',
                        onTap: () {
                          Navigator.pop(context);
                          context.push('/settings/profile');
                        },
                      ),
                    ],
                  ),
                  
                  SizedBox(height: AppSpacing.lg),
                  
                  _buildMenuSection(
                    context,
                    title: 'Data',
                    items: [
                      _buildMenuItem(
                        context,
                        icon: Icons.cloud_sync_outlined,
                        title: 'Data Sync',
                        subtitle: 'Backup and sync your data',
                        onTap: () {
                          // TODO: Show sync settings
                        },
                      ),
                      _buildMenuItem(
                        context,
                        icon: Icons.file_download_outlined,
                        title: 'Export Data',
                        subtitle: 'Download your habit data',
                        onTap: () {
                          // TODO: Export data
                        },
                      ),
                    ],
                  ),
                  
                  SizedBox(height: AppSpacing.lg),
                  
                  _buildMenuSection(
                    context,
                    title: 'Tips & Insights',
                    items: [
                      _buildMenuItem(
                        context,
                        icon: Icons.lightbulb_outline,
                        title: 'Browse Tips',
                        subtitle: 'Get habit building advice',
                        onTap: () {
                          Navigator.pop(context);
                          context.push('/tips');
                        },
                      ),
                      _buildMenuItem(
                        context,
                        icon: Icons.psychology_outlined,
                        title: 'Psychology Tips',
                        subtitle: 'Understanding behavior change',
                        onTap: () {
                          Navigator.pop(context);
                          context.push('/tips');
                        },
                      ),
                    ],
                  ),
                  
                  SizedBox(height: AppSpacing.lg),
                  
                  _buildMenuSection(
                    context,
                    title: 'About',
                    items: [
                      _buildMenuItem(
                        context,
                        icon: Icons.help_outline,
                        title: 'Help & Support',
                        subtitle: 'Get assistance',
                        onTap: () {
                          // TODO: Show help
                        },
                      ),
                      _buildMenuItem(
                        context,
                        icon: Icons.info_outline,
                        title: 'About Habitos',
                        subtitle: 'Version 1.0.0',
                        onTap: () {
                          // TODO: Show about
                        },
                      ),
                    ],
                  ),
                  
                  SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
            
            // Sign Out Button
            Container(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: _buildSignOutButton(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserProfileSection(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        return Container(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => _showProfilePhotoOptions(context),
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: AppColors.primary.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Icon(
                          Icons.person,
                          size: 30,
                          color: AppColors.primary,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: AppColors.surface,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            Icons.camera_alt,
                            size: 12,
                            color: AppColors.textLight,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.displayName ?? 'User',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: AppSpacing.xxs),
                    Text(
                      user?.email ?? '',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMenuSection(BuildContext context, {
    required String title,
    required List<Widget> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        SizedBox(height: AppSpacing.sm),
        ...items,
      ],
    );
  }

  Widget _buildMenuItem(BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.xs),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          child: Container(
            padding: EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: AppColors.textSecondary,
                  size: 24,
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: AppSpacing.xxs),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  color: AppColors.textMuted,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignOutButton(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: authProvider.isLoading ? null : () async {
              final confirmed = await _showSignOutDialog(context);
              if (confirmed == true) {
                await authProvider.signOut();
                if (context.mounted) {
                  context.go('/auth');
                }
              }
            },
            icon: Icon(
              Icons.logout,
              color: AppColors.destructive,
            ),
            label: Text(
              authProvider.isLoading ? 'Signing Out...' : 'Sign Out',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppColors.destructive,
                fontWeight: FontWeight.w600,
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: AppColors.destructive),
              padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
            ),
          ),
        );
      },
    );
  }

  Future<bool?> _showSignOutDialog(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Sign Out'),
          content: const Text('Are you sure you want to sign out?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text(
                'Sign Out',
                style: TextStyle(color: AppColors.destructive),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showProfilePhotoOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppSpacing.radiusLg),
        ),
      ),
      builder: (context) {
        return SafeArea(
          child: Container(
            padding: EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Profile Photo',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: AppSpacing.lg),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(
                      Icons.photo_camera,
                      color: AppColors.primary,
                    ),
                  ),
                  title: Text(
                    'Take Photo',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Use camera to take a new photo',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    // TODO: Implement camera functionality
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Camera functionality coming soon'),
                        backgroundColor: AppColors.info,
                      ),
                    );
                  },
                ),
                SizedBox(height: AppSpacing.sm),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(
                      Icons.photo_library,
                      color: AppColors.secondary,
                    ),
                  ),
                  title: Text(
                    'Choose from Library',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Select a photo from your gallery',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    // TODO: Implement gallery picker
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Gallery functionality coming soon'),
                        backgroundColor: AppColors.info,
                      ),
                    );
                  },
                ),
                SizedBox(height: AppSpacing.sm),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.destructive.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Icon(
                      Icons.delete_outline,
                      color: AppColors.destructive,
                    ),
                  ),
                  title: Text(
                    'Remove Photo',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: AppColors.destructive,
                    ),
                  ),
                  subtitle: Text(
                    'Use default avatar icon',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    // TODO: Remove photo and reset to default
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Photo removed'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                ),
                SizedBox(height: AppSpacing.lg),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Cancel',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}