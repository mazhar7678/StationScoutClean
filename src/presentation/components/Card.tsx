import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type CardProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
};

export function Card({ title, subtitle, rightElement, onPress }: CardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text variant="titleMedium">{title}</Text>
      {subtitle ? (
        <Text variant="bodySmall" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  subtitle: {
    marginTop: 4,
    color: '#555',
  },
  right: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});
