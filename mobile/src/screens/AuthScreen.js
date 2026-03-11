import { API_BASE_URL } from "../api";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Example backend URL - for Android emulator use 10.0.2.2, for iOS/Web use localhost
  const BASE_URL = 'http://10.0.2.2:3000/api/auth';

  const handlePasswordLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', data.message);
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'login' }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'login' }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Logged in successfully');
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', data.message || 'Verification failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center p-6">
      <View className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <Text className="text-3xl font-bold text-center text-white mb-6">Welcome Back</Text>
        
        <View className="flex-row bg-slate-700/50 p-1 rounded-xl mb-6">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center ${mode === 'password' ? 'bg-slate-600' : ''}`}
            onPress={() => { setMode('password'); setOtpSent(false); }}
          >
            <Text className={`${mode === 'password' ? 'text-white font-bold' : 'text-slate-400'}`}>Password</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-lg items-center ${mode === 'otp' ? 'bg-slate-600' : ''}`}
            onPress={() => setMode('otp')}
          >
            <Text className={`${mode === 'otp' ? 'text-white font-bold' : 'text-slate-400'}`}>OTP</Text>
          </TouchableOpacity>
        </View>

        <TextInput 
          className="bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 mb-4 text-white"
          placeholder="Email Address"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {mode === 'password' ? (
          <>
            <TextInput 
              className="bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 mb-6 text-white"
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              className="bg-indigo-600 py-4 rounded-xl items-center"
              onPress={handlePasswordLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
            </TouchableOpacity>
          </>
        ) : !otpSent ? (
          <TouchableOpacity 
            className="bg-indigo-600 py-4 rounded-xl items-center"
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send OTP</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <TextInput 
              className="bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 mb-6 flex text-center text-2xl tracking-widest text-white font-mono"
              placeholder="••••••"
              placeholderTextColor="#64748b"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity 
              className="bg-indigo-600 py-4 rounded-xl items-center mb-4"
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Sign In</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
              <Text className="text-indigo-400 text-center font-medium py-2">Resend Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
