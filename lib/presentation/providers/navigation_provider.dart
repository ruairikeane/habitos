import 'package:flutter/material.dart';

class NavigationProvider with ChangeNotifier {
  int _currentIndex = 0;
  int _previousIndex = 0;
  bool _fromDrawer = false;

  int get currentIndex => _currentIndex;
  int get previousIndex => _previousIndex;
  bool get fromDrawer => _fromDrawer;

  void setIndex(int index, {bool fromDrawer = false}) {
    if (_currentIndex != index) {
      _previousIndex = _currentIndex;
      _currentIndex = index;
      _fromDrawer = fromDrawer;
      notifyListeners();
    }
  }

  void setFromDrawer(bool value) {
    _fromDrawer = value;
    notifyListeners();
  }

  bool get shouldSlideForward => _currentIndex > _previousIndex;
}