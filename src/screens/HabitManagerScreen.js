import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { clearHabitHistory, clearHabitTasks } from '../utils/syncManager';

const DAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

const HabitManagerScreen = () => {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [time, setTime] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [targetDay, setTargetDay] = useState(0); 
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const stored = await AsyncStorage.getItem('bloomly_habits');
      if (stored) setHabits(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveHabits = async (list) => {
    try {
      await AsyncStorage.setItem('bloomly_habits', JSON.stringify(list));
    } catch (e) { console.error(e); }
  };

  const addHabit = () => {
    if (name.trim()) {
      const newHabitObj = {
        id: Date.now().toString(),
        name: name.trim(),
        frequency,
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startDate: startDate.toISOString(),
        targetDay: targetDay,
        createdAt: new Date().toISOString(),
        streak: 0,
      };
      const updated = [...habits, newHabitObj];
      setHabits(updated);
      saveHabits(updated);
      
      setName('');
      setFrequency('Daily');
      setTime(new Date());
      setStartDate(new Date());
      setModalVisible(false);
      Keyboard.dismiss();
    }
  };

  const deleteHabit = (id) => {
    Alert.alert("Delete Habit", "This will stop the habit from blooming and clear its progress graph.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const updated = habits.filter(h => h.id !== id);
          setHabits(updated);
          await saveHabits(updated);
          await clearHabitHistory(id);
          await clearHabitTasks(id);
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.habitItem}>
      <View style={styles.habitInfo}>
        <View style={styles.iconCircle}>
          <Ionicons name="flower" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.habitTextContainer}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitMeta}>
            {item.frequency === 'Specific Day' ? `Every ${DAYS[item.targetDay].label}` : item.frequency} • Starts {new Date(item.startDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteHabit(item.id)} style={styles.deleteIcon}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Garden</Text>
          <TouchableOpacity style={styles.headerAdd} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={habits}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>Your garden is empty. Add a habit to start blooming! 🌸</Text>
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
                <Text style={styles.modalMainTitle}>New Habit</Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.label}>Habit Name</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="e.g. Morning Meditation"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholderTextColor={COLORS.textLight + '55'}
                />

                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.text} style={{marginRight: 8}} />
                  <Text style={styles.selectorText}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  {['Daily', 'Weekly', 'Monthly', 'Specific Day'].map((f) => (
                    <TouchableOpacity 
                      key={f}
                      style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                      onPress={() => setFrequency(f)}
                    >
                      <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {frequency === 'Specific Day' && (
                  <>
                    <Text style={styles.label}>Repeat Every...</Text>
                    <View style={styles.daysRow}>
                      {DAYS.map((d) => (
                        <TouchableOpacity 
                          key={d.value}
                          style={[styles.dayBtn, targetDay === d.value && styles.dayBtnActive]}
                          onPress={() => setTargetDay(d.value)}
                        >
                          <Text style={[styles.dayText, targetDay === d.value && styles.dayTextActive]}>{d.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <Text style={styles.label}>Preferred Time</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color={COLORS.text} style={{marginRight: 8}} />
                  <Text style={styles.selectorText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker value={startDate} mode="date" onChange={(e, d) => { setShowDatePicker(false); if(d) setStartDate(d); }} />
                )}
                {showTimePicker && (
                  <DateTimePicker value={time} mode="time" onChange={(e, t) => { setShowTimePicker(false); if(t) setTime(t); }} />
                )}

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={addHabit} style={[styles.fullConfirmBtn, !name.trim() && styles.disabledBtn]} disabled={!name.trim()}>
                  <Text style={styles.fullConfirmText}>Plant Habit</Text>
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
  content: { padding: SPACING.lg, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 26, color: COLORS.text, fontFamily: FONT.bold },
  headerAdd: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: SPACING.xl },
  habitItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: '#F5F5F5' },
  habitInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '11', justifyContent: 'center', alignItems: 'center' },
  habitTextContainer: { marginLeft: 12 },
  habitName: { fontSize: 16, color: COLORS.text, fontFamily: FONT.semiBold },
  habitMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 2, fontFamily: FONT.regular },
  deleteIcon: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { textAlign: 'center', marginTop: 16, color: COLORS.textLight, fontStyle: 'italic', fontFamily: FONT.regular },
  modalFullContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalMainTitle: { fontSize: 18, color: COLORS.text, fontFamily: FONT.bold },
  modalScrollContent: { padding: SPACING.xl },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 12, marginTop: 20, fontFamily: FONT.semiBold },
  fullInput: { fontSize: 24, color: COLORS.text, borderBottomWidth: 2, borderBottomColor: COLORS.primary + '44', paddingVertical: 8, fontFamily: FONT.semiBold },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: RADIUS.md, padding: 16, marginTop: 4 },
  selectorText: { fontSize: 16, color: COLORS.text, fontFamily: FONT.regular },
  frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: 'transparent' },
  freqBtnActive: { backgroundColor: COLORS.primary + '11', borderColor: COLORS.primary },
  freqText: { fontSize: 13, color: COLORS.textLight, fontFamily: FONT.semiBold },
  freqTextActive: { color: COLORS.primary },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  dayBtnActive: { backgroundColor: COLORS.primary },
  dayText: { fontSize: 14, color: COLORS.textLight, fontFamily: FONT.bold },
  dayTextActive: { color: COLORS.white },
  modalFooter: { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  fullConfirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center' },
  fullConfirmText: { color: COLORS.white, fontSize: 16, fontFamily: FONT.bold },
  disabledBtn: { backgroundColor: COLORS.border },
});

export default HabitManagerScreen;
