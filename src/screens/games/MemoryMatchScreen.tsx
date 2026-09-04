import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModuleHeader } from '../../components/ModuleHeader';
import { useTheme } from '../../theme/ThemeContext';

type Card = {
  id: number;
  symbol: keyof typeof Ionicons.glyphMap;
  matched: boolean;
};

const SYMBOLS: (keyof typeof Ionicons.glyphMap)[] = [
  'sunny-outline',
  'moon-outline',
  'leaf-outline',
  'fish-outline',
  'flame-outline',
  'snow-outline',
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildDeck(): Card[] {
  const pairs = SYMBOLS.flatMap((symbol, index) => [
    { id: index * 2, symbol, matched: false },
    { id: index * 2 + 1, symbol, matched: false },
  ]);
  return shuffle(pairs);
}

export function MemoryMatchScreen() {
  const { colors } = useTheme();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);

  const allMatched = useMemo(() => deck.every((c) => c.matched), [deck]);

  const reset = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setLocked(false);
    setMoves(0);
  };

  const onFlip = (card: Card) => {
    if (locked || card.matched || flipped.includes(card.id)) return;
    if (flipped.length >= 2) return;

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);

    if (nextFlipped.length < 2) return;

    setMoves((m) => m + 1);
    const [aId, bId] = nextFlipped;
    const a = deck.find((c) => c.id === aId);
    const b = deck.find((c) => c.id === bId);
    if (!a || !b) return;

    if (a.symbol === b.symbol) {
      setDeck((prev) =>
        prev.map((c) =>
          c.id === aId || c.id === bId ? { ...c, matched: true } : c,
        ),
      );
      setFlipped([]);
      return;
    }

    setLocked(true);
    setTimeout(() => {
      setFlipped([]);
      setLocked(false);
    }, 650);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        title="Memory Match"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restart game"
            onPress={reset}
            style={({ pressed }) => [
              styles.resetBtn,
              { backgroundColor: colors.accentMuted, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={{ color: colors.accent, fontWeight: '800' }}>Reset</Text>
          </Pressable>
        }
      />

      <View style={styles.meta}>
        <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
          Moves: {moves}
        </Text>
        {allMatched ? (
          <Text style={{ color: colors.success, fontWeight: '800' }}>You win!</Text>
        ) : (
          <Text style={{ color: colors.textSecondary }}>Find all pairs</Text>
        )}
      </View>

      <View style={styles.grid}>
        {deck.map((card) => {
          const faceUp = card.matched || flipped.includes(card.id);
          return (
            <Pressable
              key={card.id}
              accessibilityRole="button"
              accessibilityLabel={faceUp ? String(card.symbol) : 'Hidden card'}
              onPress={() => onFlip(card)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: faceUp ? colors.accentMuted : colors.surface,
                  borderColor: colors.border,
                  opacity: pressed && !faceUp ? 0.85 : 1,
                },
              ]}
            >
              {faceUp ? (
                <Ionicons name={card.symbol} size={34} color={colors.tileIcon} />
              ) : (
                <Text style={[styles.cardBack, { color: colors.accent }]}>?</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  meta: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardBack: {
    fontSize: 28,
    fontWeight: '900',
  },
});
