import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalScreen = () => {
  const [entries, setEntries] = useState([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('bloomly_journal');
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        // Default initial entry
        setEntries([{
          id: '1',
          date: 'Today, 7:00 PM',
          text: 'Today was a productive day. I managed to finish the first draft of my project and even went for a long walk in the evening.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        }]);
      }
    } catch (e) { console.error(e); }
  };

  const saveEntries = async (list) => {
    try {
      await AsyncStorage.setItem('bloomly_journal', JSON.stringify(list));
    } catch (e) { console.error(e); }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const addEntry = () => {
    if (newEntryText.trim()) {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
        text: newEntryText,
        image: selectedImage,
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      saveEntries(updated);
      setNewEntryText('');
      setSelectedImage(null);
    }
  };

  const deleteEntry = (id) => {
    Alert.alert("Delete Entry", "Are you sure you want to remove this memory from your diary?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: () => {
          const updated = entries.filter(e => e.id !== id);
          setEntries(updated);
          saveEntries(updated);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Digital Diary</Text>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="How are you feeling today?"
            multiline
            value={newEntryText}
            onChangeText={setNewEntryText}
          />
          
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputFooter}>
            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.postBtn, !newEntryText.trim() && styles.disabledBtn]} 
              onPress={addEntry}
              disabled={!newEntryText.trim()}
            >
              <Text style={styles.postBtnText}>Post Entry</Text>
            </TouchableOpacity>
          </View>
        </View>

        {entries.map(entry => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error + '88'} />
              </TouchableOpacity>
            </View>
            <Text style={styles.entryText}>{entry.text}</Text>
            {entry.image && (
              <Image source={{ uri: entry.image }} style={styles.entryImage} />
            )}
          </View>
        ))}
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No entries yet. Write your first memory! ✨</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl },
  inputCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: COLORS.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  input: { fontSize: 16, color: COLORS.text, minHeight: 100, textAlignVertical: 'top' },
  previewContainer: { marginTop: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
  removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.white, borderRadius: 12 },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  toolBtn: { padding: 8 },
  postBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.sm },
  disabledBtn: { backgroundColor: COLORS.border },
  postBtnText: { color: COLORS.white, fontWeight: '600' },
  entryCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#F0F0F0' },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  entryDate: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
  entryText: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.md },
  entryImage: { width: '100%', height: 220, borderRadius: RADIUS.md, backgroundColor: '#eee' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, color: COLORS.textLight, fontStyle: 'italic' },
});

export default JournalScreen;
