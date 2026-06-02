# Habit Tracker

A comprehensive, beautifully designed productivity application built with React Native and Expo. This app helps you build consistent routines, manage tasks, track progress visually, and maintain a personal journal.

## Features

- **Dashboard & Analytics:** View your progress over time with built-in charts and daily inspiration to keep you motivated.
- **Habit Manager:** Track your daily routines and check off completed habits.
- **Task & Assignment Tracking:** Organize your to-dos and upcoming deadlines.
- **Smart Notifications:** Get local push notifications to remind you of your tasks.
- **Personal Journal:** Write down your thoughts and attach photos from your gallery.
- **Reading Library:** Keep a log of books you are reading or want to read.
- **AI Assistant:** A built-in AI productivity coach (powered by Google's Gemini API) to help you stay on track and get advice based on your current habits.

## Technology Stack & Dependencies

This app is built on the **Expo** framework for React Native, allowing it to run smoothly on iOS, Android, and Web.

Key dependencies include:
- **React Navigation** (`@react-navigation/native`, `@react-navigation/bottom-tabs`): Handles smooth transitions between the different app screens.
- **AsyncStorage** (`@react-native-async-storage/async-storage`): Provides reliable, local on-device data persistence. No cloud database is required.
- **React Native Chart Kit** (`react-native-chart-kit`): Powers the analytics and progress visualization on the dashboard.
- **Expo Notifications** (`expo-notifications`): Manages local scheduling for deadline alerts.
- **Expo Image Picker** (`expo-image-picker`): Allows users to select images from their camera roll for journal entries.
- **Google Fonts** (`@expo-google-fonts/outfit`): Implements the clean and modern "Outfit" typography.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/)
- npm or yarn
- Expo CLI or the [Expo Go](https://expo.dev/go) app on your mobile device for testing.

### Installation

1. **Clone or download the repository.**
2. **Install dependencies:**
   Navigate to the project root and run:
   ```bash
   npm install
   ```
   *(Note: Use `npm install --legacy-peer-deps` if you encounter peer dependency conflicts with some React Native packages.)*

3. **Start the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

4. **Run the App:**
   - Scan the QR code with the **Expo Go** app on your physical device.
   - Or press `a` to run on an Android Emulator.
   - Or press `i` to run on an iOS Simulator (macOS only).

## AI Assistant Setup

To use the AI Assistant feature:
1. Obtain a free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2. Open the app and navigate to the AI Assistant tab.
3. Paste your key when prompted. The key is securely stored locally on your device using `AsyncStorage`.

## Security Notes

- **No Local Network Tunnels:** This application does not expose local development servers to the internet (ngrok dependencies have been removed for security).
- **Environment Variables:** The `.gitignore` is configured to prevent any `.env` files from being accidentally uploaded to version control.
- **Client-side API Key:** The Gemini API key is entered manually by the user within the app and is not hardcoded anywhere in the repository.

---

*Plant your habits, watch them grow.*
