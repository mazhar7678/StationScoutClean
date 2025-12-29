import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { signOut } from '../../data/data_sources/supabase_client';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="train" size={28} color="#fff" />
            </View>
            <View style={styles.headerActions}>
              <Pressable 
                style={styles.headerButton} 
                onPress={() => navigation.navigate('Bookmarks')}
              >
                <MaterialCommunityIcons name="bookmark-outline" size={24} color="#fff" />
              </Pressable>
              <Pressable 
                style={styles.headerButton} 
                onPress={() => signOut()}
              >
                <MaterialCommunityIcons name="logout" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>
          <Text style={styles.appName}>StationScout</Text>
          <Text style={styles.tagline}>Discover events along your railway journey</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Pressable 
          style={styles.primaryCard}
          onPress={() => navigation.navigate('TOC')}
        >
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="compass" size={32} color={colors.accent} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Start Exploring</Text>
            <Text style={styles.cardDescription}>
              Browse train operators and discover events near stations along their routes
            </Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
        </Pressable>

        <Pressable 
          style={styles.secondaryCard}
          onPress={() => navigation.navigate('Map')}
        >
          <View style={[styles.cardIcon, styles.mapIcon]}>
            <MaterialCommunityIcons name="map-search" size={28} color={colors.accent} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Explore by Region</Text>
            <Text style={styles.cardDescription}>
              Browse events near major UK cities
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
        </Pressable>

        <Pressable 
          style={styles.secondaryCard}
          onPress={() => navigation.navigate('Bookmarks')}
        >
          <View style={[styles.cardIcon, styles.bookmarkIcon]}>
            <MaterialCommunityIcons name="bookmark-multiple" size={28} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Saved Events</Text>
            <Text style={styles.cardDescription}>
              View your bookmarked events - accessible even offline
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
        </Pressable>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How it works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Select a Train Operating Company</Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Choose a railway line to explore</Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Browse stations along the line</Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Discover events near each station</Text>
            </View>
          </View>
          
          <View style={[styles.step, styles.lastStep]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Bookmark events for your trip</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
    elevation: 4,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookmarkIcon: {
    backgroundColor: colors.primary + '10',
  },
  mapIcon: {
    backgroundColor: colors.accent + '15',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastStep: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: colors.text,
  },
});
