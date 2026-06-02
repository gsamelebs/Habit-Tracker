import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Modal, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { syncHabitsToTasks, recordCompletion } from '../utils/syncManager';
import { useFocusEffect } from '@react-navigation/native';

const ToDoScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      initTasks();
      return () => {};
    }, [])
  );

  const initTasks = async () => {
    await syncHabitsToTasks();
    const stored = await AsyncStorage.getItem('bloomly_tasks');
    if (stored) setTasks(JSON.parse(stored));
  };

  const saveTasks = async (list) => {
    await AsyncStorage.setItem('bloomly_tasks', JSON.stringify(list));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        due: date.toISOString(),
        createdAt: new Date().toISOString(),
        isFromHabit: false
      };
      const updated = [...tasks, task];
      setTasks(updated);
      saveTasks(updated);
      
      setNewTask('');
      setDate(new Date());
      setModalVisible(false);
      Keyboard.dismiss();
    }
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState && t.isFromHabit) {
          recordCompletion(t.habitId);
        }
        return { ...t, completed: newState };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskItemContainer}>
      <TouchableOpacity 
        style={[styles.taskItem, item.completed && styles.taskItemCompleted]} 
        onPress={() => toggleTask(item.id)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
        <View style={styles.taskContent}>
          <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
            {item.text}
          </Text>
          {item.due && !item.isFromHabit && (
            <Text style={styles.taskDue}>
              {new Date(item.due).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
          {item.isFromHabit && <Text style={styles.habitBadge}>Habit Bloom</Text>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Checklist</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="sunny-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.emptyText}>Nothing to do? Time for a walk! 🌿</Text>
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
                <Text style={styles.modalMainTitle}>New Task</Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.modalIconWrap}>
                  <Ionicons name="checkbox-outline" size={60} color={COLORS.primary} />
                </View>

                <Text style={styles.label}>What needs to be done?</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="e.g. Wash the dishes"
                  value={newTask}
                  onChangeText={setNewTask}
                  autoFocus
                />

                <Text style={styles.label}>Due Date & Time</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
                    <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                    <Ionicons name="time-outline" size={20} color={COLORS.text} />
                    <Text style={styles.pickerText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker value={date} mode="date" onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }} />
                )}
                {showTimePicker && (
                  <DateTimePicker value={date} mode="time" onChange={(e, t) => { setShowTimePicker(false); if(t) setDate(t); }} />
                )}

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={addTask} 
                  style={[styles.fullConfirmBtn, !newTask.trim() && styles.disabledBtn]}
                  disabled={!newTask.trim()}
                >
                  <Text style={styles.fullConfirmText}>Add to Checklist</Text>
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
  title: { fontSize: 26, color: COLORS.text, fontFamily: FONT.bold },
  addButton: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: SPACING.xl },
  taskItemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  taskItem: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#F5F5F5' },
  taskItemCompleted: { opacity: 0.6, backgroundColor: '#F9F9F9', borderColor: 'transparent' },
  deleteBtn: { padding: SPACING.md, marginLeft: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary + '88', marginRight: SPACING.md, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  taskContent: { flex: 1 },
  taskText: { fontSize: 16, color: COLORS.text, fontFamily: FONT.semiBold },
  taskTextCompleted: { textDecorationLine: 'line-through', color: COLORS.textLight },
  taskDue: { fontSize: 11, color: COLORS.textLight, marginTop: 4, fontFamily: FONT.regular },
  habitBadge: { fontSize: 10, color: COLORS.primary, fontFamily: FONT.bold, marginTop: 4, letterSpacing: 0.5 },
  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: COLORS.textLight, fontStyle: 'italic', fontFamily: FONT.regular },
  modalFullContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalMainTitle: { fontSize: 18, color: COLORS.text, fontFamily: FONT.bold },
  modalScrollContent: { padding: SPACING.xl },
  modalIconWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 12, marginTop: 20, fontFamily: FONT.semiBold },
  fullInput: { fontSize: 22, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, fontFamily: FONT.regular },
  pickerRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9F9F9', padding: 16, borderRadius: RADIUS.md },
  pickerText: { fontSize: 15, color: COLORS.text, fontFamily: FONT.semiBold },
  modalFooter: { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  fullConfirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center' },
  fullConfirmText: { color: COLORS.white, fontSize: 16, fontFamily: FONT.bold },
  disabledBtn: { backgroundColor: COLORS.border },
});

export default ToDoScreen;
