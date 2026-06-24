// app/media/create/_layout.jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';

const MediaCreateLayout = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,  // ← create'in kendi header'ı yok, media/_layout yönetiyor
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textLight,
                tabBarStyle: {
                    backgroundColor: theme.headerBackground,
                    borderTopColor: theme.border,
                },
            }}
        >
            <Tabs.Screen
                name="UploadPhoto"
                options={{
                    title: 'Photo',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="image-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="UploadAudio"
                options={{
                    title: 'Audio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mic-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="UploadDocs"
                options={{
                    title: 'Docs',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default MediaCreateLayout;
