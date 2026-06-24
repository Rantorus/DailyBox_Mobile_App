import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function MediaLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Stack 
            screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text,
                headerBackTitle: "Back", // Tüm Chapter sayfalarında geri tuşu için geçerli olur
            }}
        >
            <Stack.Screen 
                name="UploadMedia" 
                options={{ title: "Upload Media" }} 
            />
            
        </Stack>
    );
}