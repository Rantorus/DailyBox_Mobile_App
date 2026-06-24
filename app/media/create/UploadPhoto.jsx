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

    const [activeTab, setActiveTab] = useState('Photos');

    // ==========================================
    // Global Store — useState yerine
    // ==========================================
    const images = useMediaStore(state => state.images);
    const addImage = useMediaStore(state => state.addImage);

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

            addImage(newImage); // ← store'a ekle

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
            allowsMultipleSelection: true, // ✅ Çoklu seçimi aktif hale getiren parametre
            quality: 0.8,
        });

        if (!result.canceled) {
            // ✅ Seçilen tüm fotoğrafları sırayla yerel hafızaya kaydeder
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
                {images.length === 0 ? (
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
                            {`${images.length} photo${images.length > 1 ? 's' : ''} added`}
                        </ThemedText>
                        <FlatList
                            data={images}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            columnWrapperStyle={{ justifyContent: 'flex-start' }}
                            renderItem={({ item, index }) => (
                                <View style={[styles.imageWrapper, { borderColor: theme.border }]}>
                                    <Image source={{ uri: item.uri }} style={styles.image} />
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
    headerButton: {
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    menuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20 },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
    imageWrapper: {
        // flex: 1 YERİNE AŞAĞIDAKİLERİ KULLANIYORUZ
        width: '47%', // Ekranın %50'sinden biraz az (marginler için pay bırakıyoruz)
        aspectRatio: 1, // Kare kalmasını sağlar
        margin: '1.5%', // Sağdan soldan eşit boşluk
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: { width: '100%', height: '100%' },
    zoomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 6,
        alignItems: 'center',
    },
    zoomText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
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
