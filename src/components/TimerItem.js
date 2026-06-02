import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const TIMER_SIZE = Math.min(width * 0.5, 240);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TimerItem = () => {
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [tempWork, setTempWork] = useState('25');
  const [tempBreak, setTempBreak] = useState('5');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const w = await AsyncStorage.getItem('bloomly_work_time');
    const b = await AsyncStorage.getItem('bloomly_break_time');
    if (w) {
      setWorkTime(parseInt(w));
      setTempWork(w);
      if (!isActive) setTimeLeft(parseInt(w) * 60);
    }
    if (b) {
      setBreakTime(parseInt(b));
      setTempBreak(b);
    }
  };

  const saveSettings = async () => {
    const w = parseInt(tempWork);
    const b = parseInt(tempBreak);
    if (isNaN(w) || isNaN(b) || w <= 0 || b <= 0) {
      Alert.alert("Invalid Input", "Please enter valid numbers for time.");
      return;
    }
    setWorkTime(w);
    setBreakTime(b);
    await AsyncStorage.setItem('bloomly_work_time', w.toString());
    await AsyncStorage.setItem('bloomly_break_time', b.toString());
    if (!isActive) setTimeLeft(w * 60);
    setSettingsModal(false);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      handleTimerComplete();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    const nextMode = !isBreak;
    setIsBreak(nextMode);
    setTimeLeft(nextMode ? breakTime * 60 : workTime * 60);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: nextMode ? "Time for a break! 🍵" : "Break's over! Let's bloom. ✨",
        body: nextMode ? "You've worked hard. Take a moment to breathe." : "Ready to continue your focus session?",
      },
      trigger: null,
    });

    Alert.alert(
      nextMode ? "Focus Session Done!" : "Break Done!",
      nextMode ? "Ready for a break?" : "Ready to get back to it?",
      [{ text: "Start Next Phase", onPress: () => setIsActive(true) }, { text: "Dismiss" }]
    );
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(workTime * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.timerCircle, isBreak && { borderColor: COLORS.secondary + '66' }]}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.timerSub, isBreak && { color: COLORS.secondary }]}>
          {isBreak ? "Break Phase" : "Focus Phase"}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
          <Ionicons name="refresh" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playBtn, { backgroundColor: isActive ? COLORS.accent : (isBreak ? COLORS.secondary : COLORS.primary) }]} 
          onPress={toggleTimer}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={32} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => setSettingsModal(true)}>
          <Ionicons name="options-outline" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <Modal visible={settingsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Timer Settings ⏳</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Focus Duration (mins)</Text>
              <TextInput 
                style={styles.input} 
                value={tempWork} 
                onChangeText={setTempWork} 
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Break Duration (mins)</Text>
              <TextInput 
                style={styles.input} 
                value={tempBreak} 
                onChangeText={setTempBreak} 
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setSettingsModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSettings} style={styles.saveBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, marginTop: SPACING.md, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: COLORS.text, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
  timerCircle: { width: TIMER_SIZE, height: TIMER_SIZE, borderRadius: TIMER_SIZE / 2, borderWidth: 4, borderColor: COLORS.primary + '33', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  timerText: { fontSize: TIMER_SIZE * 0.25, fontWeight: '700', color: COLORS.text },
  timerSub: { fontSize: TIMER_SIZE * 0.08, color: COLORS.textLight, marginTop: 4, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  controlBtn: { padding: 12 },
  playBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.xl },
  modalContent: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.xl },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', borderRadius: RADIUS.md, padding: 12, fontSize: 16, color: COLORS.text },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: SPACING.md },
  cancelBtn: { padding: 10 },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  cancelText: { color: COLORS.textLight, fontWeight: '600' },
  saveText: { color: COLORS.white, fontWeight: '700' },
});

export default TimerItem;
