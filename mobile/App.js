import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';

// Auth
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// App screens
import HomeScreen from './src/screens/HomeScreen';
import BooksScreen from './src/screens/BooksScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import LedgerScreen from './src/screens/LedgerScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const BooksStack = createNativeStackNavigator();
const LedgerStack = createNativeStackNavigator();

// ── Custom Tab Bar Icon ──────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={ti.wrap}>
      <Text style={[ti.emoji, focused && ti.emojiFocused]}>{emoji}</Text>
      <Text style={[ti.label, focused && ti.labelFocused]}>{label}</Text>
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 6, minWidth: 56 },
  emoji: { fontSize: 22, opacity: 0.45 },
  emojiFocused: { opacity: 1 },
  label: { fontSize: 10, color: '#475569', marginTop: 2, fontWeight: '600' },
  labelFocused: { color: '#6366f1' },
});

// ── Stacked Navigators ────────────────────────────────────────────────────────
function BooksStackNavigator() {
  return (
    <BooksStack.Navigator screenOptions={{ headerShown: false }}>
      <BooksStack.Screen name="BooksList" component={BooksScreen} />
      <BooksStack.Screen name="BookDetail" component={BookDetailScreen} />
    </BooksStack.Navigator>
  );
}

function LedgerStackNavigator() {
  return (
    <LedgerStack.Navigator screenOptions={{ headerShown: false }}>
      <LedgerStack.Screen name="LedgerList" component={LedgerScreen} />
      <LedgerStack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    </LedgerStack.Navigator>
  );
}

// ── Bottom Tabs ───────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0f1e',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 62,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="BooksTab"
        component={BooksStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📒" label="Books" focused={focused} /> }}
      />
      <Tab.Screen
        name="LedgerTab"
        component={LedgerStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🤝" label="Ledger" focused={focused} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Root Navigator ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="App" component={MainTabs} />
        {/* Alias for replace('Auth') from deep screens */}
        <Stack.Screen name="Auth" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
