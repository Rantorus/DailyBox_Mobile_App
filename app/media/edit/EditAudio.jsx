import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, View, TouchableOpacity, FlatList, 
    Alert, Modal, TextInput, TouchableWithoutFeedback, Keyboard,
    ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system/next';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { useMediaStore } from '../../../store/mediaStore';
import { useBoxStore } from '../../../store/boxStore';
import { useLocalSearchParams } from 'expo-router';

// ==========================================
// ALT BİLEŞEN: SES OYNATICI (PLAYER)
// ==========================================
const AudioPlayer = ({ item, theme, onRemove, playingId, setPlayingId }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(1); 
    const [position, setPosition] = useState(0);

    // İlk açılışta süreleri göstermek için sessiz ön yükleme
    useEffect(() => {
        let currentSound = null;
        
        const initSound = async () => {
            try {
                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri: item.uri },
                    { shouldPlay: false },
                    onPlaybackStatusUpdate
                );
                currentSound = newSound;
                setSound(newSound);
                if (status.durationMillis) setDuration(status.durationMillis);
            } catch (err) {
                console.error("Ses yükleme hatası:", err);
            }
        };
        
        initSound();

        return () => {
            if (currentSound) currentSound.unloadAsync();
        };
    }, [item.uri]);

    // Başka ses çalarsa otomatik durdur
    useEffect(() => {
        if (playingId !== item.id && isPlaying && sound) {
            sound.pauseAsync();
            setIsPlaying(false);
        }
    }, [playingId]);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                setPlayingId(null);
            }
        }
    };

    const handlePlayPause = async () => {
        if (!sound) return;

        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
            setPlayingId(null);
        } else {
            setPlayingId(item.id);
            
            // Eğer ses bittikten sonra tekrar play'e basıldıysa (position 0'a çekilmişti), başa sar
            if (position === 0) {
                await sound.setPositionAsync(0);
            }
            
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const handleSliderComplete = async (value) => {
        if (sound) await sound.setPositionAsync(value);
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={[styles.playerCard, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity onPress={handlePlayPause} style={[styles.playButton, { backgroundColor: theme.primary }]}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.playerContent}>
                <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }} numberOfLines={1}>
                    {item.name}
                </ThemedText>

                <Slider
                    style={{ width: '100%', height: 30 }}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.border}
                    thumbTintColor={theme.primary}
                    onSlidingComplete={handleSliderComplete}
                />
                <View style={styles.timeContainer}>
                    <ThemedText style={{ fontSize: 11, color: theme.textLight }}>{formatTime(position)}</ThemedText>
                    <ThemedText style={{ fontSize: 11, color: theme.textLight }}>{formatTime(duration)}</ThemedText>
                </View>
            </View>

            {/* SİLME BUTONU (Çöp Kutusu) */}
            <TouchableOpacity onPress={() => {
                if(isPlaying) setPlayingId(null);
                onRemove(item.id, item.uri);
            }} style={{ padding: 10 }}>
                <Ionicons name="trash-outline" size={22} color="rgba(239, 68, 68, 0.9)" />
            </TouchableOpacity>
        </View>
    );
};

// ==========================================
// ANA SAYFA BİLEŞENİ (EDIT AUDIO)
// ==========================================
export default function EditAudio() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const params = useLocalSearchParams();
    
    // BACKEND & STORE
    const storeBoxId = useMediaStore(state => state.currentBoxId);
    const boxId = params.boxId || storeBoxId;
    
    const boxes = useBoxStore(state => state.boxes);
    const boxData = boxes.find((data) => String(data.id) === String(boxId));
    
    const uploadBoxAudio = useBoxStore(state => state.uploadBoxAudio);
    const deleteBoxAudio = useBoxStore(state => state.deleteBoxAudio);

    const [isUploading, setIsUploading] = useState(false);

    // Box verisinden sesleri çekiyoruz (Artık db'den obje olarak geliyor: { url, name })
    const audios = boxData?.media_audio?.map((media, index) => {
        let originalName = media.name || media.url.split('/').pop();
        
        try {
            originalName = decodeURIComponent(originalName);
        } catch (e) {
            // Decoding başarısız olursa orijinal haliyle kalsın
        }
        
        return {
            id: index.toString(),
            uri: media.url,
            name: originalName
        };
    }) || [];

    // OYNATMA STATE'İ
    const [playingAudioId, setPlayingAudioId] = useState(null);

    // KAYIT STATE'LERİ
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // İSİMLENDİRME MODAL STATE'LERİ
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [pendingUri, setPendingUri] = useState(null);
    const [recordTitle, setRecordTitle] = useState('');

    useEffect(() => {
        (async () => {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
        })();
    }, []);

    // ==========================================
    // BACKEND EKLEME (UPLOAD)
    // ==========================================
    const saveAudioToBackend = async (cacheUri, name) => {
        if (!boxId) {
            Alert.alert("Error", "Box ID not found.");
            return;
        }

        try {
            setIsUploading(true);
            // Dosya uzantısını uri'den veya default olarak m4a alıyoruz
            const match = /\.(\w+)$/.exec(cacheUri);
            const ext = match ? match[1] : 'm4a';
            const mimeType = ext === 'mp3' ? 'audio/mpeg' : (ext === 'wav' ? 'audio/wav' : 'audio/m4a');
            
            // Multipart için güvenli bir isim (boşluksuz, URL dostu) oluşturuyoruz
            const safeName = `audio_${Date.now()}.${ext}`;
            
            // Kullanıcının yazdığı isim veya orijinal dosya ismi
            const displayName = name ? (name.endsWith(`.${ext}`) ? name : `${name}.${ext}`) : safeName;

            // displayName'i de son parametre olarak gönderiyoruz
            const result = await uploadBoxAudio(boxId, cacheUri, mimeType, safeName, displayName);
            setIsUploading(false);

            if (!result.success) {
                Alert.alert("Error", result.error || "Could not save audio file.");
            }
        } catch (error) {
            setIsUploading(false);
            Alert.alert("Error", "An error occurred while saving the audio file.");
            console.error("Save Error:", error);
        }
    };

    // ==========================================
    // SİLME İŞLEMİ (ONAYLI)
    // ==========================================
    const handleRemove = (id, uri) => {
        Alert.alert(
            "Delete Audio",
            "Are you sure you want to delete this audio record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsUploading(true); // Silme işlemi bitene kadar spinner gösterelim
                        const result = await deleteBoxAudio(boxId, uri);
                        setIsUploading(false);
                        
                        if (!result.success) {
                            Alert.alert("Error", result.error || "Could not delete audio file.");
                        }
                    }
                }
            ]
        );
    };

    // ==========================================
    // SEÇME & KAYDETME İŞLEMLERİ
    // ==========================================
    const pickAudioFile = async () => {
        setPlayingAudioId(null);

        let result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*', 
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            try {
                const asset = result.assets[0];
                const originalName = asset.name || 'audio.m4a';
                await saveAudioToBackend(asset.uri, originalName);
            } catch (error) {
                Alert.alert("Error", "Could not add audio file.");
                console.error("Dosya Yükleme Hatası:", error);
            }
        }
    };

    const startRecording = async () => {
        setPlayingAudioId(null);

        try {
            const { granted } = await Audio.getPermissionsAsync();
            if (!granted) {
                Alert.alert('Permission Required', 'Microphone access is needed.');
                return;
            }

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            setRecording(recording);
            setIsRecording(true);
            setIsPaused(false);
            setRecordingDuration(0);

            recording.setOnRecordingStatusUpdate((status) => {
                if (status.isRecording) {
                    setRecordingDuration(status.durationMillis);
                }
            });

        } catch (err) {
            console.error('Kayıt başlatılamadı', err);
        }
    };

    const togglePauseRecording = async () => {
        if (!recording) return;

        try {
            if (isPaused) {
                await recording.startAsync();
                setIsPaused(false);
            } else {
                await recording.pauseAsync();
                setIsPaused(true);
            }
        } catch (error) {
            console.error('Duraklatma hatası:', error);
        }
    };

    const stopRecording = async (save = true) => {
        if (!recording) return;

        setIsRecording(false);
        setIsPaused(false);
        await recording.stopAndUnloadAsync();
        
        if (save) {
            const uri = recording.getURI();
            setPendingUri(uri);
            setRecordTitle(`Voice Record ${audios.length + 1}`);
            setShowTitleModal(true);
        }
        
        setRecording(null);
    };

    const finalizeRecordingSave = async () => {
        if (!pendingUri) return;
        
        setShowTitleModal(false);
        await saveAudioToBackend(pendingUri, recordTitle.trim() || "Voice Record");
        
        setPendingUri(null);
        setRecordTitle('');
    };

    const formatRecordingTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // ==========================================
    // RENDER EKRANI
    // ==========================================
    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            <View style={styles.contentContainer}>
                {isUploading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <ThemedText style={{ color: '#fff', marginTop: 10, fontWeight: 'bold' }}>Processing...</ThemedText>
                    </View>
                )}
                
                {audios.length === 0 ? (
                    /* BOŞ EKRAN DURUMU */
                    <View style={styles.emptyState}>
                        <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                            <Ionicons name="musical-notes-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                            <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                                No audio added yet.
                            </ThemedText>
                            <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                                Tap below to record or upload sounds.
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    /* LİSTE EKRANI */
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.infoText}>
                            {`${audios.length} audio file${audios.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        
                        <FlatList
                            data={audios}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <AudioPlayer 
                                    item={item} 
                                    theme={theme} 
                                    onRemove={handleRemove} 
                                    playingId={playingAudioId} 
                                    setPlayingId={setPlayingAudioId} 
                                />
                            )}
                        />
                    </View>
                )}
            </View>

            {/* ALT BAR (Kayıt Kontrolleri veya Ekleme Butonları) */}
            {isRecording ? (
                <View style={[styles.recordingBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
                    <View style={styles.recordingHeader}>
                        <Ionicons name={isPaused ? "pause-circle" : "ellipse"} size={14} color={isPaused ? theme.textLight : "red"} />
                        <ThemedText style={{ color: isPaused ? theme.textLight : "red", fontWeight: "bold", marginLeft: 8 }}>
                            {isPaused ? "Paused..." : "Recording..."} {formatRecordingTime(recordingDuration)}
                        </ThemedText>
                    </View>

                    <View style={styles.recordingActions}>
                        <TouchableOpacity onPress={() => stopRecording(false)} style={styles.cancelButton}>
                            <ThemedText style={{ color: theme.textLight, fontWeight: 'bold' }}>Cancel</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={togglePauseRecording} 
                            style={[styles.pauseResumeButton, { backgroundColor: isPaused ? theme.primary + '20' : theme.primary + '10' }]}
                        >
                            <Ionicons name={isPaused ? "mic" : "pause"} size={28} color={theme.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => stopRecording(true)} style={[styles.stopButton, { backgroundColor: theme.primary }]}>
                            <Ionicons name="stop" size={20} color="#fff" />
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4 }}>Save</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]} onPress={pickAudioFile}>
                        <Ionicons name="folder-open" size={20} color={theme.primary} />
                        <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Files</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={startRecording}>
                        <Ionicons name="mic" size={20} color="#fff" />
                        <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Record</ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            {/* İSİMLENDİRME MODALI */}
            <Modal visible={showTitleModal} animationType="slide">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ThemedView style={styles.modalOverlay} safe={true}>
                        <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                                Name your recording
                            </ThemedText>
                            
                            <TextInput
                                style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
                                value={recordTitle}
                                onChangeText={setRecordTitle}
                                placeholder="Enter title..."
                                placeholderTextColor={theme.textLight}
                                autoFocus
                            />
                            
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowTitleModal(false)} style={styles.modalCancelButton}>
                                    <ThemedText style={{ color: theme.textLight, fontWeight: 'bold' }}>Cancel</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={finalizeRecordingSave} style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}>
                                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </Modal>

        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    infoText: { color: '#9ca3af', fontSize: 13, marginBottom: 15, marginLeft: 5 }, // theme.textLight eşdeğeri

    // Boş Ekran Stilleri
    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    dashedBox: { borderWidth: 1.5, borderStyle: 'dashed', padding: 40, alignItems: 'center', borderRadius: 15, backgroundColor: 'transparent' },
    
    // Player Stilleri
    playerCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    playButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    playerContent: { flex: 1, marginLeft: 10, marginRight: 5 },
    timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: -5 },
    
    // Alt Bar (Bottom Bar) Stilleri
    bottomBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 15, borderTopWidth: StyleSheet.hairlineWidth },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 15, gap: 8, flex: 0.45, justifyContent: 'center' },
    
    // Kayıt Paneli Stilleri
    recordingBar: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    recordingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    recordingActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cancelButton: { padding: 15, flex: 0.3, alignItems: 'center' },
    pauseResumeButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    stopButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 15, flex: 0.35, justifyContent: 'center' },

    // Modal Stilleri
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    modalCard: { width: '100%', padding: 25, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
    titleInput: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 25 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalCancelButton: { paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
    modalSaveButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, justifyContent: 'center' }
});