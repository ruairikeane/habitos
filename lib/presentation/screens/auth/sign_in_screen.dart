import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/custom_button.dart';
import '../../widgets/common/custom_text_field.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSignUp = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Consumer<AuthProvider>(
          builder: (context, authProvider, child) {
            // Navigate to home if authenticated
            if (authProvider.isAuthenticated) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                context.go('/home');
              });
            }

            return SingleChildScrollView(
              padding: EdgeInsets.all(AppSpacing.screenPadding),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(height: AppSpacing.xxxl),
                    
                    // App Logo
                    Center(
                      child: Image.asset(
                        'assets/images/habitos_logo_flame.png',
                        height: 100,
                        width: 100,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 100,
                            width: 100,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Icon(
                              Icons.local_fire_department,
                              size: 60,
                              color: AppColors.primary,
                            ),
                          );
                        },
                      ),
                    ),
                    
                    SizedBox(height: AppSpacing.lg), // Reduced from xl
                    
                    // Welcome Text
                    Text(
                      _isSignUp ? 'Create Account' : 'Welcome Back',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith( // Changed from displayLarge
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600, // Softer than bold
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    SizedBox(height: AppSpacing.sm),
                    
                    Text(
                      _isSignUp 
                          ? 'Start building better habits today'
                          : 'Sign in to continue your habit journey',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    SizedBox(height: AppSpacing.xxxl),
                    
                    // Form fields container with max width
                    Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.8,
                      ),
                      child: Column(
                        children: [
                          // Email Field
                          CustomTextField(
                            controller: _emailController,
                            label: 'Email',
                            keyboardType: TextInputType.emailAddress,
                            validator: Validators.validateEmail,
                            prefixIcon: Icons.email_outlined,
                            textCapitalization: TextCapitalization.none,
                          ),
                          
                          SizedBox(height: AppSpacing.lg),
                          
                          // Password Field
                          CustomTextField(
                            controller: _passwordController,
                            label: 'Password',
                            obscureText: _obscurePassword,
                            validator: Validators.validatePassword,
                            prefixIcon: Icons.lock_outline,
                            textCapitalization: TextCapitalization.none,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility : Icons.visibility_off,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                          ),
                          
                          // Dev Quick Fill Button
                          if (!_isSignUp) ...[
                            SizedBox(height: AppSpacing.md),
                            TextButton.icon(
                              onPressed: () {
                                setState(() {
                                  _emailController.text = 'ruairiashankeane@gmail.com';
                                  _passwordController.text = 'Codelol69#';
                                });
                              },
                              icon: Icon(
                                Icons.developer_mode,
                                size: 18,
                                color: AppColors.textMuted,
                              ),
                              label: Text(
                                'Quick Fill (Dev)',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textMuted,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                  vertical: AppSpacing.sm,
                                ),
                                backgroundColor: AppColors.surface,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                                  side: BorderSide(
                                    color: AppColors.border,
                                    width: 1,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    
                    SizedBox(height: AppSpacing.xl),
                    
                    // Error Message
                    if (authProvider.errorMessage != null)
                      Container(
                        padding: EdgeInsets.all(AppSpacing.md),
                        margin: EdgeInsets.only(bottom: AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.errorWithOpacity(0.1),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                          border: Border.all(color: AppColors.error),
                        ),
                        child: Text(
                          authProvider.errorMessage!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    
                    // Sign In/Up Button
                    Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.8,
                      ),
                      child: CustomButton(
                        text: _isSignUp ? 'Create Account' : 'Sign In',
                        onPressed: authProvider.isLoading ? null : _handleSubmit,
                        isLoading: authProvider.isLoading,
                        backgroundColor: AppColors.signInPrimary,
                      ),
                    ),
                    
                    SizedBox(height: AppSpacing.lg),
                    
                    // Switch Mode Button
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _isSignUp = !_isSignUp;
                        });
                        authProvider.clearError();
                      },
                      child: Text(
                        _isSignUp 
                            ? 'Already have an account? Sign In'
                            : 'Don\'t have an account? Sign Up',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.signInPrimary,
                        ),
                      ),
                    ),
                    
                    if (!_isSignUp) ...[
                      SizedBox(height: AppSpacing.sm),
                      TextButton(
                        onPressed: () {
                          // TODO: Implement forgot password
                        },
                        child: Text(
                          'Forgot Password?',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (_isSignUp) {
      await authProvider.signUp(_emailController.text, _passwordController.text);
    } else {
      await authProvider.signIn(_emailController.text, _passwordController.text);
    }
  }
}