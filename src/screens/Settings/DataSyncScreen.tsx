import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '../../styles';
import { FirebaseDatabaseService } from '../../services/firebase';
import { useStore } from '../../store';
import type { DataSyncScreenProps } from '../../types';

export function DataSyncScreen({ navigation }: DataSyncScreenProps) {
  const { user } = useStore();

  const handleCloudSync = () => {
    Alert.alert(
      'Cloud Sync',
      'Cloud synchronization is not available in this version. All data is stored locally for privacy.',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    navigation.navigate('DataBackup');
  };


  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Data & Sync
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Current Status */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔒 Privacy First
          </Text>
          
          <View style={[globalStyles.card, styles.statusCard]}>
            <View style={styles.statusIcon}>
              <Ionicons name="shield-checkmark" size={48} color={colors.success} />
            </View>
            <Text style={[typography.h5, styles.statusTitle]}>
              Your Data Stays Private
            </Text>
            <Text style={[typography.body, styles.statusDescription]}>
              All your habits and progress are stored locally on your device. No data is sent to external servers.
            </Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            💾 Data Management
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={handleExportData}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="download-outline" size={24} color={colors.primary} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Export Data
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Save your habits and progress to a file
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={handleCloudSync}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="cloud-outline" size={24} color={colors.textSecondary} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Cloud Sync
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Not available - privacy focused design
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>


        {/* Future Features */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔮 Future Features
          </Text>
          
          <View style={[globalStyles.card, styles.futureCard]}>
            <Text style={[typography.bodyMedium, styles.futureTitle]}>
              Planned for Future Updates:
            </Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                <Text style={[typography.body, styles.featureText]}>
                  Friend connections and shared progress
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="sync-outline" size={20} color={colors.textSecondary} />
                <Text style={[typography.body, styles.featureText]}>
                  Optional cloud backup with end-to-end encryption
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                <Text style={[typography.body, styles.featureText]}>
                  Progress sharing and accountability features
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statusCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.success + '08',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    color: colors.success,
    textAlign: 'center',
  },
  statusDescription: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  actionText: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    color: colors.textPrimary,
  },
  actionDescription: {
    color: colors.textSecondary,
  },
  futureCard: {
    gap: spacing.md,
  },
  futureTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  featureList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    color: colors.textSecondary,
  },
});