import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function BoxLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Stack 
            screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text,
                headerBackTitle: "Back", // Tüm Box sayfalarında geçerli olur
            }}
        >
            {/* Sayfanın adını (name) ve varsayılan başlığını (title) veriyoruz */}
            <Stack.Screen 
                name="[id]" 
                options={{ title: "Box Details" }} 
            />
            
            <Stack.Screen 
                name="CreateBoxPage" 
                options={{ title: "Create Box" }} 
            />
            
            <Stack.Screen 
                name="EditBoxPage" 
                options={{ title: "Edit Box" }} 
            />
        </Stack>
    );
}