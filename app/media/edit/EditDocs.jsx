import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';

// ==========================================
// ALT BİLEŞEN: BELGE KARTI (DÜZENLEME MODU)
// ==========================================
const DocCardEdit = ({ item, theme, onRemove }) => {
    
    // Tıklandığında cihazın kendi PDF/Word okuyucusunda aç
    const handleOpenDoc = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(item.uri, {
                    dialogTitle: 'Belgeyi Aç',
                });
            } else {
                Alert.alert("Hata", "Bu cihazda dosya paylaşımı veya açma desteklenmiyor.");
            }
        } catch (error) {
            console.error("Dosya açılamadı:", error);
            Alert.alert("Hata", "Dosya açılırken bir sorun oluştu.");
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
                <Ionicons name={getFileIcon(item.name)} size={24} color={theme.primary} />
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

    // GLOBAL STORE 
    // Edit ekranında "Yerel Vitrin" olmaz. Doğrudan ana depoyu (global) okuyup düzenleriz.
    const docs = useMediaStore(state => state.docs);
    const addDoc = useMediaStore(state => state.addDoc);
    const removeDoc = useMediaStore(state => state.removeDoc);

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
                        try {
                            // Cihaz hafızasından dosyayı tamamen sil
                            const file = new File(uri);
                            if (file.exists) file.delete();
                        } catch (e) {
                            console.error("Dosya silinemedi:", e);
                        }
                        // Zustand store'dan kaldır
                        removeDoc(id);
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
                const sourceFile = new File(asset.uri);
                
                const originalName = asset.name || 'document.pdf';
                const uniqueFileName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
                const destinationFile = new File(Paths.document, uniqueFileName);

                await sourceFile.copy(destinationFile);

                const newDoc = {
                    id: Date.now().toString(),
                    uri: destinationFile.uri,
                    name: originalName, 
                    size: asset.size,
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                };

                addDoc(newDoc); // Doğrudan global depoya eklenir ve liste anında güncellenir

            } catch (error) {
                Alert.alert("Error", "Could not add document.");
                console.error("Dosya Kopyalama Hatası:", error);
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
                            keyExtractor={item => item.id}
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
    
    // Kart Stilleri
    docCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    docInfo: { flex: 1, marginLeft: 12, marginRight: 5 },
    
    // Alt Bar Stilleri
    bottomBar: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderRadius: 15, gap: 8, justifyContent: 'center' }
});