import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

type GradientHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  showBack?: boolean;
};

export function GradientHeader({ 
  title, 
  subtitle,
  onBack, 
  onAction,
  actionIcon = 'refresh',
  showBack = true,
}: GradientHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          {showBack && onBack ? (
            <Pressable onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
          ) : (
            <View style={styles.spacer} />
          )}
          {onAction && (
            <Pressable onPress={onAction} style={styles.actionButton}>
              <MaterialCommunityIcons name={actionIcon} size={24} color="#fff" />
            </Pressable>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  spacer: {
    width: 40,
  },
  titleContainer: {
    paddingHorizontal: spacing.xs,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});
