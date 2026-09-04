import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ModuleHeader } from '../components/ModuleHeader';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Games'>;

export function GamesScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader title="Games" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Library</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Memory Match"
          onPress={() => navigation.navigate('MemoryMatch')}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.accentMuted }]}>
            <Ionicons name="grid-outline" size={36} color={colors.tileIcon} />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Memory Match</Text>
            <Text style={{ color: colors.textSecondary }}>
              Flip cards and find pairs. Bundled mini-game.
            </Text>
            <Text style={[styles.badgeAvailable, { color: colors.success }]}>Available</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>

        <View
          style={[
            styles.card,
            styles.disabledCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityState={{ disabled: true }}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.border }]}>
            <Ionicons name="planet-outline" size={36} color={colors.comingSoon} />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.comingSoon }]}>Star Drift</Text>
            <Text style={{ color: colors.comingSoon }}>
              Drift through constellations. Not available yet.
            </Text>
            <Text style={[styles.badgeSoon, { color: colors.comingSoon }]}>Coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 108,
  },
  disabledCard: {
    opacity: 0.85,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  badgeAvailable: { marginTop: 4, fontWeight: '800', fontSize: 13 },
  badgeSoon: { marginTop: 4, fontWeight: '700', fontSize: 13 },
});
