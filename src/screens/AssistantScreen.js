import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AssistantScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your Habit Tracker Assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('bloomly_gemini_key');
      if (storedKey) {
        setApiKey(storedKey);
        setIsSetup(true);
      } else {
        setIsSetup(false);
      }
    } catch (e) { console.error(e); }
  };

  const saveApiKey = async () => {
    if (tempKey.trim().length < 20) {
      Alert.alert("Invalid Key", "Please enter a valid Gemini API Key from Google AI Studio.");
      return;
    }
    try {
      await AsyncStorage.setItem('bloomly_gemini_key', tempKey.trim());
      setApiKey(tempKey.trim());
      setIsSetup(true);
      Alert.alert("Success!", "Habit Tracker AI is now ready to chat. ✨");
    } catch (e) { Alert.alert("Error", "Failed to save key."); }
  };

  const resetKey = () => {
    Alert.alert(
      "AI Settings", 
      "Would you like to reset your Gemini API Key?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset Key", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('bloomly_gemini_key');
            setApiKey('');
            setIsSetup(false);
            setTempKey('');
            setMessages([{ id: '1', text: "Hello! I'm your Habit Tracker Assistant. How can I help you today?", sender: 'ai' }]);
          } 
        }
      ]
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const habits = await AsyncStorage.getItem('bloomly_habits');
      const books = await AsyncStorage.getItem('bloomly_books');
      
      const prompt = `
        You are the Habit Tracker AI Assistant, a productivity coach.
        User's current environment:
        - Habits: ${habits || 'None yet'}
        - Library: ${books || 'Empty'}
        
        Question: ${inputText}
        
        Provide a friendly, concise, and helpful response.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { id: Date.now().toString() + '_ai', text: responseText, sender: 'ai' }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString() + '_err', text: "Hmm, I couldn't reach the garden. Please check your API key and connection.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>
        {item.text}
      </Text>
    </View>
  );

  if (!isSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <Ionicons name="sparkles" size={60} color={COLORS.primary} />
          <Text style={styles.setupTitle}>Setup AI Assistant</Text>
          <Text style={styles.setupSub}>To chat with Habit Tracker AI, you need a free Gemini API Key.</Text>
          
          <TouchableOpacity style={styles.guideBtn} onPress={() => Alert.alert("Getting a Key", "1. Go to aistudio.google.com\n2. Log in and 'Get API Key'\n3. Copy the key and paste it here.")}>
            <Text style={styles.guideText}>How to get a key? 🔑</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.keyInput}
            placeholder="Paste Gemini API Key"
            value={tempKey}
            onChangeText={setTempKey}
            secureTextEntry
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveApiKey}>
            <Text style={styles.saveText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={24} color={COLORS.primary} />
          <Text style={styles.title}>Habit Tracker AI</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={resetKey}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.disabledBtn]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: SPACING.md },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: COLORS.white },
  aiText: { color: COLORS.text },
  inputContainer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  input: { flex: 1, backgroundColor: '#F9F9F9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  disabledBtn: { backgroundColor: COLORS.border },
  setupContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  setupTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  setupSub: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', marginTop: 10, marginBottom: 20 },
  guideBtn: { marginBottom: 30 },
  guideText: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },
  keyInput: { width: '100%', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  saveBtn: { backgroundColor: COLORS.primary, width: '100%', padding: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  saveText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});

export default AssistantScreen;
