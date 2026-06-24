// app/media/create/_layout.jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';

const ICON_SIZE = 24;

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
                    backgroundColor: theme.tabBarBackground,
                    borderTopColor: theme.border,
                    paddingTop: 10,
                    height: 80
                },
                tabBarActiveTintColor: theme.tabBarIconActive,
                tabBarInactiveTintColor: theme.tabBarIconInactive,
            }}
        >
            <Tabs.Screen
                name="UploadPhoto"
                options={{
                    title: 'Photo',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="image-outline" size={ICON_SIZE} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="UploadAudio"
                options={{
                    title: 'Audio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mic-outline" size={ICON_SIZE} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="UploadDocs"
                options={{
                    title: 'Docs',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={ICON_SIZE}size={ICON_SIZE} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default MediaCreateLayout;
