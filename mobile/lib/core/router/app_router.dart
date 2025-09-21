import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/issues/presentation/pages/issues_list_page.dart';
import '../../features/issues/presentation/pages/issue_detail_page.dart';
import '../../features/issues/presentation/pages/report_issue_page.dart';
import '../../features/gamification/presentation/pages/leaderboard_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/dashboard_page.dart';
import '../../core/providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isAnonymous = authState.isAnonymous;
      final isLoading = authState.isLoading;
      
      // Don't redirect while loading
      if (isLoading) return null;
      
      // Protected routes
      final protectedRoutes = ['/report', '/profile', '/dashboard'];
      final isProtectedRoute = protectedRoutes.any(
        (route) => state.matchedLocation.startsWith(route)
      );
      
      // Redirect to login if accessing protected route without auth
      if (isProtectedRoute && !isAuthenticated) {
        return '/login';
      }
      
      // Redirect authenticated users away from auth pages
      if (isAuthenticated && (state.matchedLocation == '/login' || state.matchedLocation == '/register')) {
        return '/';
      }
      
      return null;
    },
    routes: [
      // Public Routes
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/issues',
        name: 'issues',
        builder: (context, state) => const IssuesListPage(),
      ),
      GoRoute(
        path: '/issues/:id',
        name: 'issue-detail',
        builder: (context, state) {
          final issueId = state.pathParameters['id']!;
          return IssueDetailPage(issueId: issueId);
        },
      ),
      GoRoute(
        path: '/leaderboard',
        name: 'leaderboard',
        builder: (context, state) => const LeaderboardPage(),
      ),
      
      // Protected Routes
      GoRoute(
        path: '/report',
        name: 'report',
        builder: (context, state) => const ReportIssuePage(),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});