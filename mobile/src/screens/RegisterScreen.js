import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success!', data.message || 'Account created. Please login.', [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch {
      Alert.alert('Error', 'Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Text style={s.logoIcon}>₹</Text>
            </View>
            <Text style={s.logoTitle}>Spendora</Text>
          </View>

          <View style={s.card}>
            <View style={s.accentBar} />
            <Text style={s.heading}>Create Account</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput
                style={s.input}
                placeholder="Create a password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={s.footer}>
              <Text style={s.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.link}>Login</Text>
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
  card: { backgroundColor: '#1e293b', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  accentBar: { height: 3, backgroundColor: '#4f46e5', width: '100%' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center', marginTop: 24, marginBottom: 24 },
  inputGroup: { paddingHorizontal: 20, marginBottom: 14 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, color: '#f8fafc', fontSize: 15 },
  btn: { backgroundColor: '#4f46e5', marginHorizontal: 20, marginBottom: 16, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 24, paddingTop: 4 },
  footerText: { color: '#64748b', fontSize: 14 },
  link: { color: '#818cf8', fontWeight: '600', fontSize: 14 },
});
