import React from 'react';
import { StyleSheet, View } from 'react-native';

type CenteredProps = {
  children: React.ReactNode;
};

export function Centered({ children }: CenteredProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
});
