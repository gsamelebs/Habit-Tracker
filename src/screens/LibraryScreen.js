import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LibraryScreen = () => {
  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', image: '', status: 'Reading' });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const storedBooks = await AsyncStorage.getItem('bloomly_books');
      if (storedBooks) setBooks(JSON.parse(storedBooks));
    } catch (e) { console.error(e); }
  };

  const addBook = async () => {
    if (newBook.title.trim()) {
      const updated = [...books, { ...newBook, id: Date.now().toString() }];
      setBooks(updated);
      await AsyncStorage.setItem('bloomly_books', JSON.stringify(updated));
      setModalVisible(false);
      setNewBook({ title: '', author: '', image: '', status: 'Reading' });
    }
  };

  const updateBookStatus = async (id, status) => {
    const updated = books.map(b => b.id === id ? { ...b, status } : b);
    setBooks(updated);
    await AsyncStorage.setItem('bloomly_books', JSON.stringify(updated));
  };

  const deleteBook = async (id) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    await AsyncStorage.setItem('bloomly_books', JSON.stringify(updated));
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image 
        source={{ uri: item.image || 'https://images.unsplash.com/photo-1543003923-3e11d0449911?w=200' }} 
        style={styles.bookThumbnail} 
      />
      <View style={styles.bookInfo}>
        <View>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        </View>
        <View style={styles.statusRow}>
          <TouchableOpacity 
            onPress={() => updateBookStatus(item.id, item.status === 'Reading' ? 'Completed' : 'Reading')}
            style={[styles.statusTag, item.status === 'Completed' && { backgroundColor: COLORS.success + '22' }]}
          >
            <Text style={[styles.statusText, item.status === 'Completed' && { color: COLORS.success }]}>{item.status}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteBook(item.id)} style={styles.trashBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error + '88'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Library Log</Text>
            <Text style={styles.subtitle}>{books.length} Books blooming 📖</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="book-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No books logged yet.</Text>
            </View>
          }
        />

        <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
          <SafeAreaView style={styles.modalFullContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalMainTitle}>Log a Book</Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="book-outline" size={60} color={COLORS.primary} />
                </View>

                <Text style={styles.label}>Book Title</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="e.g. The Alchemist"
                  value={newBook.title}
                  onChangeText={t => setNewBook({...newBook, title: t})}
                  autoFocus
                />

                <Text style={styles.label}>Author</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="e.g. Paulo Coelho"
                  value={newBook.author}
                  onChangeText={a => setNewBook({...newBook, author: a})}
                />

                <Text style={styles.label}>Cover Image URL (optional)</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="https://..."
                  value={newBook.image}
                  onChangeText={i => setNewBook({...newBook, image: i})}
                />

                <Text style={styles.label}>Current Status</Text>
                <View style={styles.statusSelectRow}>
                  {['Reading', 'Completed'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.statusOption, newBook.status === s && styles.statusOptionActive]}
                      onPress={() => setNewBook({...newBook, status: s})}
                    >
                      <Text style={[styles.statusOptionText, newBook.status === s && styles.statusOptionTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={addBook} 
                  style={[styles.fullConfirmBtn, !newBook.title.trim() && styles.disabledBtn]}
                  disabled={!newBook.title.trim()}
                >
                  <Text style={styles.fullConfirmText}>Save to Library</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  addButton: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 40 },
  bookCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#f0f0f0' },
  bookThumbnail: { width: 70, height: 100, borderRadius: RADIUS.md, backgroundColor: '#eee' },
  bookInfo: { flex: 1, marginLeft: SPACING.md, justifyContent: 'space-between' },
  bookTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  bookAuthor: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.primary + '22' },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  trashBtn: { padding: 4 },
  
  // Full Screen Modal Styles
  modalFullContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalMainTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalScrollContent: { padding: SPACING.xl },
  modalIconWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginBottom: 12, marginTop: 20 },
  fullInput: { fontSize: 20, fontWeight: '500', color: COLORS.text, borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, marginBottom: 10 },
  statusSelectRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  statusOption: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: '#F9F9F9', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  statusOptionActive: { backgroundColor: COLORS.primary + '11', borderColor: COLORS.primary },
  statusOptionText: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
  statusOptionTextActive: { color: COLORS.primary },
  modalFooter: { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  fullConfirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center' },
  fullConfirmText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabledBtn: { backgroundColor: COLORS.border },
  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: COLORS.textLight, fontStyle: 'italic' },
});

export default LibraryScreen;
