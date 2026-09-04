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
import {
  addItem,
  deleteItem,
  editItem,
  getItemsForList,
  getListById,
  toggleItemCompleted,
  type ListItemRow,
} from '../db/listsRepo';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ListDetail'>;

type EditModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: ListItemRow }
  | null;

export function ListDetailScreen({ route }: Props) {
  const { listId, listName: initialName } = route.params;
  const { colors } = useTheme();
  const [title, setTitle] = useState(initialName);
  const [items, setItems] = useState<ListItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<EditModalState>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [list, rows] = await Promise.all([
        getListById(listId),
        getItemsForList(listId),
      ]);
      if (list) setTitle(list.name);
      setItems(rows);
    } catch (error) {
      Alert.alert('List', error instanceof Error ? error.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void refresh();
    }, [refresh]),
  );

  const openCreate = () => {
    setDraft('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: ListItemRow) => {
    setDraft(item.title);
    setModal({ mode: 'edit', item });
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setDraft('');
  };

  const submitModal = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Empty names are not allowed.');
      return;
    }
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await addItem(listId, trimmed);
      } else if (modal?.mode === 'edit') {
        await editItem(modal.item.id, trimmed);
      }
      setModal(null);
      setDraft('');
      await refresh();
    } catch (error) {
      Alert.alert('List', error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (item: ListItemRow) => {
    try {
      await toggleItemCompleted(item.id);
      await refresh();
    } catch (error) {
      Alert.alert('List', error instanceof Error ? error.message : 'Toggle failed');
    }
  };

  const confirmDelete = (item: ListItemRow) => {
    Alert.alert('Delete item?', `"${item.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteItem(item.id);
              await refresh();
            } catch (error) {
              Alert.alert(
                'List',
                error instanceof Error ? error.message : 'Delete failed',
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        title={title}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add item"
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
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No items yet. Tap + to add one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const done = item.completed === 1;
            return (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  onPress={() => void onToggle(item)}
                  style={styles.checkHit}
                >
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={done ? colors.success : colors.textSecondary}
                  />
                </Pressable>
                <Pressable style={styles.rowMain} onPress={() => openEdit(item)}>
                  <Text
                    style={[
                      styles.rowTitle,
                      {
                        color: colors.text,
                        textDecorationLine: done ? 'line-through' : 'none',
                        opacity: done ? 0.55 : 1,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.title}`}
                  hitSlop={10}
                  onPress={() => confirmDelete(item)}
                  style={styles.iconHit}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </Pressable>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modal?.mode === 'edit' ? 'Edit item' : 'New item'}
            </Text>
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              placeholder="Item title"
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
                style={[styles.modalBtn, { backgroundColor: colors.accent }]}
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
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 64,
  },
  checkHit: { padding: 6 },
  rowMain: { flex: 1, paddingVertical: 6 },
  rowTitle: { fontSize: 17, fontWeight: '700' },
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
});
