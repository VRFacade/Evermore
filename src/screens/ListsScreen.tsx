import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ModuleHeader } from '../components/ModuleHeader';
import { createList, deleteList, getLists, renameList, type ListRow } from '../db/listsRepo';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Lists'>;

type NameModalState =
  | { mode: 'create' }
  | { mode: 'rename'; list: ListRow }
  | null;

export function ListsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [lists, setLists] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<NameModalState>(null);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await getLists();
      setLists(rows);
    } catch (error) {
      Alert.alert('Lists', error instanceof Error ? error.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void refresh();
    }, [refresh]),
  );

  const openCreate = () => {
    setDraftName('');
    setModal({ mode: 'create' });
  };

  const openRename = (list: ListRow) => {
    setDraftName(list.name);
    setModal({ mode: 'rename', list });
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setDraftName('');
  };

  const submitModal = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Empty names are not allowed.');
      return;
    }
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await createList(trimmed);
      } else if (modal?.mode === 'rename') {
        await renameList(modal.list.id, trimmed);
      }
      setModal(null);
      setDraftName('');
      await refresh();
    } catch (error) {
      Alert.alert('Lists', error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (list: ListRow) => {
    Alert.alert(
      'Delete list?',
      `"${list.name}" and all of its items will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteList(list.id);
                await refresh();
              } catch (error) {
                Alert.alert(
                  'Lists',
                  error instanceof Error ? error.message : 'Delete failed',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        title="Lists"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create list"
            hitSlop={8}
            onPress={openCreate}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />

      {loading ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Loading…</Text>
      ) : lists.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No lists yet. Tap + to create one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('ListDetail', {
                  listId: item.id,
                  listName: item.name,
                })
              }
              onLongPress={() => openRename(item)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {item.item_count ?? 0} item{(item.item_count ?? 0) === 1 ? '' : 's'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.name}`}
                hitSlop={10}
                onPress={() => confirmDelete(item)}
                style={styles.iconHit}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
              <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      )}

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modal?.mode === 'rename' ? 'Rename list' : 'New list'}
            </Text>
            <TextInput
              autoFocus
              value={draftName}
              onChangeText={setDraftName}
              placeholder="List name"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onSubmitEditing={() => void submitModal()}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeModal} style={styles.modalBtn}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void submitModal()}
                disabled={saving}
                style={[styles.modalBtn, styles.modalPrimary, { backgroundColor: colors.accent }]}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 72,
  },
  rowMain: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 18, fontWeight: '800' },
  iconHit: { padding: 6 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { fontSize: 16, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    minHeight: 48,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalPrimary: {},
});
