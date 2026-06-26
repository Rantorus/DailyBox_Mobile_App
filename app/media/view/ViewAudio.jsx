import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'; // <-- TouchableOpacity eklendi
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useMediaStore } from '../../../store/mediaStore';

// ALT BİLEŞEN: SADECE OKUNUR (READ-ONLY) SES OYNATICI
const AudioPlayerReadOnly = ({ item, theme, playingId, setPlayingId }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(1); 
    const [position, setPosition] = useState(0);

    // Süreleri ilk açılışta göstermek için sessiz ön yükleme
    useEffect(() => {
        let currentSound = null;
        
        const initSound = async () => {
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: item.uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );
            currentSound = newSound;
            setSound(newSound);
            if (status.durationMillis) setDuration(status.durationMillis);
        };
        
        initSound();

        return () => {
            if (currentSound) {
                currentSound.unloadAsync();
            }
        };
    }, [item.uri]);

    // Başka bir ses çalmaya başlarsa otomatik durma kontrolü
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
        </View>
    );
};

// ==========================================
// ANA SAYFA BİLEŞENİ
// ==========================================
export default function ViewAudio() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const audios = useMediaStore(state => state.audios);
    const [playingAudioId, setPlayingAudioId] = useState(null);

    useEffect(() => {
        (async () => {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
            });
        })();
    }, []);

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* İÇERİK ALANI */}
            <View style={styles.contentContainer}>
                {audios.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="mic-off-outline" size={60} color={theme.textLight + '50'} style={{ marginBottom: 15 }} />
                        <ThemedText style={{ color: theme.textLight, textAlign: 'center', fontSize: 16 }}>
                            No audio files available in this box.
                        </ThemedText>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${audios.length} audio file${audios.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        <FlatList
                            data={audios}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <AudioPlayerReadOnly 
                                    item={item} 
                                    theme={theme} 
                                    playingId={playingAudioId} 
                                    setPlayingId={setPlayingAudioId} 
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
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    playerCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    playButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    playerContent: { flex: 1, marginLeft: 10, marginRight: 10 },
    timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: -5 }
});