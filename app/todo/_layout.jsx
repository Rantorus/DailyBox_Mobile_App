import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function TodoLayout() {
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
                options={{ title: "Todo Details" }} 
            />
            <Stack.Screen 
                name="CreateTodo" 
                options={{ title: "Create Todo" }} 
            />
        </Stack>
    );
}