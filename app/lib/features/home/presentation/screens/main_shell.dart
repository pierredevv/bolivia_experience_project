import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ── Brand tokens ───────────────────────────────────────────────────────────────
const _navBrandDark = Color(0xFF0F172A);
const _navEmerald = Color(0xFF10B981);
const _navBorderSubtle = Color(0xFFE2E8F0);
const _navTextSecondary = Color(0xFF94A3B8);

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location == '/map') return 1;
    if (location.startsWith('/explore')) return 2;
    if (location == '/favorites') return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getCurrentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(
            top: BorderSide(color: _navBorderSubtle, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: [
                _NavItem(
                  index: 0,
                  currentIndex: currentIndex,
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Inicio',
                  onTap: () => context.go('/'),
                ),
                _NavItem(
                  index: 1,
                  currentIndex: currentIndex,
                  icon: Icons.map_outlined,
                  activeIcon: Icons.map_rounded,
                  label: 'Mapa',
                  onTap: () => context.go('/map'),
                ),
                _NavItem(
                  index: 2,
                  currentIndex: currentIndex,
                  icon: Icons.explore_outlined,
                  activeIcon: Icons.explore_rounded,
                  label: 'Explorar',
                  onTap: () => context.go('/explore'),
                ),
                _NavItem(
                  index: 3,
                  currentIndex: currentIndex,
                  icon: Icons.favorite_outline,
                  activeIcon: Icons.favorite_rounded,
                  label: 'Favoritos',
                  onTap: () => context.go('/favorites'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual nav item — icon + label + active indicator dot
// ─────────────────────────────────────────────────────────────────────────────
class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.index,
    required this.currentIndex,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.onTap,
  });

  final int index;
  final int currentIndex;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isActive = currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isActive ? activeIcon : icon,
                key: ValueKey(isActive),
                size: 24,
                color: isActive ? _navBrandDark : _navTextSecondary,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight:
                    isActive ? FontWeight.w700 : FontWeight.w400,
                color: isActive ? _navBrandDark : _navTextSecondary,
              ),
            ),
            const SizedBox(height: 2),
            // Active indicator dot
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isActive ? 4 : 0,
              height: isActive ? 4 : 0,
              decoration: const BoxDecoration(
                color: _navEmerald,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
