import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBoeTb8MajDQjq6L6TXhmCUrqhcAb2QhDw',
    appId: '1:1023839825806:web:2fef724da334c9e1e33edf',
    messagingSenderId: '1023839825806',
    projectId: 'habitos-firebase',
    authDomain: 'habitos-firebase.firebaseapp.com',
    storageBucket: 'habitos-firebase.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBoeTb8MajDQjq6L6TXhmCUrqhcAb2QhDw',
    appId: '1:1023839825806:android:2fef724da334c9e1e33edf',
    messagingSenderId: '1023839825806',
    projectId: 'habitos-firebase',
    storageBucket: 'habitos-firebase.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBoeTb8MajDQjq6L6TXhmCUrqhcAb2QhDw',
    appId: '1:1023839825806:ios:2fef724da334c9e1e33edf',
    messagingSenderId: '1023839825806',
    projectId: 'habitos-firebase',
    storageBucket: 'habitos-firebase.firebasestorage.app',
    iosClientId: '1023839825806-example.apps.googleusercontent.com',
    iosBundleId: 'com.ruairi.habitos',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBoeTb8MajDQjq6L6TXhmCUrqhcAb2QhDw',
    appId: '1:1023839825806:ios:2fef724da334c9e1e33edf',
    messagingSenderId: '1023839825806',
    projectId: 'habitos-firebase',
    storageBucket: 'habitos-firebase.firebasestorage.app',
    iosClientId: '1023839825806-example.apps.googleusercontent.com',
    iosBundleId: 'com.ruairi.habitos',
  );
}