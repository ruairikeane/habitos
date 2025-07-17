import { supabase } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConnectionTestResult {
  isConnected: boolean;
  error?: string;
  latency?: number;
  endpoint: string;
}

interface ConnectionState {
  isOnline: boolean;
  lastConnected: Date | null;
  retryCount: number;
  maxRetries: number;
}

export class SupabaseConnectionTester {
  private static connectionState: ConnectionState = {
    isOnline: false,
    lastConnected: null,
    retryCount: 0,
    maxRetries: 5
  };

  private static readonly CONNECTIVITY_KEY = 'supabase_connectivity_state';
  static async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test basic REST API connectivity
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1)
        .single();

      const latency = Date.now() - startTime;

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
        return {
          isConnected: false,
          error: error.message,
          latency,
          endpoint: 'supabase-rest'
        };
      }

      return {
        isConnected: true,
        latency,
        endpoint: 'supabase-rest'
      };
    } catch (error) {
      return {
        isConnected: false,
        error: (error as Error).message,
        latency: Date.now() - startTime,
        endpoint: 'supabase-rest'
      };
    }
  }

  static async testAuthConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test auth connectivity
      const { data, error } = await supabase.auth.getUser();
      const latency = Date.now() - startTime;

      if (error) {
        return {
          isConnected: false,
          error: error.message,
          latency,
          endpoint: 'supabase-auth'
        };
      }

      return {
        isConnected: true,
        latency,
        endpoint: 'supabase-auth'
      };
    } catch (error) {
      return {
        isConnected: false,
        error: (error as Error).message,
        latency: Date.now() - startTime,
        endpoint: 'supabase-auth'
      };
    }
  }

  static async runDiagnostics(): Promise<{
    rest: ConnectionTestResult;
    auth: ConnectionTestResult;
    overall: boolean;
  }> {
    const [rest, auth] = await Promise.all([
      this.testConnection(),
      this.testAuthConnection()
    ]);

    const overallConnected = rest.isConnected && auth.isConnected;
    
    // Update connection state
    this.connectionState.isOnline = overallConnected;
    this.connectionState.lastConnected = overallConnected ? new Date() : this.connectionState.lastConnected;
    this.connectionState.retryCount = overallConnected ? 0 : this.connectionState.retryCount + 1;
    
    // Persist connection state
    await this.saveConnectionState();

    return {
      rest,
      auth,
      overall: overallConnected
    };
  }

  static async saveConnectionState(): Promise<void> {
    try {
      const state = {
        ...this.connectionState,
        lastConnected: this.connectionState.lastConnected?.toISOString() || null
      };
      await AsyncStorage.setItem(this.CONNECTIVITY_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save connection state:', error);
    }
  }

  static async loadConnectionState(): Promise<void> {
    try {
      const stateString = await AsyncStorage.getItem(this.CONNECTIVITY_KEY);
      if (stateString) {
        const state = JSON.parse(stateString);
        this.connectionState = {
          ...state,
          lastConnected: state.lastConnected ? new Date(state.lastConnected) : null
        };
      }
    } catch (error) {
      console.warn('Failed to load connection state:', error);
    }
  }

  static getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  static async attemptReconnection(): Promise<boolean> {
    if (this.connectionState.retryCount >= this.connectionState.maxRetries) {
      console.log('Max retry attempts reached');
      return false;
    }

    const diagnostics = await this.runDiagnostics();
    return diagnostics.overall;
  }

  static async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Test basic internet connectivity
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Enhanced retry mechanism with offline support
export class RetryHelper {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    enableOfflineCheck: boolean = true
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check network connectivity before attempting operation
        if (enableOfflineCheck && attempt > 0) {
          const hasNetwork = await SupabaseConnectionTester.checkNetworkConnectivity();
          if (!hasNetwork) {
            throw new Error('No internet connection available');
          }
        }
        
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Log retry attempt
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);
        
        // Exponential backoff with jitter
        const baseDelay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
        const delay = baseDelay + jitter;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    failureThreshold: number = 5,
    timeout: number = 60000 // 1 minute
  ): Promise<T> {
    const connectionState = SupabaseConnectionTester.getConnectionState();
    
    // Circuit breaker logic
    if (connectionState.retryCount >= failureThreshold) {
      const timeSinceLastAttempt = connectionState.lastConnected ? 
        Date.now() - connectionState.lastConnected.getTime() : timeout + 1;
      
      if (timeSinceLastAttempt < timeout) {
        throw new Error('Circuit breaker open: too many failed attempts');
      }
    }
    
    return this.withRetry(operation, 1, 0, false);
  }
}