import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import JournalScreen from './JournalScreen';
import LibraryScreen from './LibraryScreen';

const GrowthScreen = () => {
  const [activeTab, setActiveTab] = useState('Journal');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Journal' && styles.activeTab]} 
          onPress={() => setActiveTab('Journal')}
        >
          <Text style={[styles.tabText, activeTab === 'Journal' && styles.activeTabText]}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Library' && styles.activeTab]} 
          onPress={() => setActiveTab('Library')}
        >
          <Text style={[styles.tabText, activeTab === 'Library' && styles.activeTabText]}>Library</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'Journal' ? <JournalScreen /> : <LibraryScreen />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  activeTab: { backgroundColor: COLORS.primary + '15' },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },
  content: { flex: 1 },
});

export default GrowthScreen;
