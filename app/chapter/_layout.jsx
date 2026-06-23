import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function ChapterLayout() {
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
            {/* Sadece sayfanın adını (name) ve başlığını (title) veriyoruz */}
            <Stack.Screen 
                name="[id]" 
                options={{ title: "Chapter Details" }} 
            />
            
            <Stack.Screen 
                name="CreateChapterPage" 
                options={{ title: "Create Chapter" }} 
            />
            
            <Stack.Screen 
                name="AddBoxesToChapter" 
                options={{ title: "Add Boxes" }} 
            />

            <Stack.Screen 
                name="EditChapterPage" 
                options={{ title: "Edit Chapter" }} 
            />
        </Stack>
    );
}