import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../providers/auth_provider.dart';
import '../../providers/settings_provider.dart';
import '../../providers/scroll_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSettings();
    });
  }

  void _loadSettings() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final settingsProvider = Provider.of<SettingsProvider>(context, listen: false);
    
    if (authProvider.user != null) {
      settingsProvider.loadSettings(authProvider.user!.id);
    }
  }

  Future<void> _loadData() async {
    _loadSettings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Settings',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer<ScrollProvider>(
          builder: (context, scrollProvider, child) {
            final scrollController = scrollProvider.getScrollController('settings');
            return SingleChildScrollView(
              controller: scrollController,
              padding: EdgeInsets.all(AppSpacing.screenPadding),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                // Account Section
                _buildSectionHeader('Account'),
            _buildSettingsTile(
              icon: Icons.person_outline,
              title: 'Profile',
              subtitle: 'Manage your account settings',
              onTap: () => context.push('/settings/profile'),
            ),
            
            SizedBox(height: AppSpacing.sectionSpacing),
            
            // Preferences Section
            _buildSectionHeader('Preferences'),
            _buildSettingsTile(
              icon: Icons.notifications_outlined,
              title: 'Notifications',
              subtitle: 'Manage reminder settings',
              onTap: () => context.push('/settings/notifications'),
            ),
            _buildSettingsTile(
              icon: Icons.palette_outlined,
              title: 'Theme',
              subtitle: 'Light theme',
              onTap: () {
                // TODO: Show theme picker
              },
            ),
            
            SizedBox(height: AppSpacing.sectionSpacing),
            
            // Data Section
            _buildSectionHeader('Data'),
            _buildSettingsTile(
              icon: Icons.cloud_sync_outlined,
              title: 'Data Sync',
              subtitle: 'Backup and sync your data',
              onTap: () {
                // TODO: Show sync settings
              },
            ),
            _buildSettingsTile(
              icon: Icons.file_download_outlined,
              title: 'Export Data',
              subtitle: 'Download your habit data',
              onTap: () {
                // TODO: Export data
              },
            ),
            
            SizedBox(height: AppSpacing.sectionSpacing),
            
            // About Section
            _buildSectionHeader('About'),
            _buildSettingsTile(
              icon: Icons.help_outline,
              title: 'Help & Support',
              subtitle: 'Get help with the app',
              onTap: () {
                // TODO: Show help screen
              },
            ),
            _buildSettingsTile(
              icon: Icons.info_outline,
              title: 'About Habitos',
              subtitle: 'Version 1.0.0',
              onTap: () {
                // TODO: Show about screen
              },
            ),
            
            SizedBox(height: AppSpacing.sectionSpacing),
            
                // Sign Out
                _buildSignOutButton(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.sm,
        bottom: AppSpacing.md,
      ),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: AppColors.primary,
          size: AppSpacing.iconMd,
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        trailing: trailing ?? Icon(
          Icons.chevron_right,
          color: AppColors.textMuted,
        ),
        onTap: onTap,
        contentPadding: EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
      ),
    );
  }

  Widget _buildSignOutButton() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: OutlinedButton.icon(
            onPressed: authProvider.isLoading ? null : () async {
              final confirmed = await _showSignOutDialog();
              if (confirmed == true) {
                await authProvider.signOut();
                if (mounted) {
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

  Future<bool?> _showSignOutDialog() {
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
}