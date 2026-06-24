// app/media/_layout.jsx
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import ThemedText from '../../components/ThemedText';

const ICON_SIZE = 24;

const MediaLayout = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    const handleCreate = () => {
        // TODO: mediaStore'dan photos + audios + docs'u okuyup box'a kaydet
        // const { photos, audios, docs } = useMediaStore.getState();
        router.dismiss();
    };

    return (
        <Stack>
            {/* CREATE: kendi header'ı yok, media/_layout header'ı yönetir */}
            <Stack.Screen
                name="create"
                options={{
                    title: "Create Media",
                    headerStyle: { backgroundColor: theme.headerBackground },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.dismiss()}
                            style={{ marginLeft: -5, marginRight: 15 }}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.textLight} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleCreate}
                            style={{
                                marginRight: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.primary + '20',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                gap: 6,
                            }}
                        >
                            <Ionicons name="checkmark-outline" size={20} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontWeight: 'bold', fontSize: 15 }}>
                                Create
                            </ThemedText>
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* VIEW */}
            <Stack.Screen
                name="view"
                options={{
                    title: "Media",
                    headerStyle: { backgroundColor: theme.headerBackground },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.dismiss()}
                            style={{ marginLeft: -5, marginRight: 15 }}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.textLight} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push("media/edit/EditPhoto")}
                            style={{
                                marginRight: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.primary + '20',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                gap: 6,
                            }}
                        >
                            <Ionicons name="pencil-sharp" size={20} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontWeight: 'bold', fontSize: 15 }}>
                                Edit
                            </ThemedText>
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* EDIT */}
            <Stack.Screen
                name="edit"
                options={{
                    title: "Edit Media",
                    headerStyle: { backgroundColor: theme.headerBackground },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.dismiss()}
                            style={{ marginLeft: -5, marginRight: 15 }}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.textLight} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                // TODO: Değişiklikleri kaydet
                                router.back();
                            }}
                            style={{
                                marginRight: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.primary + '20',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                gap: 6,
                            }}
                        >
                            <Ionicons name="checkmark-outline" size={18} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontWeight: 'bold', fontSize: 15 }}>
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
};

export default MediaLayout;
