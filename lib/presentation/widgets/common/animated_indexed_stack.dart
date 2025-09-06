import 'package:flutter/material.dart';

class AnimatedIndexedStack extends StatefulWidget {
  final int index;
  final List<Widget> children;
  final Duration duration;

  const AnimatedIndexedStack({
    Key? key,
    required this.index,
    required this.children,
    this.duration = const Duration(milliseconds: 300),
  }) : super(key: key);

  @override
  State<AnimatedIndexedStack> createState() => _AnimatedIndexedStackState();
}

class _AnimatedIndexedStackState extends State<AnimatedIndexedStack>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _animation;
  int _currentIndex = 0;
  int _previousIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.index;
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    _setupAnimation(isForward: true);
  }

  void _setupAnimation({required bool isForward}) {
    final begin = isForward ? const Offset(1.0, 0.0) : const Offset(-1.0, 0.0);
    const end = Offset.zero;
    
    _animation = Tween<Offset>(
      begin: begin,
      end: end,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    ));
  }

  @override
  void didUpdateWidget(AnimatedIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.index != _currentIndex) {
      _previousIndex = _currentIndex;
      setState(() {
        // Determine slide direction based on index positions
        bool slideForward = widget.index > _currentIndex;
        _currentIndex = widget.index;
        _setupAnimation(isForward: slideForward);
        _controller.forward(from: 0);
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: List.generate(widget.children.length, (index) {
        Widget child = widget.children[index];
        
        if (index == _currentIndex) {
          // Current page - slide in
          return SlideTransition(
            position: _animation,
            child: child,
          );
        } else if (index == _previousIndex && _controller.isAnimating) {
          // Previous page - slide out
          final reverseAnimation = Tween<Offset>(
            begin: Offset.zero,
            end: _currentIndex > _previousIndex 
                ? const Offset(-1.0, 0.0) 
                : const Offset(1.0, 0.0),
          ).animate(CurvedAnimation(
            parent: _controller,
            curve: Curves.easeInOutCubic,
          ));
          
          return SlideTransition(
            position: reverseAnimation,
            child: child,
          );
        } else {
          // Hidden pages
          return Offstage(
            offstage: true,
            child: child,
          );
        }
      }),
    );
  }
}