// app/media/view/ViewPhoto.jsx
import React, { useState, useRef } from 'react';
import {
    StyleSheet, View, TouchableOpacity,
    FlatList, Image, Modal, Dimensions,
    StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ViewPhoto() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // Store'dan fotoları oku (şu an RAM'de ne varsa)
    const images = useMediaStore(state => state.images);

    // Modal state'leri
    const [modalVisible, setModalVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Büyük görüntü için FlatList ref'i (kaydırmayı kontrol etmek için)
    const fullscreenRef = useRef(null);

    // Grid'deki fotoya basınca modal açılır, o foto ortada başlar
    const openPhoto = (index) => {
        setActiveIndex(index);
        setModalVisible(true);
        // Modal açıldıktan sonra doğru indexe kaydır
        setTimeout(() => {
            fullscreenRef.current?.scrollToIndex({ index, animated: false });
        }, 10);
    };

    const closeModal = () => setModalVisible(false);

    // ==========================================
    // BOŞ EKRAN
    // ==========================================
    if (images.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <StatusBar style={theme.statusBarStyle} />
                <View style={styles.emptyState}>
                    <Ionicons name="images-outline" size={60} color={theme.primary} style={{ marginBottom: 15 }} />
                    <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                        No photos yet.
                    </ThemedText>
                    <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                        Add photos from the Edit screen.
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    // ==========================================
    // ANA EKRAN — Grid görünüm
    // ==========================================
    return (
        <ThemedView style={styles.container}>
            <StatusBar style={theme.statusBarStyle} />

            {/* Foto sayısı bilgisi */}
            <ThemedText style={[styles.infoText, { color: theme.textLight }]}>
                {`${images.length} photo${images.length > 1 ? 's' : ''}`}
            </ThemedText>

            {/* Grid */}
            <FlatList
                data={images}
                keyExtractor={item => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openPhoto(index)}
                        style={[styles.imageWrapper, { borderColor: theme.border }]}
                    >
                        <Image source={{ uri: item.uri }} style={styles.image} />

                        
                    </TouchableOpacity>
                )}
            />

            {/* ==========================================
                FULLSCREEN MODAL
            ========================================== */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
                statusBarTranslucent={true}
            >
                <View style={styles.modalContainer}>

                    {/* Kapat butonu */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeModal}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Kaç / Kaç */}
                    <View style={styles.counterContainer}>
                        <ThemedText style={styles.counterText}>
                            {activeIndex + 1} / {images.length}
                        </ThemedText>
                    </View>

                    {/* Yatay kaydırmalı tam ekran foto listesi */}
                    <FlatList
                        ref={fullscreenRef}
                        data={images}
                        keyExtractor={item => item.id}
                        horizontal={true}
                        pagingEnabled={true}           // Sayfa sayfa kaydır
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={activeIndex}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                        onMomentumScrollEnd={(e) => {
                            // Kaydırma bitince hangi fotodayız hesapla
                            const newIndex = Math.round(
                                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                            );
                            setActiveIndex(newIndex);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.fullscreenImageContainer}>
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    />

                    {/* Alt bilgi: tarih */}
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color="#aaa" />
                        <ThemedText style={styles.dateText}>
                            {images[activeIndex]?.date}
                        </ThemedText>
                    </View>

                </View>
            </Modal>

        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    infoText: {
        fontSize: 13,
        marginTop: 12,
        marginBottom: 8,
        marginLeft: 18,
    },

    // Grid
    gridContent: { paddingHorizontal: 10, paddingBottom: 20 },
    imageWrapper: {
        width: '47%',
        aspectRatio: 1,
        margin: '1.5%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    image: { width: '100%', height: '100%' },

    // Index rozeti (sağ alt köşe)
    indexBadge: {
        position: 'absolute',
        bottom: 7,
        right: 7,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    indexText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },

    // Boş ekran
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
    },

    // Kapat butonu
    closeButton: {
        position: 'absolute',
        top: (RNStatusBar.currentHeight || 44) + 10,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 6,
    },

    // X / Y sayacı
    counterContainer: {
        position: 'absolute',
        top: (RNStatusBar.currentHeight || 44) + 14,
        alignSelf: 'center',
        zIndex: 10,
    },
    counterText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    // Tam ekran foto
    fullscreenImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.75,
    },

    // Alt tarih bilgisi
    dateContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dateText: {
        color: '#aaa',
        fontSize: 13,
    },
});
