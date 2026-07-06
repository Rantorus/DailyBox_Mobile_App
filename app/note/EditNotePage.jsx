import { StyleSheet,TouchableOpacity,View,TouchableWithoutFeedback,Keyboard,ScrollView,KeyboardAvoidingView,Platform,} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedInput from '../../components/ThemedInput';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

import { useBoxStore } from '../../store/boxStore';
import { ActivityIndicator, Alert } from 'react-native';

const EditNotePage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    const { boxDataId } = useLocalSearchParams();
    
    const boxes = useBoxStore((state) => state.boxes);
    const updateBox = useBoxStore((state) => state.updateBox);
    const [isLoading, setIsLoading] = useState(false);

    const boxData = boxes.find((data) => data.id === boxDataId);
    
    // GÜVENLİK
    if (!boxData) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} safe={true}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    const [title, setTitle] = useState(boxData.note_title || boxData.note?.title || "");
    const [content, setContent] = useState(boxData.note_content || boxData.note?.content || "");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [selectedColor, setSelectedColor] = useState(theme.text); // Sadece bu state yeterli

    const charCount = content.length;
    const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

    const [keyboardHeight, setKeyboardHeight] = useState(0);


    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    async function handleSave() {
        if (title.trim() && content.trim()) {
            setIsLoading(true);
            const result = await updateBox(boxDataId, {
                hasNote: true,
                noteTitle: title.trim(),
                noteContent: content.trim()
            });
            setIsLoading(false);

            if (result.success) {
                router.back();
            } else {
                Alert.alert("Hata", result.error || "Not kaydedilemedi.");
            }
        } else {
            Alert.alert("Eksik Bilgi", "Başlık veya içerik boş olamaz.");
        }
    }

    return (
        <ThemedView safe={true} style={styles.container}>
            <StatusBar style={theme.statusBarStyle} />

            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleSave}
                            style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-outline" size={20} color={theme.primary} />
                                    <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 15 }}>
                                        Save
                                    </ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                }}
            />

            <ThemedInput
                style={styles.titleInput}
                placeholder="Note Title"
                placeholderTextColor={theme.textLight + "60"}
                onChangeText={setTitle}
                value={title}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>

                    <ScrollView
                        style={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: keyboardHeight + 80 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <ThemedInput
                            style={[
                                styles.contentInput,
                                {
                                    color: selectedColor,
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal'
                                }
                            ]}
                            placeholder="Start writing..."
                            placeholderTextColor={theme.textLight + "60"}
                            onChangeText={setContent}
                            value={content}
                            multiline={true}
                            textAlignVertical="top"
                        />
                    </ScrollView>

                    {/* ✅ TOOLBAR */}
                    <View style={[
                        styles.toolbar, 
                        { 
                            borderTopColor: theme.border, 
                            backgroundColor: theme.background,
                            bottom: keyboardHeight 
                        }
                    ]}>
                        <View style={styles.styleButtons}>
                            <TouchableOpacity
                                onPress={() => setIsBold(!isBold)}
                                style={[styles.toolIcon, isBold && { backgroundColor: theme.primary + '20' }]}
                            >
                                <MaterialCommunityIcons name="format-bold" size={24} color={isBold ? theme.primary : theme.text} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsItalic(!isItalic)}
                                style={[styles.toolIcon, isItalic && { backgroundColor: theme.primary + '20' }]}
                            >
                                <MaterialCommunityIcons name="format-italic" size={24} color={isItalic ? theme.primary : theme.text} />
                            </TouchableOpacity>

                            {/* --- ESKİ HALİNE DÖNEN RENK BUTONU --- */}
                            <TouchableOpacity
                                onPress={() => setSelectedColor(selectedColor === theme.text ? theme.primary : theme.text)}
                                style={styles.toolIcon}
                            >
                                <Ionicons 
                                    name="color-palette-outline" 
                                    size={24} 
                                    color={selectedColor === theme.text ? theme.text : selectedColor} 
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoPanel}>
                            <ThemedText style={{ fontSize: 12, color: theme.textLight }}>
                                {wordCount} words | {charCount} chars
                            </ThemedText>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>

        </ThemedView>
    );
};

export default EditNotePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    titleInput: {
        width: "90%",
        alignSelf: "center",
        fontSize: 20,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        width: "90%",
        alignSelf: "center",
    },
    contentInput: {
        flex: 1,
        minHeight: 400,
        fontSize: 16,
        borderWidth: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    toolbar: {
        position: 'absolute',
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    styleButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    toolIcon: {
        padding: 8,
        borderRadius: 8,
    },
    infoPanel: {
        alignItems: "flex-end",
        justifyContent: "center",
    }
});