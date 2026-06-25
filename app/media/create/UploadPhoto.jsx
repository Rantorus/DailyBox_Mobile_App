import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system/next';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useMediaStore } from '../../../store/mediaStore';

export default function UploadPhoto() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    // GLOBAL STORE 
    const addImage = useMediaStore(state => state.addImage);
    const removeImage = useMediaStore(state => state.removeImage); // Silme fonksiyonu eklendi

    // YEREL VİTRİN
    const [localImages, setLocalImages] = useState([]);

    // ==========================================
    // SİLME İŞLEMİ (YEREL VE GLOBAL)
    // ==========================================
    const handleRemoveLocal = (id, uri) => {
        // Hafızadan da silmek iyi bir temizliktir
        try {
            const file = new File(uri);
            if (file.exists) file.delete();
        } catch (e) {
            console.error("Dosya silinemedi:", e);
        }

        removeImage(id); // 1. Global depodan sil
        setLocalImages(prev => prev.filter(image => image.id !== id)); // 2. O anki ekrandan (vitrinden) sil
    };

    // ==========================================
    // FOTOĞRAF İŞLEMLERİ
    // ==========================================
    const saveImageToLocal = async (cacheUri) => {
        try {
            const sourceFile = new File(cacheUri);
            const fileName = cacheUri.split('/').pop() || `photo_${Date.now()}.jpg`;
            const destinationFile = new File(Paths.document, fileName);

            await sourceFile.copy(destinationFile);

            const newImage = {
                id: Date.now().toString(),
                uri: destinationFile.uri,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };

            addImage(newImage); // GLOBAL DEPOYA EKLE
            setLocalImages(prev => [...prev, newImage]); // YEREL VİTRİNE EKLE

        } catch (error) {
            Alert.alert("Hata", "Fotoğraf kaydedilemedi.");
            console.error("Kayıt Hatası Detayı:", error);
        }
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermelisiniz.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            for (const asset of result.assets) {
                await saveImageToLocal(asset.uri);
            }
        }
    };

    const takeWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Kameraya erişim izni vermelisiniz.');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled) {
            await saveImageToLocal(result.assets[0].uri);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* İÇERİK */}
            <View style={styles.contentContainer}>
                {localImages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                            <Ionicons name="images-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                            <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                                No photos added yet.
                            </ThemedText>
                            <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                                Tap below to capture your memories.
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${localImages.length} photo${localImages.length > 1 ? 's' : ''} added`}
                        </ThemedText>
                        <FlatList
                            data={localImages}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            columnWrapperStyle={{ justifyContent: 'flex-start' }}
                            renderItem={({ item }) => (
                                <View style={[styles.imageWrapper, { borderColor: theme.border }]}>
                                    <Image source={{ uri: item.uri }} style={styles.image} />
                                    
                                    {/* SİLME BUTONU EKLENDİ */}
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        activeOpacity={0.8}
                                        onPress={() => handleRemoveLocal(item.id, item.uri)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ALT BAR */}
            <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                    onPress={pickFromGallery}
                >
                    <Ionicons name="image" size={20} color={theme.primary} />
                    <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Gallery</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={takeWithCamera}
                >
                    <Ionicons name="camera" size={20} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Camera</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    dashedBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        padding: 40,
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    
    // Fotoğraf ve Silme Butonu Stilleri
    imageWrapper: {
        width: '47%',
        aspectRatio: 1,
        margin: '1.5%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: '100%'
    },
    deleteButton: {
        position: 'absolute',
        top: 7,
        right: 7,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 14,
        padding: 5,
    },

    // Alt Bar
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 15,
        gap: 8,
        flex: 0.45,
        justifyContent: 'center',
    },
});