import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'

// Hem Provider'ı hem de hook'u import ediyoruz
import { ThemeProvider, useTheme } from "../contexts/ThemeContext"

// 1. İÇ BİLEŞEN (TÜKETİCİ): Provider'ın İÇİNDE kaldığı için temayı güvenle okuyabilir.
const InnerLayout = () => {
    const { themeName } = useTheme(); 
    const theme = Colors[themeName];  

    return (
        <>
            <StatusBar style={theme.statusBarStyle} backgroundColor={theme.headerBackground} />
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text
            }}>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ title: "Daily Box" }} />
                <Stack.Screen 
                  name="box/[id]" 
                  options={{ 
                    title: "Box Details", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
                <Stack.Screen 
                  name="chapter/[id]" 
                  options={{ 
                    title: "Chapter Details", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
                <Stack.Screen 
                  name="box/CreateBoxPage" 
                  options={{ 
                    title: "Create Box", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
                <Stack.Screen 
                  name="box/EditBoxPage" 
                  options={{ 
                    title: "Edit Box", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
                <Stack.Screen 
                  name="chapter/CreateChapterPage" 
                  options={{ 
                    title: "Create Chapter", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
                <Stack.Screen 
                  name="chapter/AddBoxesToChapter" 
                  options={{ 
                    title: "Add Boxes", // Yukarıdaki başlık
                    headerBackTitle: "Back", // iOS için geri butonu yazısı
                    headerStyle: { backgroundColor: theme.headerBackground },
                  }} 
                />
            </Stack>
        </>
    )
}

// 2. DIŞ BİLEŞEN (SAĞLAYICI): Tek görevi İç Bileşeni sarmalamaktır. İçinde useTheme ÇAĞRILAMAZ!
const RootLayout = () => {
    return (
        <ThemeProvider>
            <InnerLayout />
        </ThemeProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})