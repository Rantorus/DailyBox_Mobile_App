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
            
            <Stack.Screen 
                name="UploadLocation" 
                options={{ title: "Create Location" }} 
            />

            <Stack.Screen 
                name="ViewLocation" 
                options={{ title: "Location" }} 
            />

            <Stack.Screen 
                name="EditLocation" 
                options={{ title: "Edit Location" }} 
            />
            
            
        </Stack>
    );
}