import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';

// ==========================================
// ALT BİLEŞEN: SADECE OKUNUR (READ-ONLY) BELGE KARTI
// ==========================================
const DocCardReadOnly = ({ item, theme }) => {
    
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

            {/* SİLME İKONU GÜVENLİK AMACIYLA KALDIRILDI */}
        </TouchableOpacity>
    );
};

// ==========================================
// ANA SAYFA BİLEŞENİ
// ==========================================
export default function ViewDocs() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    // Global store'dan sadece okuma yapıyoruz (addDoc veya removeDoc'a ihtiyacımız yok)
    const docs = useMediaStore(state => state.docs);

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* İÇERİK ALANI */}
            <View style={styles.contentContainer}>
                {docs.length === 0 ? (
                    // BOŞ DURUM EKRANI
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={60} color={theme.textLight + '50'} style={{ marginBottom: 15 }} />
                        <ThemedText style={{ color: theme.textLight, textAlign: 'center', fontSize: 16 }}>
                            No documents available in this box.
                        </ThemedText>
                    </View>
                ) : (
                    // BELGE LİSTESİ
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${docs.length} document${docs.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        <FlatList
                            data={docs}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <DocCardReadOnly 
                                    item={item} 
                                    theme={theme} 
                                />
                            )}
                        />
                    </View>
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    
    // Boş Ekran Stilleri
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    
    // Kart Stilleri
    docCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    docInfo: { flex: 1, marginLeft: 12, marginRight: 5 }
});