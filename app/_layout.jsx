import { StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'

// Hem Provider'ı hem de hook'u import ediyoruz
import { ThemeProvider, useTheme } from "../contexts/ThemeContext"
import { useUserStore } from "../store/useStore"

// 1. İÇ BİLEŞEN
const InnerLayout = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const initBiometricSetting = useUserStore(state => state.initBiometricSetting);
    const checkAuth = useUserStore(state => state.checkAuth);

    useEffect(() => {
        const initApp = async () => {
            await initBiometricSetting();
            await checkAuth();
        };
        initApp();
    }, []);

    return (
        <>
            <StatusBar style={theme.statusBarStyle} backgroundColor={theme.headerBackground} />
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text
            }}>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />

                {/* ✅ TÜM MODÜLLER KENDİ KLASÖRLERİNE (LAYOUTLARINA) YÖNLENDİRİLDİ */}
                <Stack.Screen name="box" options={{ headerShown: false }} />
                <Stack.Screen name="chapter" options={{ headerShown: false }} />
                <Stack.Screen name="note" options={{ headerShown: false }} />
                <Stack.Screen name="todo" options={{ headerShown: false }} />
                <Stack.Screen name="media" options={{ headerShown: false }} />
                <Stack.Screen name="location" options={{ headerShown: false }} />
            </Stack>
        </>
    )
}

// 2. DIŞ BİLEŞEN
const RootLayout = () => {
    return (
        <ThemeProvider>
            <InnerLayout />
        </ThemeProvider>
    )
}

export default RootLayout;

const styles = StyleSheet.create({});