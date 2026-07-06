import { FlatList, Pressable, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';

import api from '../../services/api';
import { useChapterStore } from '../../store/chapterStore';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ThemedCard from '../../components/ThemedCard';

const ChapterDetail = () => {
    const { id } = useLocalSearchParams();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const router = useRouter();

    const chapters = useChapterStore((state) => state.chapters);
    const chapterData = chapters.find((data) => data.id === id);

    // Eğer veri bulunamazsa çökmeyi önleyen güvenlik kontrolü
    if (!chapterData) {
        return (
            <ThemedView safe={true} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    const [includedBoxes, setIncludedBoxes] = React.useState([]);
    const [loadingBoxes, setLoadingBoxes] = React.useState(true);

    React.useEffect(() => {
        const fetchChapterBoxes = async () => {
            setLoadingBoxes(true);
            try {
                const response = await api.get(`/boxes/chapter/${id}`);
                setIncludedBoxes(response.data.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch chapter boxes:", err);
            } finally {
                setLoadingBoxes(false);
            }
        };

        if (id) {
            fetchChapterBoxes();
        }
    }, [id]);

    return (
        <ThemedView safe={true} style={styles.container}>
            <StatusBar style={theme.statusBarStyle} />

            {/* Ekranın üstündeki Box detail ve edit yazısı*/}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({
                                    pathname: "/chapter/EditChapterPage",
                                    params: {
                                        chapterDataId : chapterData.id
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

            <ThemedCard style={{ borderRadius: 10, padding: 20 }}>
                <View>
                    <ThemedText style={{ fontSize: 18, alignSelf: "center", marginTop: 10, }} title={true}>{chapterData.title}</ThemedText>

                </View>

                {/* Yıldız İkonu (Sağ üst köşeye sabitlendi) */}
                <View style={{ position: "absolute", top: 5, right: 5 }}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Favori tıklandı")}>
                        {chapterData.is_favorite || chapterData.isFavorite ? (
                            <Ionicons name="star" size={24} color={theme.primary} /> // Favori rengi genelde altın/sarı olur
                        ) : (
                            <Ionicons name="star-outline" size={24} color={theme.border} />
                        )}
                    </TouchableOpacity>
                </View>

                <Spacer height={25} />
                <View style={styles.typeDateBar}>
                    <ThemedText>Type: {chapterData.type || 'General'}</ThemedText>
                    <ThemedText>Date: {chapterData.created_at ? chapterData.created_at.split('T')[0].split('-').reverse().join('-') : ''}</ThemedText>
                </View>
                <Spacer height={25} />
                <ThemedText style={styles.descriptionText}>Description: {chapterData.description}</ThemedText>
            </ThemedCard>

            <Spacer />
            <ThemedText style={{ paddingHorizontal: 10 }} title={true}>Boxes</ThemedText>


            <View
                style={[
                    styles.featuresDivider,
                    { backgroundColor: theme.text } // Rengi temadan alıyoruz
                ]}
            />

            {loadingBoxes ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={includedBoxes}
                    keyExtractor={(item) => item.id}
                    style={{ marginBottom: 40 }}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => router.push(`box/${item.id}`)}>
                            <ThemedCard style={[styles.card, { borderLeftColor: theme.primary }]}>
                                <ThemedText style={styles.title}>{item.title}</ThemedText>

                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <ThemedText>{item.date ? item.date.split('T')[0].split('-').reverse().join('-') : ''}</ThemedText>
                                    {item.is_favorite || item.isFavorite ? (
                                        <Ionicons name="star" size={24} color={theme.primary} />
                                    ) : (
                                        <Ionicons name="star-outline" size={24} color={theme.border} />
                                    )}
                                </View>
                                
                                <ThemedText style={{ color: 'gray', marginTop: 5 }}>{item.category.toUpperCase()}</ThemedText>
                            </ThemedCard>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <ThemedText style={{ textAlign: 'center', marginTop: 30, color: 'gray' }}>
                            No boxes found in this chapter.
                        </ThemedText>
                    }
                />
            )}




        </ThemedView>
    );
};

export default ChapterDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    typeDateBar: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    descriptionText: {
        // paddingHorizontal:18,

    },
    verticalDivider: {
        width: StyleSheet.hairlineWidth, // Yatayda 1 piksel genişlik (dikey çizgi için)
        height: 18,                     // Yazıların yüksekliğiyle uyumlu olsun
    },
    featuresDivider: {
        height: 2,               // Keskin ip gibi durmaması için çok hafif kalınlık
        width: "95%",            // Ekranın sonuna kadar uzanmasını engeller
        alignSelf: "center",     // Tam ortaya hizalar (sağdan soldan eşit boşluk kalır)
        opacity: 0.2,            // Rengi silikleştirip arka plana yumuşakça yedirir
        borderRadius: 5,         // Çizginin uçlarını yuvarlatır (keskin köşeleri yok eder)
        marginBottom: 15,
        marginTop: 10,        // Altındaki kartlarla arasına nefes alma boşluğu bırakır
    },
    noteCard: {
        flexDirection: "row",
        gap: 20,
        width: "70%",
        height: "auto",
        alignSelf: "center",
        borderRadius: 15,
        marginTop: 15,

    },
    featureDividerLine: {

        width: 1.5,           // Çizginin kalınlığı
        height: 20,         // Çizginin uzunluğu (ikona uyumlu)
        opacity: 0.3,
        alignSelf: "center"       // Göz yormaması için saydamlık
    },
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6, // İkon ve yazı arasındaki boşluk
        paddingHorizontal: 12, // Sağdan soldan iç boşluk
        paddingVertical: 6, // Üstten alttan iç boşluk
        borderRadius: 20, // Tam oval (hap) görünümü için
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    list: {
        paddingBottom: 20,

    },
    card: {
        width: "100%",
        marginVertical: 8,
        padding: 15,
        borderLeftWidth: 5,
        borderRadius: 8,
        gap: 5,

        // Gölgelendirme (kartların daha şık durması için)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});