import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system/next'; // ✅ YENİ API
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// THEME VE BİLEŞEN IMPORTLARI (Kendi dosya yoluna göre kontrol et)
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

const UploadMedia = () => {
    // TEMA KURULUMU
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    // STATE'LER
    const [images, setImages] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('Photos');

    // ==========================================
    // --- FOTOĞRAF İŞLEMLERİ ---
    // ==========================================

    // ✅ YENİ API: base64 yok, doğrudan copy()
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

            setImages(prev => {
                const updated = [...prev, newImage];
                if (updated.length === 1) setIsEditMode(true);
                return updated;
            });

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
            quality: 0.8,
        });

        if (!result.canceled) {
            await saveImageToLocal(result.assets[0].uri);
        }
    };

    const takeWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Kameraya erişim izni vermelisiniz.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled) {
            await saveImageToLocal(result.assets[0].uri);
        }
    };

    // ✅ YENİ API: deleteAsync yok, file.delete()
    const removePhoto = async (id, uri) => {
        try {
            const file = new File(uri);
            if (file.exists) file.delete();

            setImages(prev => {
                const updated = prev.filter(img => img.id !== id);
                if (updated.length === 0) setIsEditMode(false);
                return updated;
            });
        } catch (error) {
            console.error("Silme hatası:", error);
        }
    };

    // ==========================================
    // --- RENDER ALANI ---
    // ==========================================

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* DİNAMİK HEADER */}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                if (images.length === 0) router.back();
                                else setIsEditMode(!isEditMode);
                            }}
                            style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
                        >
                            <Ionicons
                                    name={"checkmark-outline"}
                                    size={20} // Kutu içine girdiği için 22 yerine 18 daha zarif durur
                                    color={theme.primary}
                                />
                                <ThemedText style={{
                                    color: theme.primary, // Yazı rengini de butonla uyumlu hale getirdik
                                    fontWeight: "bold",
                                    fontSize: 15
                                }}>
                                    Create
                                </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />

            {/* TAB BAR */}
            <View style={styles.tabContainer}>
                {['Photos', 'Audio', 'Docs'].map(tab => {
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
                            <Ionicons
                                name={tab === 'Photos' ? 'image' : tab === 'Audio' ? 'mic' : 'document-text'}
                                size={18}
                                color={isActive ? theme.primary : theme.textLight}
                            />
                            <ThemedText style={{
                                color: isActive ? theme.text : theme.textLight,
                                fontWeight: isActive ? 'bold' : 'normal',
                            }}>
                                {tab}
                            </ThemedText>
                        </TouchableOpacity>
                    )
                })}
            </View>
            <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '30' }]} />

            {/* İÇERİK ALANI */}
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
                            {isEditMode ? `🛠 MANAGE PHOTOS (${images.length} Files)` : `🗓 Uploaded on: ${images[0]?.date}`}
                        </ThemedText>

                        <FlatList
                            data={images}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item, index }) => (
                                <View style={[styles.imageWrapper, { borderColor: theme.border }]}>
                                    <Image source={{ uri: item.uri }} style={styles.image} />

                                    {isEditMode ? (
                                        <TouchableOpacity
                                            style={styles.removeOverlay}
                                            activeOpacity={0.8}
                                            onPress={() => removePhoto(item.id, item.uri)}
                                        >
                                            <View style={styles.removeButton}>
                                                <Ionicons name="trash-outline" size={16} color="white" />
                                                <ThemedText style={styles.removeText}>Remove</ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.zoomOverlay}>
                                            <ThemedText style={styles.zoomText}>Photo {index + 1}</ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ALT BAR: KAMERA & GALERİ BUTONLARI */}
            {(images.length === 0 || isEditMode) && (
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
            )}
        </ThemedView>
    );
};

export default UploadMedia;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    dashedBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        padding: 40,
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    imageWrapper: {
        flex: 1,
        aspectRatio: 1,
        margin: 5,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    zoomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 6,
        alignItems: 'center',
    },
    zoomText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    removeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    removeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
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
    }
});
