import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-paper';

import DiscoveryStackNavigator from '@presentation/navigation/DiscoveryStack';
import { Centered } from '@presentation/components/Centered';
import ProfileScreen from '@presentation/screens/auth/ProfileScreen';

const Tab = createBottomTabNavigator();

const Placeholder = ({ label, icon }: { label: string; icon: string }) => (
  <Centered>
    <Icon name={icon} size={48} />
    <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 12 }}>
      {label}
    </Text>
  </Centered>
);

const MapPlaceholderScreen = () => (
  <Placeholder label="Interactive map coming soon" icon="map-search" />
);

const BookmarkPlaceholderScreen = () => (
  <Placeholder label="Bookmarks sync coming soon" icon="bookmark-outline" />
);

export function TabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={DiscoveryStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapPlaceholderScreen}
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BookmarksTab"
        component={BookmarkPlaceholderScreen}
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bookmark-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default TabsNavigator;
