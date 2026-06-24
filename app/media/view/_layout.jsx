// app/media/view/_layout.jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';

const ICON_SIZE = 24;

export default function MediaViewLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.tabBarIconActive,
                tabBarInactiveTintColor: theme.tabBarIconInactive,
                tabBarStyle: {
                    backgroundColor: theme.tabBarBackground,
                    borderTopColor: theme.border,
                    paddingTop: 10,
                    height: 80,
                },
            }}
        >
            <Tabs.Screen
                name="ViewPhoto"
                options={{
                    title: 'Photo',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="image-outline" size={ICON_SIZE} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ViewAudio"
                options={{
                    title: 'Audio',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="mic-outline" size={ICON_SIZE} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ViewDocs"
                options={{
                    title: 'Docs',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="document-text-outline" size={ICON_SIZE} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
