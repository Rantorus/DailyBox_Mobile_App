import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing'; // Dosyaları açmak/paylaşmak için
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';
import { useLocalSearchParams } from 'expo-router';
import { useBoxStore } from '../../../store/boxStore';


// ALT BİLEŞEN: BELGE KARTI (DOC PLAYER/VIEWER)
const DocCard = ({ item, theme, onRemove }) => {
    
    // Dosyayı Telefonun Kendi Uygulamalarıyla Açma İşlemi
    const handleOpenDoc = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(item.uri, {
                    dialogTitle: 'Belgeyi Aç',
                });
            } else {
                Alert.alert("Error", "File sharing or opening is not supported on this device.");
            }
        } catch (error) {
            console.error("Dosya açılamadı:", error);
            Alert.alert("Error", "An error occurred while opening the file.");
        }
    };

    // Dosya boyutunu okunabilir formata çeviren yardımcı fonksiyon
    const formatBytes = (bytes) => {
        if (!bytes) return 'Bilinmeyen Boyut';
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Uzantıya göre ikon belirleme (Hepsi primary renginde olacak)
    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return "document-text";
        if (['doc', 'docx', 'txt'].includes(ext)) return "document";
        if (['xls', 'xlsx', 'csv'].includes(ext)) return "grid";
        if (['ppt', 'pptx'].includes(ext)) return "easel";
        return "document-outline"; // Varsayılan ikon
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


// ANA SAYFA BİLEŞENİ
export default function UploadDocs() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // GLOBAL STORE 
    const docs = useMediaStore(state => state.docs);
    const addDoc = useMediaStore(state => state.addDoc);
    const removeDoc = useMediaStore(state => state.removeDoc);

    // YEREL VİTRİN (Eğer draft modundaysa store'daki dokümanlarla başlar)
    const [localDocs, setLocalDocs] = useState(docs);

    // ==========================================
    const handleRemoveLocal = async (id, uri) => {
        // DRAFT SİLME
        try {
            const file = new File(uri);
            if (file.exists) file.delete();
        } catch (e) {
            console.error("Dosya silinemedi:", e);
        }
        removeDoc(id);
        setLocalDocs(prev => prev.filter(doc => doc.id !== id));
    };

    const saveDocToLocal = async (asset) => {
        const originalName = asset.name || 'document.pdf';
        
        const sourceFile = new File(asset.uri);
        const match = /\.(\w+)$/.exec(originalName);
        const ext = match ? match[1] : 'pdf';
        const uniqueFileName = `${Date.now()}_doc.${ext}`;
        const destinationFile = new File(Paths.document, uniqueFileName);

        try {
            await sourceFile.copy(destinationFile);
            const newDoc = {
                id: Date.now().toString(),
                uri: destinationFile.uri,
                name: originalName, 
                size: asset.size,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };

            addDoc(newDoc); // Doğrudan global depoya eklenir
            setLocalDocs(prev => [...prev, newDoc]);
        } catch (error) {
            console.error("Kopyalama Hatası:", error);
            Alert.alert("Error", "Could not copy document.");
        }
    };

    // ==========================================
    // DOSYA SEÇME VE FİLTRELEME
    // ==========================================
    const pickDocument = async () => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
            'text/plain'
        ];

        let result = await DocumentPicker.getDocumentAsync({
            type: allowedTypes, 
            copyToCacheDirectory: true,
            multiple: false, 
        });

        if (!result.canceled) {
            await saveDocToLocal(result.assets[0]);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* İÇERİK - Yerel Vitrin Gösterimi */}
            <View style={styles.contentContainer}>

                {localDocs.length === 0 ? (
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
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${localDocs.length} document${localDocs.length > 1 ? 's' : ''} added`}
                        </ThemedText>
                        <FlatList
                            data={localDocs}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <DocCard 
                                    item={item} 
                                    theme={theme} 
                                    onRemove={handleRemoveLocal} 
                                />
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ALT BAR: Sadece Dosya Seçme Butonu */}
            <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={pickDocument}>
                    <Ionicons name="folder-open" size={20} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Select Document</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    
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