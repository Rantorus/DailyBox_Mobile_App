import { ActivityIndicator, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { useEffect, useState } from 'react'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import ThemedInput from '../components/ThemedInput'
import ThemedBtn from '../components/ThemedBtn.jsx'
import Spacer from '../components/Spacer.jsx'

import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useRouter } from 'expo-router'
import { useUserStore } from '../store/useStore.jsx'
import GuestOnly from '../auth/GuestOnly.jsx'

const Register = () => {
    const router = useRouter();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // STORE'DAN REGISTER FONKSİYONUNU ÇEK
    const register = useUserStore((state) => state.register);

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [location, setLocation] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    async function handleRegister() {
        // Boş alan kontrolü
        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        // Şifre eşleşme kontrolü
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        // Şifre uzunluk kontrolü
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setIsLoading(true);

        // Gerçek API'ye Kayıt İstek Atar
        const result = await register(fullName.trim(), email.trim(), password.trim(), location.trim());

        if (result.success) {
            setIsLoading(false);
            // Kayıt başarılı → Login ekranına parametrelerle dön
            router.replace({
                pathname: '/',
                params: { registeredEmail: email, registeredPassword: password }
            });
        } else {
            setIsLoading(false);
            setError(result.error || 'Kayıt başarısız oldu.');
        }
    }

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} style={{ transform: [{ scale: 1.3 }] }} />
            </ThemedView>
        );
    }

    return (
        <GuestOnly>
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === 'ios' ? 50 : 50}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ThemedView style={styles.container}>
                <Spacer height={40} />
                <ThemedText title={true} style={styles.title}>
                    Create Your Account
                </ThemedText>
                <Spacer height={40} />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setFullName}
                    value={fullName}
                    autoCapitalize="words"
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Email"
                    placeholderTextColor={theme.textLight}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Location (e.g. Istanbul)"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setLocation}
                    value={location}
                    autoCapitalize="words"
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Password"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                />

                {error !== '' && (
                    <>
                        <Spacer height={5} />
                        <ThemedText style={{ color: "red", fontSize: 14 }}>
                            {error}
                        </ThemedText>
                        <Spacer height={10} />
                    </>
                )}

                <ThemedBtn onPress={() => handleRegister()}>
                    <ThemedText title={true} style={{ textAlign: "center" }}>Register</ThemedText>
                </ThemedBtn>

                <Spacer height={20} />

                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={{ fontSize: 14 }}>
                        Already have an account?{' '}
                        <ThemedText title={true} style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                            Login
                        </ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
    </GuestOnly>
)
}

export default Register

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    title: { textAlign: "center", fontSize: 18, marginBottom: 30 },
})
