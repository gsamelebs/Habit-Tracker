import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import HabitManagerScreen from '../screens/HabitManagerScreen';
import ToDoScreen from '../screens/ToDoScreen';
import AssignmentScreen from '../screens/AssignmentScreen';
import GrowthScreen from '../screens/GrowthScreen';
import AssistantScreen from '../screens/AssistantScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
          height: 90,
          paddingBottom: 30,
          paddingTop: 12,
          shadowColor: '#FEA3A3',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'flower' : 'flower-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'School') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Bloom') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Habits" component={HabitManagerScreen} />
      <Tab.Screen name="Tasks" component={ToDoScreen} />
      <Tab.Screen name="School" component={AssignmentScreen} />
      <Tab.Screen name="Bloom" component={GrowthScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
