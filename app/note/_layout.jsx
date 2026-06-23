import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function NoteLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Stack 
            screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text,
                headerBackTitle: "Back", // Tüm Note sayfalarında geçerli olur
            }}
        >
            {/* Sadece sayfanın adını (name) ve başlığını (title) veriyoruz */}
            <Stack.Screen 
                name="[id]" 
                options={{ title: "Note Details" }} 
            />
            
            {/* Not: Sayfa içindeki <Stack.Screen/> ayarları buradakileri ezer.
                Örneğin CreateNotePage'de "New Note" yazıyorsa, ekranda o görünür. */}
            <Stack.Screen 
                name="CreateNotePage" 
                options={{ title: "Create Note" }} 
            />
            
            <Stack.Screen 
                name="EditNotePage" 
                options={{ title: "Edit Note" }} 
            />
        </Stack>
    );
}