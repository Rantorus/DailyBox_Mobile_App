import React, { useEffect, useCallback } from 'react'
import { Stack, SplashScreen, useRouter, useRootNavigationState } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { Colors } from '../constants/Colors'

// Hem Provider'ı hem de hook'u import ediyoruz
import { ThemeProvider, useTheme } from "../contexts/ThemeContext"
import { useUserStore } from "../store/useStore"

SplashScreen.preventAutoHideAsync();

// 1. İÇ BİLEŞEN
const InnerLayout = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();
    const initBiometricSetting = useUserStore(state => state.initBiometricSetting);
    const checkAuth = useUserStore(state => state.checkAuth);
    const activeUser = useUserStore(state => state.activeUser);
    const isAuthChecking = useUserStore(state => state.isAuthChecking);
    const [isReady, setIsReady] = React.useState(false);

    // Navigation state kontrolü - navigator tamamen mount olmuş mu?
    const rootNavigationState = useRootNavigationState();
    const isNavigatorReady = rootNavigationState?.key != null;

    useEffect(() => {
        const initApp = async () => {
            await initBiometricSetting();
            await checkAuth();
            setIsReady(true);
        };
        initApp();
    }, []);

    // Auth kontrolü bittiğinde VE navigator hazır olduğunda splash'ı gizle
    const onLayoutReady = useCallback(() => {
        if (isReady && isNavigatorReady) {
            // Küçük bir gecikme ile splash'ı gizle - hedef ekranın renderlanmasını bekle
            setTimeout(() => {
                SplashScreen.hideAsync();
            }, 100);
        }
    }, [isReady, isNavigatorReady]);

    useEffect(() => {
        onLayoutReady();
    }, [onLayoutReady]);

    return (
        <>
            <StatusBar style={theme.statusBarStyle} backgroundColor={theme.headerBackground} />
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text,
                // Her ekranın arka planını temanın rengine boya - beyaz flash önlenir
                contentStyle: { backgroundColor: theme.background },
                animation: 'none', // İlk açılışta animasyon olmasın
            }}>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />

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