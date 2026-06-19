import { StyleSheet, TouchableOpacity, ScrollView, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useMemo, useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

import { useLocalSearchParams } from 'expo-router';
import ThemedInput from '../../components/ThemedInput';
import ThemedCard from '../../components/ThemedCard';
import { Ionicons } from '@expo/vector-icons';

// 1. DUMMY BOXES IMPORTU (Kendi dosya yoluna göre kontrol et)
import { dummyBoxes } from '../../fetchBox/dummyBoxes'; 

const CreateBoxPage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [isTypesVisible, setIsTypesVisible] = useState(true);

    const { category, date } = useLocalSearchParams();

    // 2. USEMEMO İÇERİ ALINDI: Artık kurallara uygun ve dinamik çalışıyor
    const availableTypes = useMemo(() => {
        const allTypes = dummyBoxes.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean); // filter(Boolean) boş veya undefined olanları temizler
    }, []);

    return (
        // 3. KLAVYE GİZLEME DÜZELTİLDİ: Tüm sayfayı sarmaladık ki boşluğa basınca klavye kapansın
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView safe={true} style={styles.container}>
                <StatusBar style={theme.statusBarStyle} />
                
                <ThemedInput
                    style={{ width: "85%", marginBottom: 20, marginTop: 20 }}
                    placeholder="Title"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setTitle}
                    value={title}
                />
                
                <ThemedInput
                    style={{ width: "85%", marginBottom: 20 }}
                    placeholder="Description"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setDescription}
                    value={description}
                />

                <ThemedInput
                    style={{ width: "85%", marginBottom: 20 }}
                    placeholder="Date"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setDescription}
                    value={description}
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
                                contentContainerStyle={{ paddingHorizontal: 15, gap: 10, marginBottom: 15 }}
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

                <ThemedText title={true} style={{ fontSize: 20, marginTop: 30, opacity: 0.5 }}>
                    Creating: {category} | {date}
                </ThemedText>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default CreateBoxPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    cardContainer: {
        width: "85%", 
        borderRadius: 15, 
        paddingVertical: 10,
        paddingHorizontal: 0, // İçeriğin kenarlara tam yaslanması için sıfırladık
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
});