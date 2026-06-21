import { StyleSheet, TouchableOpacity, ScrollView, View, TouchableWithoutFeedback, Keyboard, Pressable } from 'react-native';
import React, { useMemo, useState } from 'react';
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { dummyBoxes } from '../../fetchBox/dummyBoxes';



const EditBoxPage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const { boxDataId } = useLocalSearchParams();

    const boxData = dummyBoxes.find((data) => {
            return data.id == boxDataId
    
        })

    const [title, setTitle] = useState(boxData.title);
    const [description, setDescription] = useState(boxData.description);
    const [dateValue, setDateValue] = useState(boxData.date.split('T')[0]);
    const [type, setType] = useState(boxData.type);
    const [isTypesVisible, setIsTypesVisible] = useState(true);
    const [isFavorite, setIsFavorite] = useState(boxData.isFavorite);
    const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);

    const router = useRouter();

    

    // 2. USEMEMO İÇERİ ALINDI: Artık kurallara uygun ve dinamik çalışıyor
    const availableTypes = useMemo(() => {
        const allTypes = dummyBoxes.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean); // filter(Boolean) boş veya undefined olanları temizler
    }, []);

    function handleSave() {
        
    }

    return (
        // 3. KLAVYE GİZLEME DÜZELTİLDİ: Tüm sayfayı sarmaladık ki boşluğa basınca klavye kapansın
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView safe={true} style={styles.container}>
                <StatusBar style={theme.statusBarStyle} />

                {/* Ekranın üstündeki Box detail ve edit yazısı*/}
                <Stack.Screen
                    options={{

                        headerRight: () => (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    handleSave();
                                }}
                                style={[styles.editButton, {
                                    backgroundColor: theme.primary + '20',
                                }]}

                            >
                                <Ionicons
                                    name={"checkmark-outline"}
                                    size={20} // Kutu içine girdiği için 22 yerine 18 daha zarif durur
                                    color={theme.primary}
                                />
                                <ThemedText style={{
                                    color: theme.primary, // Yazı rengini de butonla uyumlu hale getirdik
                                    fontWeight: "bold",
                                    fontSize: 15
                                }}>
                                    Save
                                </ThemedText>
                            </TouchableOpacity>
                        )
                    }}
                />

                <ThemedInput
                    style={{ width: "85%", marginBottom: 10, }}
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

                <ThemedInput
                    style={
                        { width: "85%", marginBottom: 10 }
                    }
                    placeholder="Date"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setDateValue}
                    value={dateValue}
                />



                {/* --- TYPE SEÇİM ALANI --- */}
                <ThemedCard style={styles.cardContainer}>
                    <View style={styles.typeSection}>

                        {/* Tıklanabilir Başlık ve Ok İkonu */}
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

                        {/* Çipler */}
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



                        {/* Kullanıcının Özgürce Yazabileceği Input */}
                        <ThemedInput
                            style={{ width: "90%", alignSelf: "center", marginBottom: 10 }}
                            placeholder="Enter a custom type..."
                            placeholderTextColor={theme.textLight}
                            onChangeText={setType}
                            value={type}
                        />
                    </View>


                </ThemedCard>

                {/* --- FAVORİ TİKİ (MİNİ KART) --- */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsFavorite(!isFavorite)}
                    style={{ width: "85%", marginBottom: 15 }}
                >
                    <ThemedCard style={styles.favoriteCard}>
                        <ThemedText style={{ fontSize: 16, fontWeight: "500" }}>
                            Mark as Favorite
                        </ThemedText>
                        <Ionicons
                            name={isFavorite ? "star" : "star-outline"}
                            size={24}
                            color={isFavorite ? theme.primary : theme.border} // Seçiliyse sarı/altın rengi olur
                        />
                    </ThemedCard>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.featuresButton, {
                        borderColor: theme.primary,
                    }]}
                    onPress={() => setIsFeaturesVisible(true)}
                >
                    <Ionicons name="add-circle" size={24} color={theme.primary} />
                    <ThemedText style={{ color: theme.primary, fontWeight: "bold" }}>Add Features</ThemedText>
                </TouchableOpacity>

                {/* ALTTAN ÇIKAN Features PANELİ */}
                {isFeaturesVisible && (
                    <ThemedView style={styles.bottomSheet}>
                        <View style={{ flex: 1 }}>

                            {/* Panelin Üst Kısmı (Başlık ve Çarpı Butonu) */}
                            <View style={styles.sheetHeader}>
                                <ThemedText title={true} style={{ fontSize: 20 }}>Add Features</ThemedText>

                                <TouchableOpacity onPress={() => setIsFeaturesVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color={theme.textLight} />
                                </TouchableOpacity>
                            </View>

                            {/* AYIRICI ÇİZGİ */}
                            <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50' }]} />

                            {/* --- NOTES --- */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Add Note")}>
                                <ThemedCard style={styles.noteCard}>
                                    <Ionicons name="document-text" size={24} color={theme.primary} />
                                    <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                    <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                        Add a Note
                                    </ThemedText>
                                    <Ionicons name="add" size={24} color={theme.primary} style={{ marginLeft: "auto" }} />
                                </ThemedCard>
                            </TouchableOpacity>

                            <Spacer height={5} />

                            {/* --- TODOS --- */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Add Checklist")}>
                                <ThemedCard style={styles.noteCard}>
                                    <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.primary} />
                                    <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                    <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                        Add a Todo
                                    </ThemedText>
                                    <Ionicons name="add" size={24} color={theme.primary} style={{ marginLeft: "auto" }} />
                                </ThemedCard>
                            </TouchableOpacity>

                            <Spacer height={5} />

                            {/* --- LOCATION --- */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Add Location")}>
                                <ThemedCard style={styles.noteCard}>
                                    <Ionicons name="location" size={24} color={theme.primary} />
                                    <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                    <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                        Add Location
                                    </ThemedText>
                                    <Ionicons name="add" size={24} color={theme.primary} style={{ marginLeft: "auto" }} />
                                </ThemedCard>
                            </TouchableOpacity>

                            <Spacer height={5} />

                            {/* --- MEDIA --- */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Add Media")}>
                                <ThemedCard style={styles.noteCard}>
                                    <MaterialCommunityIcons name="paperclip" size={24} color={theme.primary} />
                                    <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                    <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                        Attach Media
                                    </ThemedText>
                                    <Ionicons name="add" size={24} color={theme.primary} style={{ marginLeft: "auto" }} />
                                </ThemedCard>
                            </TouchableOpacity>

                            {/* En alta biraz boşluk bırakalım ki çok sıkışık durmasın */}
                            <Spacer height={20} />

                        </View>
                    </ThemedView>
                )}

                {/* Boşluğa basılınca panelin gitmesi*/}
                {isFeaturesVisible && (
                    <Pressable
                        style={styles.overlay}
                        onPress={() => {
                            // Boşluğa basılınca hangisi açıksa onu kapatır
                            setIsFeaturesVisible(false);
                        }}
                    />
                )}


            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default EditBoxPage;

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
        paddingHorizontal: 0, // İçeriğin kenarlara tam yaslanması için sıfırladık
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
    featuresButton: {
        width: "85%",
        borderWidth: 1.5,
        borderStyle: "dashed", // Kesik çizgili kenarlık harika bir "Buraya ekle" hissi verir
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 20
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // %40 saydam siyah
        zIndex: 998,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
        marginHorizontal: 0,
        marginBottom: 20
    },
    featureOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        gap: 15,
    },
    featureIconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    noteCard: {
        flexDirection: "row",
        gap: 20,
        width: "85%",
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
});