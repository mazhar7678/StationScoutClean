import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EventDetailScreen from '@presentation/screens/discovery/EventDetailScreen';
import EventListScreen from '@presentation/screens/discovery/EventListScreen';
import LineScreen from '@presentation/screens/discovery/LineScreen';
import StationListScreen from '@presentation/screens/discovery/StationListScreen';
import TOCScreen from '@presentation/screens/discovery/TOCScreen';

export type DiscoveryStackParamList = {
  TOC: undefined;
  Lines: { operatorId: string; operatorName: string };
  Stations: { lineId: string; lineName: string };
  Events: { stationId: string; stationName: string };
  EventDetail: { eventId: string };
};

const Stack = createNativeStackNavigator<DiscoveryStackParamList>();

export function DiscoveryStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="TOC">
      <Stack.Screen
        name="TOC"
        component={TOCScreen}
        options={{ title: 'Operators' }}
      />
      <Stack.Screen
        name="Lines"
        component={LineScreen}
        options={({ route }) => ({ title: route.params.operatorName })}
      />
      <Stack.Screen
        name="Stations"
        component={StationListScreen}
        options={({ route }) => ({ title: route.params.lineName })}
      />
      <Stack.Screen
        name="Events"
        component={EventListScreen}
        options={({ route }) => ({ title: route.params.stationName })}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Detail' }}
      />
    </Stack.Navigator>
  );
}

export default DiscoveryStackNavigator;
