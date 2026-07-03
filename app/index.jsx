import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import ThemedInput from '../components/ThemedInput'
import ThemedBtn from '../components/ThemedBtn.jsx'
import Spacer from '../components/Spacer.jsx'

import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { dummyUsers } from '../fetchUser/userInfo.js'

// 1. OLUŞTURDUĞUMUZ STORE'U İÇERİ AKTAR
import { useUserStore } from '../store/useStore.jsx'

import * as LocalAuthentication from 'expo-local-authentication';

const index = () => {
    const router = useRouter();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // 2. STORE'DAN LOGIN FONKSİYONUNU ÇEK
    const login = useUserStore((state) => state.login);

    const isBiometricEnabled = useUserStore(state => state.isBiometricEnabled);
    const activeUser = useUserStore(state => state.activeUser);

    const [email, setEmail] = useState('test@gmail.com')
    const [password, setPassword] = useState('Test123')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Register sayfasından dönen verileri yakala
    const params = useLocalSearchParams();

    useEffect(() => {
        if (params.registeredEmail || params.registeredPassword) {
            if (params.registeredEmail) setEmail(params.registeredEmail);
            if (params.registeredPassword) setPassword(params.registeredPassword);
            
            // Parametreleri temizliyoruz ki kullanıcı sonradan bu alanları silebilsin veya değiştirebilsin.
            // Aksi takdirde Expo Router her render'da bu verileri geri yazar.
            router.setParams({ registeredEmail: '', registeredPassword: '' });
        }
    }, [params.registeredEmail, params.registeredPassword]);

    useEffect(() => {
        if (error !== '') {
            const timer = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // useEffect — sayfa açılınca kontrol et
    useEffect(() => {
        if (isBiometricEnabled && activeUser) {
            handleBiometricLogin();
        }
    }, []);

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        setIsLoading(true);
        
        // Gerçek Backend API'sine İstek Atar
        const result = await login(email.trim(), password.trim());

        if (result.success) {
            router.replace("CalendarPage");
        } else {
            setError(result.error || 'Giriş başarısız oldu.');
            setIsLoading(false);
        }
    }

    const handleBiometricLogin = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Parmak izi veya Face ID ile giriş yap',
            cancelLabel: 'Şifre ile gir',
            fallbackLabel: 'Şifre kullan',
        });

        if (result.success) {
            router.replace('CalendarPage');
        }
        // Başarısız olursa normal login ekranı kalır
    };

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} style={{ transform: [{ scale: 1.3 }] }} />
            </ThemedView>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <Spacer height={40} />
                <ThemedText title={true} style={styles.title}>
                    Login to Your Account
                </ThemedText>
                <Spacer height={150} />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Email"
                    placeholderTextColor={theme.textLight}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Password"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />

                {error !== '' && (
                    <>
                        <Spacer height={10} />
                        <ThemedText style={{ color: "red", fontSize: 16 }}>
                            {error}
                        </ThemedText>
                        <Spacer height={15} />
                    </>
                )}

                <ThemedBtn onPress={() => handleLogin()}>
                    <ThemedText style={{ color: "white" }} title={true} >Login</ThemedText>
                </ThemedBtn>

                {isBiometricEnabled && (
                    <TouchableOpacity
                        onPress={handleBiometricLogin}
                        style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                        <Ionicons name="finger-print" size={24} color={theme.primary} />
                        <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>
                            Parmak izi ile giriş yap
                        </ThemedText>
                    </TouchableOpacity>
                )}

                <Spacer height={20} />

                <TouchableOpacity onPress={() => router.push('register')}>
                    <ThemedText style={{ fontSize: 14 }}>
                        Don't have an account?{' '}
                        <ThemedText title={true} style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                            Register
                        </ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default index

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    titleText: { fontSize: 24 },
    title: { textAlign: "center", fontSize: 18, marginBottom: 30 },
})