import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { FirebaseAuthWrapper } from './src/components/auth/FirebaseAuthWrapper';
import { ErrorBoundary } from './src/components/common';
import { useNotifications } from './src/hooks';

export default function App() {
  const { requestPermissions } = useNotifications();
  
  useEffect(() => {
    // Request notification permissions when app starts
    const initializeNotifications = async () => {
      try {
        const granted = await requestPermissions();
        console.log('Notification permissions granted:', granted);
      } catch (error) {
        console.log('Notification permission request failed:', error);
      }
    };

    initializeNotifications();
  }, [requestPermissions]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        // In production, you would send this to crash reporting service
      }}
    >
      <FirebaseAuthWrapper>
        <AppNavigator />
      </FirebaseAuthWrapper>
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}
