import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import TimerItem from '../components/TimerItem';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeeklyHistory } from '../utils/syncManager';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState('global');
  const [historyData, setHistoryData] = useState({ labels: ['S','M','T','W','T','F','S'], datasets: [{ data: [0,0,0,0,0,0,0] }] });
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadHistory();
      return () => {};
    }, [selectedHabitId])
  );

  useEffect(() => {
    const messages = ["Believe in yourself ✨", "One step at a time 🌿", "Bloom where you are planted 🌸", "Stay soft, stay strong."];
    const timer = setTimeout(() => {
      Alert.alert("Habit Tracker Inspiration", messages[Math.floor(Math.random() * messages.length)]);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('bloomly_habits');
      if (storedHabits) setHabits(JSON.parse(storedHabits));

      const historyJson = await AsyncStorage.getItem('bloomly_history');
      if (historyJson) {
        const hist = JSON.parse(historyJson)['global'] || {};
        let s = 0;
        let d = new Date();
        while (hist[d.toISOString().split('T')[0]]) {
          s++;
          d.setDate(d.getDate() - 1);
        }
        setStreak(s);
      }
    } catch (e) { console.error(e); }
  };

  const loadHistory = async () => {
    const history = await getWeeklyHistory(selectedHabitId);
    setHistoryData(history);
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(255, 183, 178, ${opacity})`,
    labelColor: (opacity = 1) => COLORS.text,
    strokeWidth: 3,
    propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary },
    labelFontFamily: FONT.regular,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi there,</Text>
          <Text style={styles.subtitle}>Ready to bloom today?</Text>
        </View>

        <TimerItem />

        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={24} color={COLORS.primary} />
            <Text style={styles.streakVal}>{streak} Day Streak</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bloom Chart 📈</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitSelector}>
          <TouchableOpacity 
            onPress={() => setSelectedHabitId('global')}
            style={[styles.selectorBtn, selectedHabitId === 'global' && styles.selectorBtnActive]}
          >
            <Text style={[styles.selectorText, selectedHabitId === 'global' && styles.selectorTextActive]}>Overall</Text>
          </TouchableOpacity>
          {habits.map(h => (
            <TouchableOpacity 
              key={h.id}
              onPress={() => setSelectedHabitId(h.id)}
              style={[styles.selectorBtn, selectedHabitId === h.id && styles.selectorBtnActive]}
            >
              <Text style={[styles.selectorText, selectedHabitId === h.id && styles.selectorTextActive]}>{h.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.card}>
          <LineChart
            data={historyData}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
          <Text style={styles.chartCaption}>
            {selectedHabitId === 'global' ? 'Total Completion' : 'Habit Consistency'} (Past 7 Days)
          </Text>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  header: { marginBottom: SPACING.xl },
  greeting: { fontSize: 28, color: COLORS.text, fontFamily: FONT.bold },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4, fontFamily: FONT.regular },
  streakRow: { marginTop: SPACING.md },
  streakCard: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  streakVal: { marginLeft: 8, color: COLORS.text, fontFamily: FONT.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.xl },
  sectionTitle: { fontSize: 18, color: COLORS.text, fontFamily: FONT.semiBold },
  habitSelector: { marginBottom: SPACING.md },
  selectorBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  selectorBtnActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  selectorText: { fontSize: 13, color: COLORS.textLight, fontFamily: FONT.semiBold },
  selectorTextActive: { color: COLORS.primary },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' },
  chartCaption: { fontSize: 12, color: COLORS.textLight, marginTop: 4, fontFamily: FONT.regular, fontStyle: 'italic' },
});

export default DashboardScreen;
