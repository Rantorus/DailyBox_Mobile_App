import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { dummyBoxes } from '../../fetchBox/dummyBoxes';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ThemedCard from '../../components/ThemedCard';

const BoxDetail = () => {
    const { id } = useLocalSearchParams();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const router = useRouter();


    const boxData = dummyBoxes.find((data) => {
        return data.id == id

    })

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
                                        boxDataId : boxData.id
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
                    <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Favori tıklandı")}>
                        {boxData.isFavorite ? (
                            <Ionicons name="star" size={24} color={theme.primary} /> // Favori rengi genelde altın/sarı olur
                        ) : (
                            <Ionicons name="star-outline" size={24} color={theme.border} />
                        )}
                    </TouchableOpacity>
                </View>

                <Spacer height={25} />
                <View style={styles.typeDateBar}>
                    <ThemedText>Type: {boxData.type}</ThemedText>
                    <ThemedText>Date: {boxData.date.split('T')[0]}</ThemedText>
                    <ThemedText>Category: {boxData.category}</ThemedText>
                </View>
                <Spacer height={25} />
                <ThemedText style={styles.descriptionText}>Description: {boxData.description}</ThemedText>
            </ThemedCard>


            {/* --- FAVORİLER CHECKBOX BÖLÜMÜ --- */}
            {boxData.category == "plan" && (
                <>
                    <Spacer height={25} />
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 5 }}
                    >
                        <Ionicons
                            name={"checkbox"}
                            size={24}
                            color={theme.primary}
                        />

                        <ThemedText style={{ fontSize: 16, textDecorationLine: 'line-through' }}>Completed</ThemedText>
                    </View>
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

            {boxData.hasNote && (
                <>
                    <Spacer height={20} />
                    <ThemedCard style={styles.noteCard}>
                        <Ionicons name="document-text" size={24} color={theme.primary} />

                        <View
                            style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                        />


                        <ThemedText style={{ alignSelf: "center" }} title={true}>Notes</ThemedText>
                    </ThemedCard>
                </>
            )}

            {boxData.hasTodos && (
                <>
                    <Spacer height={5} />
                    <ThemedCard style={styles.noteCard}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.primary} />

                        <View
                            style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                        />


                        <ThemedText style={{ alignSelf: "center" }} title={true}>Todos</ThemedText>
                        <ThemedText style={{ alignSelf: "center" }} title={true}>({boxData.todos.length} tasks)</ThemedText>

                    </ThemedCard>
                </>
            )}

            {boxData.hasLocation && (
                <>
                    <Spacer height={5} />
                    <ThemedCard style={styles.noteCard}>
                        <Ionicons name="location" size={24} color={theme.primary} />

                        <View
                            style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                        />


                        <ThemedText style={{ alignSelf: "center" }} title={true}>Location</ThemedText>

                    </ThemedCard>
                </>
            )}

            {boxData.hasMedia && (
                <>
                    <Spacer height={5} />
                    <ThemedCard style={styles.noteCard}>
                        <MaterialCommunityIcons name="paperclip" size={24} color={theme.primary} />

                        <View
                            style={[styles.featureDividerLine, { backgroundColor: theme.text, }]}
                        />


                        <ThemedText style={{ alignSelf: "center" }} title={true}>Media</ThemedText>

                    </ThemedCard>
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