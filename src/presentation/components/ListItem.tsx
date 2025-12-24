import React from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

type ListItemProps = {
  title: string;
  description?: string;
  onPress?: (event: GestureResponderEvent) => void;
  right?: React.ReactNode;
};

export function ListItem({
  title,
  description,
  onPress,
  right,
}: ListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant="titleMedium">{title}</Text>
        {description ? (
          <Text variant="bodySmall" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  right: {
    alignItems: 'flex-end',
  },
});
