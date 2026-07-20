import { FlatList, Pressable, StyleSheet, TouchableOpacity, View, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useMemo } from 'react';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
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

    const [includedBoxes, setIncludedBoxes] = useState([]);
    const [loadingBoxes, setLoadingBoxes] = useState(true);

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [sortBy, setSortBy] = useState("new");
    const [tempSortBy, setTempSortBy] = useState("new");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [tempShowFavoritesOnly, setTempShowFavoritesOnly] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [tempSelectedTypes, setTempSelectedTypes] = useState([]);

    const availableTypes = useMemo(() => {
        const allTypes = includedBoxes.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean);
    }, [includedBoxes]);

    const toggleTempType = (type) => {
        if (tempSelectedTypes.includes(type)) {
            setTempSelectedTypes(tempSelectedTypes.filter(t => t !== type));
        } else {
            setTempSelectedTypes([...tempSelectedTypes, type]);
        }
    };

    const filteredData = useMemo(() => {
        return includedBoxes
            .filter((data) => {
                const favoriteMatch = showFavoritesOnly
                    ? data.is_favorite === true || data.isFavorite === true
                    : true;
                const typeMatch = selectedTypes.length > 0
                    ? selectedTypes.includes(data.type)
                    : true;
                return favoriteMatch && typeMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "new": return new Date(b.date) - new Date(a.date);
                    case "old": return new Date(a.date) - new Date(b.date);
                    case "az": return (a.title || "").localeCompare(b.title || "");
                    case "za": return (b.title || "").localeCompare(a.title || "");
                    default: return 0;
                }
            });
    }, [sortBy, showFavoritesOnly, selectedTypes, includedBoxes]);

    const previewCount = includedBoxes.filter((item) => {
        const favoriteMatch = tempShowFavoritesOnly
            ? item.is_favorite === true || item.isFavorite === true
            : true;
        const typeMatch = tempSelectedTypes.length > 0
            ? tempSelectedTypes.includes(item.type)
            : true;
        return favoriteMatch && typeMatch;
    }).length;

    useFocusEffect(
        React.useCallback(() => {
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
        }, [id])
    );

    // Eğer veri bulunamazsa çökmeyi önleyen güvenlik kontrolü
    if (!chapterData) {
        return (
            <ThemedView safe={true} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView safe={true} style={styles.container}>
            <StatusBar style={theme.statusBarStyle} />

            <View style={styles.contentWrapper}>

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
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                <ThemedText title={true}>Boxes</ThemedText>
                <TouchableOpacity
                    style={styles.filterIcon}
                    onPress={() => {
                        Keyboard.dismiss();
                        setTempSortBy(sortBy);
                        setIsFilterVisible(true);
                        setTempShowFavoritesOnly(showFavoritesOnly);
                        setTempSelectedTypes(selectedTypes);
                    }}
                >
                    <Ionicons name="filter-circle" size={28} color={theme.textLight} />
                </TouchableOpacity>
            </View>


            <View
                style={[
                    styles.featuresDivider,
                    { backgroundColor: theme.text }
                ]}
            />

            {loadingBoxes ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredData}
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
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                                    <ThemedText style={{ color: 'gray' }}>{item.category.toUpperCase()}</ThemedText>
                                    {item.category === "plan" && (
                                        <ThemedText style={{
                                            color: (item.status === true || item.status === 'true') ? theme.primary : 'gray',
                                            marginLeft: 8,
                                            fontSize: 12,
                                            fontWeight: (item.status === true || item.status === 'true') ? 'bold' : 'normal'
                                        }}>
                                            {(item.status === true || item.status === 'true') ? "• ✅ Completed" : "• ⏳ Pending"}
                                        </ThemedText>
                                    )}
                                </View>
                            </ThemedCard>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <ThemedText style={{ textAlign: 'center', marginTop: 30, color: 'gray' }}>
                            No boxes found.
                        </ThemedText>
                    }
                />
            )}
            </View>

            {isFilterVisible && (
                <Pressable
                    style={styles.overlay}
                    onPress={() => setIsFilterVisible(false)}
                />
            )}

            {isFilterVisible && (
                <ThemedView style={styles.bottomSheet}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.sheetHeader}>
                            <ThemedText title={true} style={{ fontSize: 20 }}>Filter Boxes</ThemedText>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                <Ionicons name="close-circle" size={30} color={theme.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

                        <ThemedText title={true}>SORT BY</ThemedText>
                        <Spacer height={10} />

                        <ThemedCard style={styles.sortBar}>
                            <TouchableOpacity onPress={() => setTempSortBy("new")}>
                                <ThemedText title={tempSortBy == "new"}>Newest</ThemedText>
                            </TouchableOpacity>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />
                            <TouchableOpacity onPress={() => setTempSortBy("old")}>
                                <ThemedText title={tempSortBy == "old"}>Oldest</ThemedText>
                            </TouchableOpacity>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />
                            <TouchableOpacity onPress={() => setTempSortBy("az")}>
                                <ThemedText title={tempSortBy == "az"}>A-Z</ThemedText>
                            </TouchableOpacity>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />
                            <TouchableOpacity onPress={() => setTempSortBy("za")}>
                                <ThemedText title={tempSortBy == "za"}>Z-A</ThemedText>
                            </TouchableOpacity>
                        </ThemedCard>

                        <Spacer height={25} />
                        <ThemedText title={true}>TYPES</ThemedText>
                        <Spacer height={10} />

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingLeft: 5 }}>
                            {availableTypes.map((type, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' }}
                                    onPress={() => toggleTempType(type)}
                                >
                                    <Ionicons
                                        name={tempSelectedTypes.includes(type) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={theme.primary}
                                    />
                                    <ThemedText title={true} style={{ fontSize: 16 }}>{type}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Spacer height={25} />
                        <ThemedText title={true}>STATUS</ThemedText>
                        <Spacer height={10} />

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 5 }}
                            onPress={() => setTempShowFavoritesOnly(!tempShowFavoritesOnly)}
                        >
                            <Ionicons
                                name={tempShowFavoritesOnly ? "checkbox" : "square-outline"}
                                size={24}
                                color={theme.primary}
                            />
                            <ThemedText title={true} style={{ fontSize: 16 }}>Favorites Only</ThemedText>
                        </TouchableOpacity>

                        <View style={styles.filterActionRow}>
                            <TouchableOpacity onPress={() => {
                                setIsFilterVisible(false)
                                setSortBy(tempSortBy);
                                setShowFavoritesOnly(tempShowFavoritesOnly);
                                setSelectedTypes(tempSelectedTypes);
                            }}
                                style={[styles.filterButton, { backgroundColor: theme.primary }]}>
                                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>SHOW RESULTS ({previewCount})</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setTempSortBy('new');
                                    setTempShowFavoritesOnly(false);
                                    setTempSelectedTypes([]);
                                }}
                            >
                                <ThemedText style={{ color: theme.text }}>Clear</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ThemedView>
            )}


        </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default ChapterDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentWrapper: {
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 998,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: "auto",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 25,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
    },
    sortBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        width: 300,
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 20,
        borderRadius: 15,
        alignSelf: "center",
    },
    filterActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: 'gray',
        marginTop: 10,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginRight: 15,
    },
    clearButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    filterIcon: {
        position: 'absolute',
        right: 15,
    },
});