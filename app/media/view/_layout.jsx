// app/media/view/_layout.jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';

export default function MediaViewLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textLight,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopColor: theme.border,
                },
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerTitleStyle: { fontWeight: 'bold' },
                headerShadowVisible: false,
                // Sol: geri dön (box detayına)
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginLeft: 15 }}
                    >
                        <ThemedText style={{ color: theme.textLight, fontSize: 16 }}>
                            ← Back
                        </ThemedText>
                    </TouchableOpacity>
                ),
                // Sağ: edit ekranına git
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.push('/media/edit/EditPhoto')}
                        style={{
                            marginRight: 15,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.primary + '20',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            gap: 6,
                        }}
                    >
                        <Ionicons name="pencil-outline" size={18} color={theme.primary} />
                        <ThemedText style={{ color: theme.primary, fontWeight: 'bold', fontSize: 15 }}>
                            Edit
                        </ThemedText>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="ViewPhoto"
                options={{
                    title: 'Photo',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="image-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ViewAudio"
                options={{
                    title: 'Audio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mic-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ViewDocs"
                options={{
                    title: 'Docs',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
