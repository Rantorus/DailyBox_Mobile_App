import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useBoxStore } from '../../store/boxStore';
import { useMediaStore } from '../../store/mediaStore';
import { useTodoStore } from '../../store/todoStore';
import { ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ThemedCard from '../../components/ThemedCard';

const BoxDetail = () => {
    const { id } = useLocalSearchParams();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const router = useRouter();


    const boxes = useBoxStore((state) => state.boxes);
    const updateBox = useBoxStore((state) => state.updateBox);
    const boxData = boxes.find((data) => data.id === id);

    const todos = useTodoStore((state) => state.todos);
    const fetchBoxTodos = useTodoStore((state) => state.fetchBoxTodos);

    useEffect(() => {
        if (boxData) {
            fetchBoxTodos(boxData.id);
        }
    }, [boxData]);

    if (!boxData) {
        return (
            <ThemedView safe={true} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

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
                                    pathname: "/box/EditBoxPage",
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

            <ThemedCard style={{ borderRadius: 10, padding: 20 }}>
                <View>
                    <ThemedText style={{ fontSize: 18, alignSelf: "center", marginTop: 10, }} title={true}>{boxData.title}</ThemedText>

                </View>

                {/* Yıldız İkonu (Sağ üst köşeye sabitlendi) */}
                <View style={{ position: "absolute", top: 5, right: 5 }}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
                        {boxData.is_favorite || boxData.isFavorite ? (
                            <Ionicons name="star" size={24} color={theme.primary} /> // Favori rengi genelde altın/sarı olur
                        ) : (
                            <Ionicons name="star-outline" size={24} color={theme.border} />
                        )}
                    </TouchableOpacity>
                </View>

                <Spacer height={25} />
                <View style={styles.typeDateBar}>
                    <ThemedText>Type: {boxData.type}</ThemedText>

                    {/* 2026-06-18 -> 18-06-2026 dönüşümü */}
                    <ThemedText>
                        Date: {boxData.date ? boxData.date.split('T')[0].split('-').reverse().join('-') : ''}
                    </ThemedText>

                    <ThemedText>Category: {boxData.category}</ThemedText>
                </View>
                <Spacer height={25} />
                <ThemedText style={styles.descriptionText}>Description: {boxData.description}</ThemedText>
            </ThemedCard>


            {/* --- TAMAMLANDI CHECKBOX BÖLÜMÜ --- */}
            {boxData.category == "plan" && (
                <>
                    <Spacer height={25} />
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={async () => {
                            const isCompleted = boxData.status === true || boxData.status === 'true';
                            const newStatus = !isCompleted;
                            const result = await updateBox(boxData.id, { status: newStatus });
                            if (!result.success) {
                                alert("An error occurred while updating the completion status.");
                            }
                        }}
                    >
                        <ThemedCard style={[styles.noteCard, { paddingVertical: 12, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", borderRadius: 10 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                {(() => {
                                    const isCompleted = boxData.status === true || boxData.status === 'true';
                                    return (
                                        <>
                                            <View style={{
                                                backgroundColor: isCompleted ? theme.primary : 'transparent',
                                                borderRadius: 12,
                                                width: 24,
                                                height: 24,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderWidth: 2,
                                                borderColor: isCompleted ? theme.primary : theme.border
                                            }}>
                                                {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
                                            </View>
                                            <ThemedText style={{ 
                                                fontSize: 15, 
                                                fontWeight: isCompleted ? 'bold' : 'normal',
                                                textDecorationLine: isCompleted ? 'line-through' : 'none',
                                                color: isCompleted ? theme.primary : theme.text 
                                            }}>
                                                {isCompleted ? "Completed" : "Mark as completed"}
                                            </ThemedText>
                                        </>
                                    );
                                })()}
                            </View>
                        </ThemedCard>
                    </TouchableOpacity>
                </>
            )}

            <Spacer />
            <ThemedText style={{ paddingHorizontal: 10 }} title={true}>Features</ThemedText>


            <View
                style={[
                    styles.featuresDivider,
                    { backgroundColor: theme.text } // Rengi temadan alıyoruz
                ]}
            />

            {(boxData.has_note || boxData.hasNote) && (
                <>
                    <Spacer height={20} />
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`note/${boxData.id}`)}>
                        <ThemedCard style={styles.noteCard}>
                            <Ionicons name="document-text" size={24} color={theme.primary} />

                            <View
                                style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                            />


                            <ThemedText style={{ alignSelf: "center" }} title={true}>Notes</ThemedText>
                        </ThemedCard>
                    </TouchableOpacity>

                </>
            )}

            {(boxData.has_todos || boxData.hasTodos || todos.length > 0) && (
                <>
                    <Spacer height={5} />
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`todo/${boxData.id}`)}>
                        <ThemedCard style={styles.noteCard}>
                            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.primary} />

                            <View
                                style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                            />

                            <ThemedText style={{ alignSelf: "center" }} title={true}>Todos</ThemedText>
                            <ThemedText style={{ alignSelf: "center" }} title={true}>({todos.length} tasks)</ThemedText>

                        </ThemedCard>
                    </TouchableOpacity>

                </>
            )}

            {(boxData.has_location || boxData.hasLocation) && (
                <>
                    <Spacer height={5} />
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                        useMediaStore.getState().setLocations(boxData.locations || []);
                        router.push({
                            pathname: `location/ViewLocation`,
                            params: { boxId: boxData.id }
                        });
                    }}>
                        <ThemedCard style={styles.noteCard}>
                            <Ionicons name="location" size={24} color={theme.primary} />

                            <View
                                style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                            />


                            <ThemedText style={{ alignSelf: "center" }} title={true}>Location</ThemedText>

                        </ThemedCard>
                    </TouchableOpacity>
                </>
            )}

            {(boxData.has_media || boxData.hasMedia) && (
                <>
                    <Spacer height={5} />
                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                        useMediaStore.getState().setCurrentBoxId(boxData.id);
                        router.push(`/media/view/ViewPhoto?boxId=${boxData.id}`);
                    }}>
                        <ThemedCard style={styles.noteCard}>
                            <MaterialCommunityIcons name="paperclip" size={24} color={theme.primary} />

                            <View
                                style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                            />


                            <ThemedText style={{ alignSelf: "center" }} title={true}>Media</ThemedText>

                        </ThemedCard>
                    </TouchableOpacity>
                </>
            )}



        </ThemedView>
    );
};

export default BoxDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    typeDateBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
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
    }
});