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

// 1. OLUŞTURDUĞUMUZ STORE'U İÇERİ AKTAR
import { useUserStore } from '../store/useStore.jsx'
import { getCredentials } from '../services/tokenService';
import GuestOnly from '../auth/GuestOnly.jsx';
import * as LocalAuthentication from 'expo-local-authentication';

const index = () => {
    const router = useRouter();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // 2. STORE'DAN LOGIN FONKSİYONUNU ÇEK
    const login = useUserStore((state) => state.login);

    const isBiometricEnabled = useUserStore(state => state.isBiometricEnabled);
    const activeUser = useUserStore(state => state.activeUser);
    const isAuthChecking = useUserStore(state => state.isAuthChecking);
    
    const pendingLoginCredentials = useUserStore(state => state.pendingLoginCredentials);
    const setPendingLoginCredentials = useUserStore(state => state.setPendingLoginCredentials);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Register sayfasından dönen verileri yakala
    const params = useLocalSearchParams();

    useEffect(() => {
        if (params.registeredEmail || params.registeredPassword) {
            if (params.registeredEmail) setEmail(params.registeredEmail);
            if (params.registeredPassword) setPassword(params.registeredPassword);

            // Parametreleri temizliyoruz ki kullanıcı sonradan bu alanları silebilsin veya değiştirebilsin.
            // Aksi takdirde Expo Router her render'da bu verileri geri yazar.
            router.setParams({ registeredEmail: '', registeredPassword: '' });
        } else if (pendingLoginCredentials) {
            // Şifre değiştirme işleminden dönen bilgileri doldur
            setEmail(pendingLoginCredentials.email);
            setPassword(pendingLoginCredentials.password);
            // Bilgileri yerleştirdikten sonra global store'dan temizle
            setPendingLoginCredentials(null);
        }
    }, [params.registeredEmail, params.registeredPassword, pendingLoginCredentials]);

    useEffect(() => {
        if (error !== '') {
            const timer = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Biyometrik girişi otomatik tetiklemiyoruz, kullanıcı butona basarak tetikleyecek.

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
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
        const creds = await getCredentials();
        if (!creds) {
            setError("No saved credentials found. Please log in with your password first.");
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Log in with Biometrics',
            cancelLabel: 'Log in with password',
            fallbackLabel: 'Use password',
        });

        if (result.success) {
            setIsLoading(true);
            const loginResult = await login(creds.email, creds.password);

            if (loginResult.success) {
                router.replace('CalendarPage');
            } else {
                setError(loginResult.error || 'Giriş başarısız oldu, şifreniz değişmiş olabilir.');
                setIsLoading(false);
            }
        }
    };

    // Auth kontrolünü artık GuestOnly yapıyor
    // if (isAuthChecking || activeUser) {
    //     return null; 
    // }

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} style={{ transform: [{ scale: 1.3 }] }} />
            </ThemedView>
        );
    }

    return (
        <GuestOnly>
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
                        autoCapitalize="none"
                    />

                    <View style={{ width: "80%", marginBottom: 20, position: 'relative', justifyContent: 'center' }}>
                        <ThemedInput
                            style={{ width: "100%", paddingRight: 50 }}
                            placeholder="Password"
                            placeholderTextColor={theme.textLight}
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={!isPasswordVisible}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={{ position: 'absolute', right: 15 }}
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            <Ionicons 
                                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                                size={24} 
                                color={theme.textLight} 
                            />
                        </TouchableOpacity>
                    </View>

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
                                Log in with Biometrics
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
        </GuestOnly>
    )
}

export default index

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    titleText: { fontSize: 24 },
    title: { textAlign: "center", fontSize: 18, marginBottom: 30 },
})