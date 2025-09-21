import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/providers/auth_provider.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../widgets/hero_section.dart';
import '../widgets/stats_section.dart';
import '../widgets/features_section.dart';
import '../widgets/recent_issues_section.dart';
import '../widgets/roadmap_section.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    
    if (authState.isLoading) {
      return const Scaffold(
        body: LoadingWidget(),
      );
    }
    
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            backgroundColor: Theme.of(context).primaryColor,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'VighnView',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Theme.of(context).primaryColor,
                      Theme.of(context).primaryColor.withOpacity(0.8),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              if (authState.isAuthenticated) ...[
                IconButton(
                  icon: const Icon(Icons.person, color: Colors.white),
                  onPressed: () => context.go('/profile'),
                ),
                IconButton(
                  icon: const Icon(Icons.dashboard, color: Colors.white),
                  onPressed: () => context.go('/dashboard'),
                ),
              ] else ...[
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text(
                    'Login',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
          
          // Hero Section
          const SliverToBoxAdapter(
            child: HeroSection(),
          ),
          
          // Stats Section
          const SliverToBoxAdapter(
            child: StatsSection(),
          ),
          
          // Features Section
          const SliverToBoxAdapter(
            child: FeaturesSection(),
          ),
          
          // Recent Issues Section
          const SliverToBoxAdapter(
            child: RecentIssuesSection(),
          ),
          
          // Roadmap Section
          const SliverToBoxAdapter(
            child: RoadmapSection(),
          ),
          
          // Bottom Padding
          const SliverToBoxAdapter(
            child: SizedBox(height: 100),
          ),
        ],
      ),
      
      // Floating Action Button
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (authState.isAuthenticated) {
            context.go('/report');
          } else {
            context.go('/login');
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Report Issue'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
    );
  }
}