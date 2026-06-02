import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AssignmentScreen = () => {
  const [assignments, setAssignments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    loadAssignments();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Notifications", "Habit Tracker needs notification access to alert you about deadlines!");
    }
  };

  const loadAssignments = async () => {
    try {
      const stored = await AsyncStorage.getItem('bloomly_assignments');
      if (stored) setAssignments(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveAssignments = async (list) => {
    try {
      await AsyncStorage.setItem('bloomly_assignments', JSON.stringify(list));
    } catch (e) { console.error(e); }
  };

  const scheduleNotification = async (assignment) => {
    const trigger = new Date(assignment.dueDate);
    if (trigger <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Assignment Due! 📝",
        body: `"${assignment.title}" is due now.`,
      },
      trigger,
    });
    
    const thirtyMinsBefore = new Date(trigger.getTime() - 30 * 60000);
    if (thirtyMinsBefore > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Deadline ⏰",
          body: `"${assignment.title}" is due in 30 minutes.`,
        },
        trigger: thirtyMinsBefore,
      });
    }
  };

  const addAssignment = () => {
    if (title.trim()) {
      const newAsgn = {
        id: Date.now().toString(),
        title: title.trim(),
        dueDate: date.toISOString(),
        status: status,
      };
      const updated = [...assignments, newAsgn];
      setAssignments(updated);
      saveAssignments(updated);
      
      if (status !== 'Done') {
        scheduleNotification(newAsgn);
      }

      setModalVisible(false);
      setTitle('');
      setDate(new Date());
      setStatus('Pending');
      Keyboard.dismiss();
    }
  };

  const deleteAssignment = (id) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    saveAssignments(updated);
  };

  const updateStatus = (id, newStatus) => {
    const updated = assignments.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setAssignments(updated);
    saveAssignments(updated);
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'In Progress': return '#FFBE76';
      case 'Done': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const renderItem = ({ item }) => {
    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'Done';
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={[styles.dueDate, isOverdue && { color: COLORS.error, fontWeight: '700' }]}>
            {isOverdue ? 'OVERDUE: ' : ''}{new Date(item.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.statusRow}>
            {['Pending', 'In Progress', 'Done'].map(s => (
              <TouchableOpacity 
                key={s} 
                onPress={() => updateStatus(item.id, s)}
                style={[styles.smallStatusBtn, item.status === s && { backgroundColor: getStatusColor(s) + '33', borderColor: getStatusColor(s) }]}
              >
                <Text style={[styles.smallStatusText, item.status === s && { color: getStatusColor(s) }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteAssignment(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>School</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={assignments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No assignments yet. 🍃</Text>}
        />

        <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
          <SafeAreaView style={styles.modalFullContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalMainTitle}>New Assignment</Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.modalIconWrap}>
                  <Ionicons name="school-outline" size={60} color={COLORS.primary} />
                </View>

                <Text style={styles.label}>Assignment / Project Title</Text>
                <TextInput
                  style={styles.fullInput}
                  placeholder="e.g. History Essay"
                  value={title}
                  onChangeText={setTitle}
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

                <Text style={styles.label}>Initial Status</Text>
                <View style={styles.statusSelectRow}>
                  {['Pending', 'In Progress'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.statusOption, status === s && styles.statusOptionActive]}
                      onPress={() => setStatus(s)}
                    >
                      <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={addAssignment} 
                  style={[styles.fullConfirmBtn, !title.trim() && styles.disabledBtn]}
                  disabled={!title.trim()}
                >
                  <Text style={styles.fullConfirmText}>Save Assignment</Text>
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
  card: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f5f5f5' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, color: COLORS.text, fontFamily: FONT.semiBold, marginBottom: 4 },
  dueDate: { fontSize: 13, color: COLORS.textLight, fontFamily: FONT.regular, marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 6 },
  smallStatusBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  smallStatusText: { fontSize: 10, color: COLORS.textLight, fontFamily: FONT.bold },
  deleteBtn: { padding: 10 },
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
  statusSelectRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  statusOption: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: '#F9F9F9', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  statusOptionActive: { backgroundColor: COLORS.primary + '11', borderColor: COLORS.primary },
  statusOptionText: { fontSize: 14, color: COLORS.textLight, fontFamily: FONT.semiBold },
  statusOptionTextActive: { color: COLORS.primary },
  modalFooter: { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  fullConfirmBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center' },
  fullConfirmText: { color: COLORS.white, fontSize: 16, fontFamily: FONT.bold },
  disabledBtn: { backgroundColor: COLORS.border },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textLight, fontStyle: 'italic', fontFamily: FONT.regular },
});

export default AssignmentScreen;
