import 'package:flutter/material.dart';

class ScrollProvider with ChangeNotifier {
  final Map<String, ScrollController> _scrollControllers = {};

  ScrollController getScrollController(String routeName) {
    if (!_scrollControllers.containsKey(routeName)) {
      _scrollControllers[routeName] = ScrollController();
    }
    return _scrollControllers[routeName]!;
  }

  void scrollToTop(String routeName) {
    final controller = _scrollControllers[routeName];
    if (controller != null && controller.hasClients) {
      controller.animateTo(
        0.0,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  void dispose() {
    for (final controller in _scrollControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }
}