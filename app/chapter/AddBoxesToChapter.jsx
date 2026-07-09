import { StyleSheet, View, FlatList, Pressable, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback, DeviceEventEmitter } from 'react-native';
import React, { useState, useMemo } from 'react';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import ThemedInput from '../../components/ThemedInput';

import { useSearch } from '../../hooks/useSearch';

import { useRouter, Stack, useLocalSearchParams } from 'expo-router'

import Ionicons from '@expo/vector-icons/Ionicons';


import { useBoxStore } from '../../store/boxStore';
import Spacer from '../../components/Spacer';

const AddBoxesToChapter = () => {

    const { themeName } = useTheme();
    const theme = Colors[themeName]
    const router = useRouter()
    const boxes = useBoxStore((state) => state.boxes);
    const [shownCategory, setShownCategory] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const [sortBy, setSortBy] = useState("new");
    const [tempSortBy, setTempSortBy] = useState('new');

    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [tempShowFavoritesOnly, setTempShowFavoritesOnly] = useState(false);

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [tempSelectedTypes, setTempSelectedTypes] = useState([]);

    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [tempSelectedStatuses, setTempSelectedStatuses] = useState([]);

    const [selectedBoxIds, setSelectedBoxIds] = useState([]);


    const toggleBoxSelection = (id) => {
        setSelectedBoxIds((prev) =>
            prev.includes(id)
                ? prev.filter((boxId) => boxId !== id) // Zaten seçiliyse listeden çıkar
                : [...prev, id]                        // Seçili değilse listeye ekle
        );
    };

    // DİNAMİK TİP LİSTESİ ÇIKARMA
    // Veritabanından gelen boxes içindeki tüm 'type' değerlerini alır ve tekrar edenleri (Set ile) eler.
    const availableTypes = useMemo(() => {
        const allTypes = boxes.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean); // filter(Boolean) boş olanları temizler
    }, [boxes]);

    // ÇOKLU SEÇİM İÇİN YARDIMCI FONKSİYON (Kum havuzu için)
    const toggleTempType = (type) => {
        if (tempSelectedTypes.includes(type)) {
            setTempSelectedTypes(tempSelectedTypes.filter(t => t !== type));
        } else {
            setTempSelectedTypes([...tempSelectedTypes, type]);
        }
    };

    const toggleTempStatus = (statusValue) => {
        if (tempSelectedStatuses.includes(statusValue)) {
            setTempSelectedStatuses(tempSelectedStatuses.filter(s => s !== statusValue));
        } else {
            setTempSelectedStatuses([...tempSelectedStatuses, statusValue]);
        }
    };

    // 3. İLK VERİ HAZIRLIĞI (Sonsuz döngüyü çözen useMemo yapısı)
    const filteredData = useMemo(() => {
        return boxes
            .filter((data) => {
                const categoryMatch = shownCategory
                    ? (data.category || '').toLowerCase() === 'log'
                    : (data.category || '').toLowerCase() === 'plan';

                // GERÇEK FAVORİ FİLTRESİ
                const favoriteMatch = showFavoritesOnly
                    ? (data.is_favorite === true || data.isFavorite === true)
                    : true;

                const typeMatch = selectedTypes.length > 0
                    ? selectedTypes.includes(data.type)
                    : true;

                const statusMatch = selectedStatuses.length > 0 && !shownCategory
                    ? (data.status ? selectedStatuses.includes('completed') : selectedStatuses.includes('pending'))
                    : true;

                return categoryMatch && favoriteMatch && typeMatch && statusMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "new": return new Date(b.date) - new Date(a.date);
                    case "old": return new Date(a.date) - new Date(b.date);
                    case "az": return a.title.localeCompare(b.title);
                    case "za": return b.title.localeCompare(a.title);
                    default: return 0;
                }
            });
    }, [shownCategory, sortBy, showFavoritesOnly, selectedTypes, selectedStatuses, boxes]); // KRİTİK NOKTA: Sadece bu ikisi değişirse listeyi baştan hesapla

    // 3. ARAMA HOOK'U (query değişkeni BURADA doğuyor)
    const { query, setQuery, results, loading } = useSearch(filteredData);

    // 5. ÖNİZLEME SAYACI (Filtre Paneli İçin)
    const previewCount = boxes.filter((item) => {
        // 1. Temel Filtre: Log mu Plan mı?
        const categoryMatch = shownCategory
            ? (item.category || '').toLowerCase() === 'log'
            : (item.category || '').toLowerCase() === 'plan';

        // 2. Arama Filtresi: Arama çubuğundaki yazıyı HEM BAŞLIKTA HEM AÇIKLAMADA ara!
        const searchMatch = query
            ? (item.title || '').toLowerCase().includes(query.toLowerCase()) ||
              (item.description || '').toLowerCase().includes(query.toLowerCase())
            : true;

        // 3. FAVORİ FİLTRESİ (Geçici durumu kontrol et)
        const favoriteMatch = tempShowFavoritesOnly
            ? (item.is_favorite === true || item.isFavorite === true)
            : true;

        const typeMatch = tempSelectedTypes.length > 0
            ? tempSelectedTypes.includes(item.type)
            : true;

        const statusMatch = tempSelectedStatuses.length > 0 && !shownCategory
            ? (item.status ? tempSelectedStatuses.includes('completed') : tempSelectedStatuses.includes('pending'))
            : true;

        // (İleride buraya Seçilen Kategoriler ve Favoriler gibi filtreleri de ekleyeceğiz)

        return categoryMatch && searchMatch && favoriteMatch && typeMatch && statusMatch;
    }).length;



    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView safe={true} style={styles.container}>

                {/* --- ÜST BAR (HEADER RIGHT) BUTONU --- */}
                <Stack.Screen
                    options={{
                        headerTitle: "Select Boxes",
                        headerRight: () => selectedBoxIds.length > 0 ? (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    // 2. Seçilen ID'leri arka plandan fırlatıyoruz:
                                    DeviceEventEmitter.emit('boxes_selected', selectedBoxIds);

                                    // 3. Stack'i şişirmeden, doğal yolla bir önceki sayfaya pop yapıyoruz:
                                    router.back();
                                }}
                                style={styles.headerAddButton}
                            >
                                <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 14 }}>
                                    Add Boxes ({selectedBoxIds.length})
                                </ThemedText>
                            </TouchableOpacity>
                        ) : null
                    }}
                />

                <View style={styles.searchWrapper}>
                    <ThemedInput
                        style={[styles.searchBar, { width: '100%', height: "auto", flexShrink: 0 }]}
                        placeholder="Search for boxes..."
                        placeholderTextColor={theme.textLight}
                        value={query}
                        onChangeText={setQuery}
                    />

                    <TouchableOpacity
                        style={styles.filterIcon}
                        onPress={() => {
                            Keyboard.dismiss();
                            setTempSortBy(sortBy);
                            setIsFilterVisible(true);
                            setTempShowFavoritesOnly(showFavoritesOnly);
                            setTempSelectedTypes(selectedTypes);
                            setTempSelectedStatuses(selectedStatuses);
                        }}
                    >
                        <Ionicons name="filter-circle" size={28} color={theme.textLight} />
                    </TouchableOpacity>

                </View>

                <Spacer height={20} />

                <ThemedCard style={styles.topBar}>
                    {/* LOGS BUTONU */}
                    <TouchableOpacity onPress={() => setShownCategory(true)}>
                        <ThemedText title={shownCategory === true}>Logs</ThemedText>
                    </TouchableOpacity>

                    <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                    {/* PLANS BUTONU */}
                    <TouchableOpacity onPress={() => setShownCategory(false)}>
                        <ThemedText title={shownCategory === false}>Plans</ThemedText>
                    </TouchableOpacity>
                </ThemedCard>

                <Spacer height={20} />

                <View style={styles.categoryHeaderWrapper}>
                    <ThemedText style={styles.boxCategoryText} title={true}>
                        {shownCategory ? " Select Log Boxes" : "Select Plan Boxes"}
                    </ThemedText>
                </View>

                <Spacer height={10} />

                <FlatList
                    data={results}
                    style={{ marginBottom: 40 }}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        // Bu satırdaki kutunun seçili olup olmadığını kontrol ediyoruz
                        const isSelected = selectedBoxIds.includes(item.id);

                        return (
                            // Artık detaya gitmek yerine seçme/bırakma işlemi yapıyor
                            <Pressable onPress={() => toggleBoxSelection(item.id)}>

                                {/* Checkbox ve Kartı yan yana dizmek için Row sarmalayıcı */}
                                <View style={styles.cardRowWrapper}>

                                    {/* SOLDAKİ CHECKBOX */}
                                    <TouchableOpacity onPress={() => toggleBoxSelection(item.id)} style={{ marginRight: 10 }}>
                                        <Ionicons
                                            name={isSelected ? "checkbox" : "square-outline"}
                                            size={26}
                                            color={theme.primary}
                                        />
                                    </TouchableOpacity>

                                    {/* SAĞDAKİ KART (Seçiliyse Opaklığı düşecek) */}
                                    <ThemedCard
                                        style={[
                                            styles.card,
                                            {
                                                borderLeftColor: theme.primary,
                                                opacity: isSelected ? 0.45 : 1 // SEÇİLİYSE SOLUKLAŞIR
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <ThemedText title={true}>{item.title}</ThemedText>
                                            <ThemedText>{item.type}</ThemedText>
                                        </View>

                                        <ThemedText>{item.description}</ThemedText>

                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <ThemedText>{item.date.split('T')[0]}</ThemedText>
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
                                                    color: item.status ? theme.primary : 'gray', 
                                                    marginLeft: 8, 
                                                    fontSize: 12,
                                                    fontWeight: item.status ? 'bold' : 'normal'
                                                }}>
                                                    {item.status ? "• ✅ Completed" : "• ⏳ Pending"}
                                                </ThemedText>
                                            )}
                                        </View>
                                    </ThemedCard>

                                </View>
                            </Pressable>
                        )
                    }}
                    ListEmptyComponent={
                        <ThemedText style={{ textAlign: 'center', marginTop: 30, color: 'gray' }}>
                            No available boxes found.
                        </ThemedText>
                    }
                />

                {(isFilterVisible) && (
                    <Pressable
                        style={styles.overlay}
                        onPress={() => {
                            // Boşluğa basılınca hangisi açıksa onu kapatır
                            setIsFilterVisible(false);
                        }}
                    />
                )}


                {/* ALTTAN ÇIKAN FİLTRE PANELİ */}
                {isFilterVisible && (
                    <ThemedView style={styles.bottomSheet}>

                        <View style={{ flex: 1 }}>

                            {/* Panelin Üst Kısmı (Başlık ve Çarpı Butonu) */}
                            <View style={styles.sheetHeader}>
                                <ThemedText title={true} style={{ fontSize: 20 }}>Filter Boxes</ThemedText>

                                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color={theme.textLight} />
                                </TouchableOpacity>
                            </View>



                            {/* AYIRICI ÇİZGİ */}
                            <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

                            <ThemedText title={true}>SORT BY</ThemedText>
                            <Spacer height={10} />

                            {/* İÇERİK KISMI (Buraya sonradan butonlar/seçenekler ekleyeceğiz) */}
                            <ThemedCard style={styles.sortBar}>
                                {/* Newest BUTONU */}
                                <TouchableOpacity onPress={() => setTempSortBy("new")}>
                                    <ThemedText title={tempSortBy == "new"}>Newest</ThemedText>
                                </TouchableOpacity>

                                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                                {/* Oldest BUTONU */}
                                <TouchableOpacity onPress={() => setTempSortBy("old")}>
                                    <ThemedText title={tempSortBy == "old"}>Oldest</ThemedText>
                                </TouchableOpacity>

                                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                                {/* A-Z BUTONU */}
                                <TouchableOpacity onPress={() => setTempSortBy("az")}>
                                    <ThemedText title={tempSortBy == "az"}>A-Z</ThemedText>
                                </TouchableOpacity>

                                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                                {/* Z-A BUTONU */}
                                <TouchableOpacity onPress={() => setTempSortBy("za")}>
                                    <ThemedText title={tempSortBy == "za"}>Z-A</ThemedText>
                                </TouchableOpacity>

                            </ThemedCard>
                        </View>

                        {/* --- TYPES CHECKBOX BÖLÜMÜ --- */}
                        <Spacer height={25} />
                        <ThemedText title={true}>TYPES</ThemedText>
                        <Spacer height={10} />

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingLeft: 5 }}>
                            {availableTypes.map((type, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' }} // width 45% ile yan yana iki kolon yapar
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

                        {/* --- FAVORİLER CHECKBOX BÖLÜMÜ --- */}
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

                        {!shownCategory && (
                            <>
                                <Spacer height={25} />
                                <ThemedText title={true}>PLAN STATUS</ThemedText>
                                <Spacer height={10} />
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingLeft: 5 }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' }}
                                        onPress={() => toggleTempStatus('completed')}
                                    >
                                        <Ionicons
                                            name={tempSelectedStatuses.includes('completed') ? "checkbox" : "square-outline"}
                                            size={24}
                                            color={theme.primary}
                                        />
                                        <ThemedText title={true} style={{ fontSize: 16 }}>Completed</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' }}
                                        onPress={() => toggleTempStatus('pending')}
                                    >
                                        <Ionicons
                                            name={tempSelectedStatuses.includes('pending') ? "checkbox" : "square-outline"}
                                            size={24}
                                            color={theme.primary}
                                        />
                                        <ThemedText title={true} style={{ fontSize: 16 }}>Pending</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}



                        {/* Bottom Action Row */}
                        <View style={styles.filterActionRow}>
                            <TouchableOpacity onPress={() => {
                                setIsFilterVisible(false)
                                setSortBy(tempSortBy);
                                setShowFavoritesOnly(tempShowFavoritesOnly);
                                setSelectedTypes(tempSelectedTypes);
                                setSelectedStatuses(tempSelectedStatuses);
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
                                    setTempSelectedStatuses([]);
                                }}
                            >
                                <ThemedText style={{ color: theme.text }}>Clear</ThemedText>
                            </TouchableOpacity>
                        </View>


                    </ThemedView>
                )}

            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default AddBoxesToChapter

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchWrapper: {
        width: "80%",
        marginBottom: 20,
        alignSelf: "center",
        marginTop: 30,
        justifyContent: "center",
    },
    searchBar: {
        paddingLeft: 20,
        paddingRight: 50,
        borderRadius: 25,

    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        width: 150,
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 20,
        borderRadius: 15,
        alignSelf: "center"
    },
    // Yeni eklenen sarmalayıcı (Tüm genişliği kaplar ve içeriği sola yaslar)
    categoryHeaderWrapper: {
        width: '90%', // Ekranın tamamını değil, biraz içerde kalması için %90
        alignSelf: 'center', // Yine de ortada durmasını istiyorsan bu kalabilir
        marginTop: 20,
    },
    boxCategoryText: {
        textAlign: 'left', // Yazıyı kendi kutusunun içinde sola yaslar
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    list: { paddingBottom: 20 },
    card: {
        width: "92%",
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 12,
        gap: 10,

        borderLeftWidth: 5,
        borderRadius: 8,
    },
    createCard: {
        position: 'absolute',
        bottom: 95,
        right: 50,
        width: 180,
        borderRadius: 15,
        paddingVertical: 5,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 12,
    },
    menuText: {
        fontSize: 18,
        fontWeight: '500',
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
    },
    verticalDivider: {
        width: StyleSheet.hairlineWidth, // Yatayda 1 piksel genişlik (dikey çizgi için)
        height: 18,                     // Yazıların yüksekliğiyle uyumlu olsun
    },
    // YENİ KARARTMA EFEKTİ (Blur yerine)
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // %40 saydam siyah
        zIndex: 998,
    },
    filterIcon: {
        position: 'absolute',
        right: 15,              // Sağdan hafif bir boşluk bırak
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: "auto", // Şimdilik sabit bir yükseklik, içerik arttıkça "auto" yapabilirsin
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 25,
        zIndex: 1000, // Karartmanın (998) ve + butonunun (999) üstünde durması için

        // Alttan çıkan panele derinlik (gölge) katmak için
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 }, // Gölgeyi yukarı doğru verir
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 20, // Android için yüksek gölge
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
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
        alignSelf: "center"
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
    cardRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 8,
    },
    card: {
        flex: 1, // Kalan tüm genişliği alıp checkbox'a yer açması için
        padding: 12,
        gap: 10,
        borderLeftWidth: 5,
        borderRadius: 8,
    },
    headerAddButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
    },
})