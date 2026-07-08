import { StyleSheet, TouchableOpacity, ScrollView, View, TouchableWithoutFeedback, Keyboard, Pressable, FlatList, DeviceEventEmitter, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ThemedInput from '../../components/ThemedInput';
import ThemedCard from '../../components/ThemedCard';

import { Ionicons } from '@expo/vector-icons';

import { useBoxStore } from '../../store/boxStore';
import { useChapterStore } from '../../store/chapterStore';
import api from '../../services/api';

const EditChapterPage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();


    // selectedBoxesValues'den şu anlık bir şey gelmiyor ilerde veri göndermem gerekirse diye şimdilik dursun
    const { chapterDataId, selectedBoxesValues } = useLocalSearchParams();

    const chapters = useChapterStore((state) => state.chapters);
    const updateChapter = useChapterStore((state) => state.updateChapter);
    const deleteChapter = useChapterStore((state) => state.deleteChapter);
    const addBoxToChapter = useChapterStore((state) => state.addBoxToChapter);
    const removeBoxFromChapterStore = useChapterStore((state) => state.removeBoxFromChapter);
    const isLoading = useChapterStore((state) => state.isLoading);
    const boxes = useBoxStore((state) => state.boxes);

    const chapterData = chapters.find((data) => data.id === chapterDataId);

    const [title, setTitle] = useState(chapterData?.title || "");
    const [description, setDescription] = useState(chapterData?.description || "");
    const [type, setType] = useState(chapterData?.type || "");
    const [isTypesVisible, setIsTypesVisible] = useState(true);
    const [isFavorite, setIsFavorite] = useState(chapterData?.is_favorite || false);
    const [isAddedBoxesVisible, setIsAddedBoxesVisible] = useState(false);
    
    // Orijinal kutuları saklamak için state (Kaydederken tekrar eklememek için)
    const [originalBoxesState, setOriginalBoxesState] = useState([]);

    const [selectedBoxes, setSelectedBoxes] = useState(() => {
        // 1. Orijinal kutular (varsa)
        const initialBoxes = chapterData?.boxIds || [];

        // 2. Yeni seçilen kutular (URL'den geliyorsa) (aslında gerek yok ama şimdilik dursun)
        const added = selectedBoxesValues ? JSON.parse(selectedBoxesValues) : [];

        // 3. İkisini birleştir ve tekrar edenleri (Set ile) sil
        return [...new Set([...initialBoxes, ...added])];
    });

    // Component İçinde, State'lerin hemen altına şu useEffect'i ekle:
    useEffect(() => {
        // AddBoxesToChapter sayfasından fırlatılacak olan 'boxes_selected' olayını dinliyoruz
        const subscription = DeviceEventEmitter.addListener('boxes_selected', (newIds) => {

            // Önceki seçili kutuları (prevBoxes) alıp, yeni gelenlerle (newIds) birleştiriyoruz
            setSelectedBoxes((prevBoxes) => {
                // İki diziyi birleştir ve Set ile tekrar edenleri (duplicate) temizle
                return [...new Set([...prevBoxes, ...newIds])];
            });

        });

        // Sayfa kapatıldığında dinleyiciyi temizliyoruz (Memory leak önlemek için)
        return () => subscription.remove();
    }, []);

    // Edit yapıldığında mevcut kutuları backend'den çekip listeye ekler
    useEffect(() => {
        const fetchExistingBoxes = async () => {
            try {
                const response = await api.get(`/boxes/chapter/${chapterDataId}`);
                const boxesData = response.data.data || response.data || [];
                const boxIds = boxesData.map(b => b.id);
                
                // Hem orijinal listeye hem de seçili listeye ekle
                setOriginalBoxesState(boxIds);
                setSelectedBoxes((prev) => [...new Set([...prev, ...boxIds])]);
            } catch (err) {
                console.error("Failed to fetch chapter boxes in edit page:", err);
            }
        };

        if (chapterDataId) {
            fetchExistingBoxes();
        }
    }, [chapterDataId]);


    // Dinamik tip listesi çıkarma
    const availableTypes = useMemo(() => {
        const allTypes = chapters.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean);
    }, [chapters]);

    const selectedBoxResults = useMemo(() => {
        // selectedBoxes undefined veya length'i 0 ise boş dizi dön
        if (!selectedBoxes || !Array.isArray(selectedBoxes) || selectedBoxes.length === 0) {
            return [];
        }

        // Filtreleme yaparken yine de güvenli tarafta kalalım
        return boxes.filter((box) => selectedBoxes.includes(box.id));
    }, [selectedBoxes, boxes]);

    const [isDeleting, setIsDeleting] = useState(false);

    if (!chapterData) {
        return (
            <ThemedView safe={true} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    async function handleSave() {
        if (title.trim() && description.trim() && type.trim()) {
            const result = await updateChapter(chapterDataId, {
                title: title.trim(),
                description: description.trim(),
                type: type.trim(),
                isFavorite: isFavorite
            });

            if (result.success) {
                // Determine new boxes to add (Sadece sonradan eklenenleri backend'e gönder)
                const boxesToAdd = selectedBoxes.filter(id => !originalBoxesState.includes(id));
                
                for (const boxId of boxesToAdd) {
                    await addBoxToChapter(chapterDataId, boxId);
                }

                router.back();
            } else {
                Alert.alert("Error", result.error || "Failed to update the chapter.");
            }
        } else {
            Alert.alert("Missing Information", "Please fill in all fields.");
        }
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Chapter",
            "Are you sure you want to delete this chapter? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        const result = await deleteChapter(chapterDataId);
                        setIsDeleting(false);
                        
                        if (result.success) {
                            router.replace("/(dashboard)/ChaptersPage");
                        } else {
                            Alert.alert("Error", result.error || "Failed to delete the chapter.");
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveBox = async (boxIdToRemove) => {
        // Optimistic UI update
        setSelectedBoxes((prevBoxes) =>
            prevBoxes.filter(id => id !== boxIdToRemove)
        );
        
        // Remove from backend
        const result = await removeBoxFromChapterStore(chapterDataId, boxIdToRemove);
        if (!result.success) {
             Alert.alert("Error", result.error || "Failed to remove the box from the chapter.");
             // Revert UI if needed (optional)
        }
    };

    return (
        <View style={{ flex: 1 }}>

            {/* KLAVYE KAPATMA AKTİVİTESİ SADECE ANA FORM ALANINI KAPSAR */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ThemedView safe={true} style={styles.container}>
                    <StatusBar style={theme.statusBarStyle} />

                    <Modal
                        visible={isDeleting}
                        transparent={true}
                        animationType="fade"
                        statusBarTranslucent={true}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <ThemedText style={{ color: '#fff', marginTop: 12, fontWeight: 'bold', fontSize: 16 }}>Deleting...</ThemedText>
                        </View>
                    </Modal>

                    <Stack.Screen
                        options={{
                            headerRight: () => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleSave()}
                                    style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name={"checkmark-outline"} size={20} color={theme.primary} />
                                            <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 15 }}>
                                                Save
                                            </ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )
                        }}
                    />

                    <ThemedInput
                        style={{ width: "85%", marginBottom: 10 }}
                        placeholder="Title"
                        placeholderTextColor={theme.textLight}
                        onChangeText={setTitle}
                        value={title}
                    />

                    <ThemedInput
                        style={{ width: "85%", marginBottom: 10 }}
                        placeholder="Description"
                        placeholderTextColor={theme.textLight}
                        onChangeText={setDescription}
                        value={description}
                    />

                    {/* TYPE SEÇİM ALANI */}
                    <ThemedCard style={styles.cardContainer}>
                        <View style={styles.typeSection}>
                            <TouchableOpacity
                                style={styles.typeHeader}
                                activeOpacity={0.7}
                                onPress={() => setIsTypesVisible(!isTypesVisible)}
                            >
                                <ThemedText title={true}>Type: Select or Enter Custom </ThemedText>
                                <Ionicons
                                    name={isTypesVisible ? "chevron-down" : "chevron-forward"}
                                    size={20}
                                    color={theme.text}
                                    style={{ opacity: 0.6 }}
                                />
                            </TouchableOpacity>

                            {isTypesVisible && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 15, gap: 10, marginBottom: 10 }}
                                >
                                    {availableTypes.map((item, index) => {
                                        const isSelected = type === item;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => setType(item)}
                                                style={[
                                                    styles.chip,
                                                    { borderColor: theme.primary },
                                                    isSelected && { backgroundColor: theme.primary }
                                                ]}
                                            >
                                                <ThemedText style={{ color: isSelected ? "#fff" : theme.primary }}>
                                                    {item}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}

                            <ThemedInput
                                style={{ width: "90%", alignSelf: "center", marginBottom: 10 }}
                                placeholder="Enter a custom type..."
                                placeholderTextColor={theme.textLight}
                                onChangeText={setType}
                                value={type}
                            />
                        </View>
                    </ThemedCard>

                    {/* FAVORİ TİKİ */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setIsFavorite(!isFavorite)}
                        style={{ width: "85%", marginBottom: 25 }}
                    >
                        <ThemedCard style={styles.favoriteCard}>
                            <ThemedText style={{ fontSize: 16, fontWeight: "500" }}>
                                Mark as Favorite
                            </ThemedText>
                            <Ionicons
                                name={isFavorite ? "star" : "star-outline"}
                                size={24}
                                color={isFavorite ? theme.primary : theme.border}
                            />
                        </ThemedCard>
                    </TouchableOpacity>

                    {/* EKLENEN KUTULARI GÖSTERME BUTONU */}
                    {selectedBoxes.length > 0 && (
                        <>
                            <Spacer />
                            <TouchableOpacity
                                style={[styles.viewAddedBoxesButton, { backgroundColor: theme.primary + '15' }]}
                                onPress={() => setIsAddedBoxesVisible(true)}
                            >
                                <Ionicons name="list" size={24} color={theme.primary} />
                                <ThemedText style={{ color: theme.primary, fontWeight: "bold" }}>
                                    View Added Boxes ({selectedBoxes.length})
                                </ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* KUTU EKLEME SAYFASINA GEÇİŞ BUTONU */}
                    <TouchableOpacity
                        style={[styles.addsButton, { borderColor: theme.primary, marginBottom: 15 }]}
                        onPress={() => router.push("/chapter/AddBoxesToChapter")}
                    >
                        <Ionicons name="add-circle" size={24} color={theme.primary} />
                        <ThemedText style={{ color: theme.primary, fontWeight: "bold" }}>Add Box</ThemedText>
                    </TouchableOpacity>

                    {/* CHAPTER SİLME BUTONU */}
                    <TouchableOpacity
                        style={[styles.deleteChapterButton, { borderColor: '#FF3B30' }]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash" size={24} color="#FF3B30" />
                        <ThemedText style={{ color: '#FF3B30', fontWeight: "bold" }}>Delete Chapter</ThemedText>
                    </TouchableOpacity>

                    <Spacer height={40} />

                </ThemedView>
            </TouchableWithoutFeedback>

            {/* OVERLAY VE BOTTOM SHEET GESTURE ENGELLEMELERİNİ ÖNLEMEK İÇİN SARMALAYICININ DIŞINDA */}
            {isAddedBoxesVisible && (
                <Pressable
                    style={styles.overlay}
                    onPress={() => setIsAddedBoxesVisible(false)}
                />
            )}

            {isAddedBoxesVisible && (
                <ThemedView style={styles.bottomSheet}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.sheetHeader}>
                            <ThemedText title={true} style={{ fontSize: 20 }}>
                                Added Boxes ({selectedBoxes.length})
                            </ThemedText>
                            <TouchableOpacity onPress={() => setIsAddedBoxesVisible(false)}>
                                <Ionicons name="close-circle" size={30} color={theme.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 15 }]} />

                        <FlatList
                            data={selectedBoxResults}
                            keyExtractor={(item) => item.id}
                            style={{ marginBottom: 10 }}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <ThemedCard style={[styles.card, { borderLeftColor: theme.primary }]}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <ThemedText title={true}>{item.title}</ThemedText>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                                    </View>

                                    <ThemedText>{item.description}</ThemedText>

                                    {/* ALT SATIR: Tarih, Favori İkonu ve Silme Butonu */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                                        <ThemedText style={{ color: 'gray' }}>{item.date.split('T')[0]}</ThemedText>

                                        {item.is_favorite || item.isFavorite ? (
                                            <Ionicons name="star" size={18} color={theme.primary} />
                                        ) : (
                                            <Ionicons name="star-outline" size={18} color={theme.border} />
                                        )}

                                        {/* SİLME BUTONU */}
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            // hitSlop: Butonun tıklanabilir alanını ikonun dışına doğru görünmez şekilde genişletir.
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            onPress={() => handleRemoveBox(item.id)}
                                        >
                                            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </ThemedCard>
                            )}
                        />
                    </View>
                </ThemedView>
            )}

        </View>
    );
};

export default EditChapterPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    cardContainer: {
        width: "85%",
        borderRadius: 15,
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 0,
    },
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    typeSection: {
        width: "100%",
    },
    typeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginBottom: 15,
        marginTop: 5,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    favoriteCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 15
    },
    addsButton: {
        width: "85%",
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    viewAddedBoxesButton: {
        width: "85%",
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginBottom: 15
    },
    deleteChapterButton: {
        width: "85%",
        borderWidth: 1.5,
        borderStyle: "solid",
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 500,
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 998,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginBottom: 20
    },
    list: {
        paddingBottom: 20
    },
    card: {
        width: "100%",
        marginVertical: 8,
        padding: 15,
        borderLeftWidth: 5,
        borderRadius: 8,
        gap: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});