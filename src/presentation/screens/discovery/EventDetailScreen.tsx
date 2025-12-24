import React from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'

interface EventDetailScreenProps {
  navigation: any
  route: any
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { eventId } = route.params || {}

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Event Details</Text>
        <Text style={styles.text}>Event ID: {eventId || 'Loading...'}</Text>
        
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
})

export default EventDetailScreen