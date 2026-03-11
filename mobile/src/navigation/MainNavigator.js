import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
// import { Ionicons } from '@expo/vector-icons'; // Optional: Use for icons later

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // slate-900
          borderTopColor: '#334155', // slate-700
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#6366f1', // indigo-500
        tabBarInactiveTintColor: '#94a3b8', // slate-400
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Overview' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
      />
    </Tab.Navigator>
  );
}
