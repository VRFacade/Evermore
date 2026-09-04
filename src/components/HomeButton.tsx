import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

/**
 * Persistent Home control shown from every module screen.
 * Navigates back to the root Home grid.
 */
export function HomeButton() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go to Home"
      hitSlop={12}
      onPress={() => navigation.navigate('Home')}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.accentMuted,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Ionicons name="home" size={20} color={colors.accent} />
      <Text style={[styles.label, { color: colors.accent }]}>Home</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 44,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
