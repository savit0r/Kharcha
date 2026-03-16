import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../api';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigation.replace('App');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch {
      Alert.alert('Error', 'Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Enter your email first'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), type: 'login' }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        Alert.alert('OTP Sent', `Code sent to ${email}`);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { Alert.alert('Error', 'Enter the OTP'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), type: 'login' }),
      });
      const data = await res.json();
      if (res.ok) {
        navigation.replace('App');
      } else {
        Alert.alert('Error', data.message || 'Verification failed');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Text style={s.logoIcon}>₹</Text>
            </View>
            <Text style={s.logoTitle}>Spendora</Text>
            <Text style={s.logoSub}>Your cashbook companion</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Top accent bar */}
            <View style={s.accentBar} />

            <Text style={s.heading}>Welcome Back</Text>

            {/* Mode Toggle */}
            <View style={s.modeToggle}>
              {['password', 'otp'].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[s.modeBtn, mode === m && s.modeBtnActive]}
                  onPress={() => { setMode(m); setOtpSent(false); setOtp(''); }}
                >
                  <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                    {m === 'password' ? 'Password' : 'OTP Code'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Email */}
            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Login */}
            {mode === 'password' && (
              <>
                <View style={s.inputGroup}>
                  <Text style={s.label}>PASSWORD</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Your password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handlePasswordLogin}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* OTP - Send step */}
            {mode === 'otp' && !otpSent && (
              <TouchableOpacity
                style={[s.btn, loading && s.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Verification Code</Text>}
              </TouchableOpacity>
            )}

            {/* OTP - Verify step */}
            {mode === 'otp' && otpSent && (
              <>
                <Text style={s.otpHint}>Code sent to <Text style={{ color: '#e2e8f0' }}>{email}</Text></Text>
                <View style={s.inputGroup}>
                  <Text style={s.label}>OTP CODE</Text>
                  <TextInput
                    style={[s.input, s.otpInput]}
                    placeholder="••••••"
                    placeholderTextColor="#475569"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>
                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify & Sign In</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setOtpSent(false); setOtp(''); }}>
                  <Text style={s.link}>Use a different email / Resend Code</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Register link */}
            <View style={s.footer}>
              <Text style={s.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.link}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoIcon: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  logoTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  logoSub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#1e293b', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  accentBar: { height: 3, backgroundColor: '#4f46e5', width: '100%' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center', marginTop: 24, marginBottom: 20 },
  modeToggle: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 12, margin: 20, marginTop: 0, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#334155' },
  modeBtnText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  modeBtnTextActive: { color: '#f8fafc' },
  inputGroup: { paddingHorizontal: 20, marginBottom: 14 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, color: '#f8fafc', fontSize: 15 },
  otpInput: { fontSize: 24, letterSpacing: 12, fontWeight: 'bold' },
  otpHint: { color: '#64748b', fontSize: 13, textAlign: 'center', paddingHorizontal: 20, marginBottom: 14 },
  btn: { backgroundColor: '#4f46e5', marginHorizontal: 20, marginBottom: 16, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 24, paddingTop: 8 },
  footerText: { color: '#64748b', fontSize: 14 },
  link: { color: '#818cf8', fontWeight: '600', fontSize: 14 },
});
