import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'; // ScrollView eklendi
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';

import { dummyBoxes } from '../../fetchBox/dummyBoxes';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import { StatusBar } from 'expo-status-bar';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const NoteDetails = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const { id } = useLocalSearchParams();

    const router = useRouter();

    const boxData = dummyBoxes.find((data) => {
        return data.id == id;
    });

    // GÜVENLİK DUVARI: Veri gelmeden ekran çizilmeye çalışılırsa çökmesin diye
    if (!boxData || !boxData.note) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} safe={true}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1, paddingHorizontal: 10, paddingBottom:20 }} safe={true}>

            <StatusBar style={theme.statusBarStyle} />

            {/* Ekranın üstündeki Box detail ve edit yazısı*/}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({
                                    pathname: "/note/EditNotePage",
                                    params: {
                                        boxDataId: boxData.id
                                    }
                                });
                            }}
                            style={[styles.editButton, {
                                backgroundColor: theme.primary + '20',
                            }]}
                        >
                            <Ionicons
                                name={"pencil-sharp"}
                                size={20} // Kutu içine girdiği için 22 yerine 18 daha zarif durur
                                color={theme.primary}
                            />
                            <ThemedText style={{
                                color: theme.primary, // Yazı rengini de butonla uyumlu hale getirdik
                                fontWeight: "bold",
                                fontSize: 15
                            }}>
                                Edit
                            </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />

            {/* KAYDIRMA ALANI BAŞLANGICI */}
            <ScrollView 
                style={{ flex: 1 }} 
                showsVerticalScrollIndicator={false} // Sağdaki çirkin kaydırma çubuğunu gizler
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 10 }} // EN ALTTAKİ VE ÜSTTEKİ BOŞLUK BURADAN AYARLANIR
            >
                <ThemedCard style={{ borderRadius: 10, padding: 20,  }}>
                    
                    <ThemedText
                        style={{ fontSize: 20, alignSelf: "center", textAlign: "center", marginTop: 10 }} 
                        title={true}
                    >
                        {boxData.note.title}
                    </ThemedText>

                    <ThemedText
                        style={{ 
                            fontSize: 16, 
                            marginTop: 20, 
                            lineHeight: 24, // Satır arası boşluğu artırarak uzun yazıların okunabilirliğini yükseltir
                            textAlign: "left" 
                        }}
                    >
                        {boxData.note.content}
                    </ThemedText>

                </ThemedCard>
            </ScrollView>
            {/* KAYDIRMA ALANI BİTİŞİ */}
        </ThemedView>
    );
};

export default NoteDetails;

const styles = StyleSheet.create({
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6, // İkon ve yazı arasındaki boşluk
        paddingHorizontal: 12, // Sağdan soldan iç boşluk
        paddingVertical: 6, // Üstten alttan iç boşluk
        borderRadius: 20, // Tam oval (hap) görünümü için
    },
});