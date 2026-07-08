import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';
import { useBoxStore } from '../../../store/boxStore';
import { useLocalSearchParams } from 'expo-router';

// ==========================================
// ALT BİLEŞEN: BELGE KARTI (DÜZENLEME MODU)
// ==========================================
const DocCardEdit = ({ item, theme, onRemove }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Tıklandığında cihazın kendi PDF/Word okuyucusunda veya tarayıcıda aç
    const handleOpenDoc = async () => {
        try {
            if (item.uri.startsWith('http')) {
                setIsDownloading(true);
                
                // Güvenli ve temiz bir dosya adı oluştur
                let safeName = item.name ? item.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') : `doc_${Date.now()}.pdf`;
                if (safeName.length < 3) safeName = `doc_${Date.now()}.pdf`;
                
                const fileUri = FileSystem.cacheDirectory + safeName;
                
                // Daha önce indirilmiş mi kontrol et
                const fileInfo = await FileSystem.getInfoAsync(fileUri);
                
                if (!fileInfo.exists) {
                    await FileSystem.downloadAsync(item.uri, fileUri);
                }
                
                setIsDownloading(false);
                
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(fileUri, {
                        dialogTitle: 'Belgeyi Aç',
                    });
                } else {
                    Alert.alert("Error", "File sharing or opening is not supported on this device.");
                }
            } else {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(item.uri, {
                        dialogTitle: 'Belgeyi Aç',
                    });
                } else {
                    Alert.alert("Error", "File sharing or opening is not supported on this device.");
                }
            }
        } catch (error) {
            setIsDownloading(false);
            console.error("Could not open file:", error);
            Alert.alert("Error", "An error occurred while opening the file.");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return 'Bilinmeyen Boyut';
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return "document-text";
        if (['doc', 'docx', 'txt'].includes(ext)) return "document";
        if (['xls', 'xlsx', 'csv'].includes(ext)) return "grid";
        if (['ppt', 'pptx'].includes(ext)) return "easel";
        return "document-outline";
    };

    return (
        <TouchableOpacity 
            onPress={handleOpenDoc} 
            activeOpacity={0.7}
            style={[styles.docCard, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
        >
            {/* SOL: İkon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                {isDownloading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                    <Ionicons name={getFileIcon(item.name)} size={24} color={theme.primary} />
                )}
            </View>
            
            {/* ORTA: Dosya Bilgileri */}
            <View style={styles.docInfo}>
                <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }} numberOfLines={1}>
                    {item.name}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.textLight }}>
                    {item.date} • {formatBytes(item.size)}
                </ThemedText>
            </View>

            {/* SAĞ: Silme Butonu */}
            <TouchableOpacity onPress={() => onRemove(item.id, item.uri)} style={{ padding: 10 }}>
                <Ionicons name="trash-outline" size={22} color="rgba(239, 68, 68, 0.9)" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// ==========================================
// ANA SAYFA BİLEŞENİ
// ==========================================
export default function EditDocs() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // BACKEND & PARAMETRELER
    const params = useLocalSearchParams();
    const storeBoxId = useMediaStore(state => state.currentBoxId);
    const boxId = params.boxId || storeBoxId;

    const boxes = useBoxStore(state => state.boxes);
    const uploadBoxDoc = useBoxStore(state => state.uploadBoxDoc);
    const deleteBoxDoc = useBoxStore(state => state.deleteBoxDoc);
    const [isUploading, setIsUploading] = useState(false);

    // BOX DATA'YI BUL VE PARSE ET
    const boxData = boxes.find((data) => String(data.id) === String(boxId));
    
    // Box verisinden dokümanları çekiyoruz
    const docs = boxData?.media_docs?.map((media, index) => {
        let originalName = media.name || (media.url ? media.url.split('/').pop() : media);
        
        try {
            if (originalName) {
                originalName = decodeURIComponent(originalName);
            }
        } catch (e) {}
        
        return {
            id: media.url || index.toString(),
            uri: media.url || media.uri || media,
            name: originalName,
            size: media.size,
            date: media.date
        };
    }) || [];

    // ==========================================
    // SİLME İŞLEMİ (ONAYLI VE GÜVENLİ)
    // ==========================================
    const handleRemove = (id, uri) => {
        Alert.alert(
            "Delete Document",
            "Are you sure you want to delete this document?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsUploading(true);
                        // Backend üzerinden sil
                        const docUrl = uri || id; // Edit modunda id veya uri URL'yi taşıyor olabilir
                        const result = await deleteBoxDoc(boxId, docUrl);
                        setIsUploading(false);

                        if (!result.success) {
                            Alert.alert("Error", result.error || "Could not delete document.");
                        }
                    }
                }
            ]
        );
    };

    // ==========================================
    // DOSYA SEÇME VE EKLEME
    // ==========================================
    const pickDocument = async () => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        let result = await DocumentPicker.getDocumentAsync({
            type: allowedTypes,
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (!result.canceled) {
            try {
                const asset = result.assets[0];
                const originalName = asset.name || 'document.pdf';
                
                setIsUploading(true);
                
                // Güvenli dosya adı oluşturma
                const match = /\.(\w+)$/.exec(originalName);
                const ext = match ? match[1] : 'pdf';
                const safeName = `doc_${Date.now()}.${ext}`;
                const displayName = originalName;

                const uploadResult = await uploadBoxDoc(boxId, asset.uri, asset.mimeType, safeName, displayName);
                setIsUploading(false);

                if (!uploadResult.success) {
                    Alert.alert("Error", uploadResult.error || "Could not add document.");
                }

            } catch (error) {
                setIsUploading(false);
                Alert.alert("Error", "Could not add document.");
                console.error("File Upload Error:", error);
            }
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
                <Modal
                    visible={isUploading}
                    transparent={true}
                    animationType="fade"
                    statusBarTranslucent={true}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <ThemedText style={{ color: '#fff', marginTop: 12, fontWeight: 'bold', fontSize: 16 }}>Processing...</ThemedText>
                    </View>
                </Modal>
                
                {docs.length === 0 ? (
                    // BOŞ DURUM EKRANI
                    <View style={styles.emptyState}>
                        <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                            <Ionicons name="document-text-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                            <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                                No documents added yet.
                            </ThemedText>
                            <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                                Tap below to upload PDF or Office files.
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    // BELGE LİSTESİ
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.infoText}>
                            {`${docs.length} document${docs.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        
                        <FlatList
                            data={docs}
                            // API'dan gelen URL id olarak kullanılabilir
                            keyExtractor={(item, index) => item.id || index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <DocCardEdit 
                                    item={item} 
                                    theme={theme} 
                                    onRemove={handleRemove} 
                                />
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ALT BAR */}
            <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={pickDocument}>
                    <Ionicons name="folder-open" size={20} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Add Document</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    infoText: { color: '#9ca3af', fontSize: 13, marginBottom: 15, marginLeft: 5 },
    
    // Boş Ekran Stilleri
    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    dashedBox: { borderWidth: 1.5, borderStyle: 'dashed', padding: 40, alignItems: 'center', borderRadius: 15, backgroundColor: 'transparent' },
    
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 15 },
    
    // Kart Stilleri
    docCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    docInfo: { flex: 1, marginLeft: 12, marginRight: 5 },
    
    // Alt Bar Stilleri
    bottomBar: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderRadius: 15, gap: 8, justifyContent: 'center' }
});