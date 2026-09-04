import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  comingSoon?: boolean;
};

export function IconTile({ label, icon, onPress, comingSoon }: Props) {
  const { colors } = useTheme();
  const muted = Boolean(comingSoon);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: muted }}
      accessibilityLabel={comingSoon ? `${label}, coming soon` : label}
      disabled={muted}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.tile,
          borderColor: colors.border,
          opacity: pressed && !muted ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: muted ? colors.border : colors.accentMuted,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={44}
          color={muted ? colors.comingSoon : colors.tileIcon}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: muted ? colors.comingSoon : colors.text },
        ]}
      >
        {label}
      </Text>
      {comingSoon ? (
        <Text style={[styles.badge, { color: colors.comingSoon }]}>
          Coming soon
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 18,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
  },
  badge: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});
