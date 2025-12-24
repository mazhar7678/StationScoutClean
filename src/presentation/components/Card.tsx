import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/colors';

type CardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  imageUrl?: string | null;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
};

export function Card({ 
  title, 
  subtitle, 
  description,
  icon,
  iconColor,
  badge,
  badgeColor,
  imageUrl,
  rightElement, 
  onPress,
  variant = 'elevated'
}: CardProps) {
  const containerStyle = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
  ];

  return (
    <Pressable 
      style={({ pressed }) => [
        containerStyle,
        pressed && styles.pressed,
      ]} 
      onPress={onPress}
    >
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        {icon && !imageUrl && (
          <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '15' }]}>
            <MaterialCommunityIcons 
              name={icon} 
              size={24} 
              color={iconColor || colors.primary} 
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor || colors.accent }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
        {rightElement ? (
          <View style={styles.right}>{rightElement}</View>
        ) : (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={colors.textMuted} 
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  elevated: {
    elevation: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  right: {
    marginLeft: spacing.sm,
  },
});
