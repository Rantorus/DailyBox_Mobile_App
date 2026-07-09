import { StyleSheet, TouchableOpacity, ScrollView, View, TouchableWithoutFeedback, Keyboard, Pressable, FlatList, Dimensions } from 'react-native';
import React, { useMemo, useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import ThemedInput from '../../components/ThemedInput';
import ThemedCard from '../../components/ThemedCard';

import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useBoxStore } from '../../store/boxStore';
import { useMediaStore } from '../../store/mediaStore';
import { Alert, ActivityIndicator, Modal } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import api from '../../services/api';


const EditBoxPage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const { boxDataId } = useLocalSearchParams();

    const boxes = useBoxStore(state => state.boxes);
    const updateBox = useBoxStore(state => state.updateBox);
    const deleteBox = useBoxStore(state => state.deleteBox);
    const isLoading = useBoxStore(state => state.isLoading);

    const boxData = boxes.find((data) => data.id === boxDataId);

    const formatInitialDate = (val) => {
        if (!val) return '';
        let cleanDate = val.split('T')[0];
        if (cleanDate.includes('-') && cleanDate.split('-')[0].length === 4) {
            return cleanDate.split('-').reverse().join('.');
        }
        return cleanDate;
    };

    const [title, setTitle] = useState(boxData?.title || "");
    const [description, setDescription] = useState(boxData?.description || "");
    const [dateValue, setDateValue] = useState(boxData?.date ? formatInitialDate(boxData.date) : "");
    const [type, setType] = useState(boxData?.type || "");
    const [isTypesVisible, setIsTypesVisible] = useState(true);
    const [isFavorite, setIsFavorite] = useState(boxData?.is_favorite || boxData?.isFavorite || false);
    // UI stateleri (Features menüsü açık mı kapalı mı)
    const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [calendarCurrent, setCalendarCurrent] = useState(boxData?.date ? boxData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [calKey, setCalKey] = useState('cal-edit-initial');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
    const [isDeleting, setIsDeleting] = useState(false);

    const calScreenWidth = Dimensions.get('window').width * 0.85 - 40; // modal width minus padding

    const router = useRouter();

    // Veritabanındaki has_* bayraklarını ve içeriklerini kontrol ediyoruz
    const hasNote = boxData?.has_note || !!boxData?.note_content || !!boxData?.note_title;
    const hasLocation = boxData?.has_location || (Array.isArray(boxData?.locations) && boxData.locations.length > 0);
    const hasMedia = boxData?.has_media || 
                     (Array.isArray(boxData?.media_photos) && boxData.media_photos.length > 0) || 
                     (Array.isArray(boxData?.media_docs) && boxData.media_docs.length > 0) || 
                     (Array.isArray(boxData?.media_audio) && boxData.media_audio.length > 0);
                     
    // Todo tablosu ayrı olduğu için sayfaya her dönüldüğünde var mı diye kontrol et
    const [hasTodos, setHasTodos] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const checkTodos = async () => {
                try {
                    const response = await api.get(`/todos/box/${boxDataId}`);
                    const todos = response.data.data || response.data || [];
                    setHasTodos(todos.length > 0);
                } catch (err) {
                    console.log("Error fetching todos in EditBoxPage:", err);
                }
            };
            if (boxDataId) checkTodos();
        }, [boxDataId])
    );

    const handleDeleteFeature = async (featureType) => {
        let updatePayload = {};
        if (featureType === 'note') {
            updatePayload = { hasNote: false, noteTitle: null, noteContent: null };
        } else if (featureType === 'location') {
            updatePayload = { hasLocation: false, locations: [] };
        } else if (featureType === 'media') {
            updatePayload = { hasMedia: false, mediaPhotos: [], mediaDocs: [], mediaAudio: [] };
        } else if (featureType === 'todos') {
            try {
                const response = await api.get(`/todos/box/${boxDataId}`);
                const todos = response.data.data || response.data || [];
                await Promise.all(todos.map(todo => api.delete(`/todos/${todo.id}`)));
                setHasTodos(false);
                return; // Todos veritabanından silindi, boxes tablosunu güncellemeye gerek yok.
            } catch (err) {
                console.log("Error deleting todos in bulk:", err);
                Alert.alert("Error", "Failed to delete all todos from server.");
                return;
            }
        }

        const result = await updateBox(boxDataId, updatePayload);
        if (!result.success) {
            Alert.alert("Error", result.error || "Failed to delete feature.");
        }
    };

    // formatInputDate'i sildik çünkü text inputa dateValue'yu olduğu gibi veriyoruz

    // 2. USEMEMO İÇERİ ALINDI: Artık kurallara uygun ve dinamik çalışıyor
    const availableTypes = useMemo(() => {
        const allTypes = boxes.map(box => box.type);
        return [...new Set(allTypes)].filter(Boolean); // filter(Boolean) boş veya undefined olanları temizler
    }, [boxes]);

    if (!boxData) {
        return (
            <ThemedView safe={true} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    async function handleSave() {
        if (title.trim() && description.trim() && dateValue.trim() && type.trim()) {
            let parsedDate;
            try {
                let normalizedDate = dateValue.replace(/\./g, '-');
                if (normalizedDate.includes('-') && normalizedDate.split('-')[0].length !== 4) {
                     const parts = normalizedDate.split('-');
                     parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
                } else {
                     const parts = normalizedDate.split('-');
                     parsedDate = `${parts[0]}-${parts[1]}-${parts[2]}T12:00:00.000Z`;
                }
            } catch (e) {
                 Alert.alert("Invalid Date", "Please enter a valid date format (e.g., YYYY-MM-DD).");
                 return;
            }

            // Kategoriye göre tarih doğrulaması (Log = geçmiş/bugün, Plan = gelecek/bugün)
            const today = new Date();
            const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            const selectedDateString = parsedDate.split('T')[0];
            const currentCategory = boxData.category || "log";

            if (currentCategory === "log" && selectedDateString > todayString) {
                Alert.alert("Invalid Date", "Cannot enter a future date for a Log. Please create a Plan box or enter a past/today date.");
                return;
            } else if (currentCategory === "plan" && selectedDateString < todayString) {
                Alert.alert("Invalid Date", "Cannot enter a past date for a Plan. Please create a Log box or enter a future/today date.");
                return;
            }

            const updateData = {
                title: title.trim(),
                description: description.trim(),
                date: parsedDate,
                type: type.trim(),
                isFavorite: isFavorite,
            };

            const result = await updateBox(boxDataId, updateData);
            if (result.success) {
                // Zaten Box Details sayfasından buraya geldiğimiz için
                // sadece router.back() yapmamız bizi güncellenmiş Details sayfasına döndürür.
                router.back();
            } else {
                Alert.alert("Error", result.error || "Failed to update the box.");
            }
        }
        else {
            Alert.alert("Missing Information", "Please fill in all required fields.");
        }
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Box",
            "Are you sure you want to delete this box? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        const result = await deleteBox(boxDataId);
                        setIsDeleting(false);
                        if (result.success) {
                            router.replace("/(dashboard)/BoxesPage");
                        } else {
                            Alert.alert("Error", result.error || "Failed to delete the box.");
                        }
                    }
                }
            ]
        );
    };

    return (
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
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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

                <View style={{ width: "85%", alignSelf: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <ThemedInput
                        style={{ width: "100%", paddingRight: 40 }}
                        placeholder="Date (DD.MM.YYYY)"
                        placeholderTextColor={theme.textLight}
                        onChangeText={setDateValue}
                        value={dateValue}
                    />
                    <TouchableOpacity 
                        style={{ position: 'absolute', right: 15 }} 
                        onPress={() => setIsCalendarVisible(true)}
                    >
                        <Ionicons name="calendar-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>



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
                    <ThemedText title={true} style={{ color: theme.primary }}>Edit Features</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: '#FF3B30' }]}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash" size={24} color="#FF3B30" />
                    <ThemedText style={{ color: '#FF3B30', fontWeight: "bold" }}>Delete Box</ThemedText>
                </TouchableOpacity>

                {/* TAKVİM MODALI */}
                <Modal visible={isCalendarVisible} transparent={true} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.calendarPopup, { backgroundColor: theme.background }]}>

                            {showMonthPicker ? (
                                /* ===== AY/YIL SEÇİCİ (Month Picker) ===== */
                                <View style={{ height: 340 }}>
                                    <FlatList
                                        data={Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i)}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        initialScrollIndex={(() => {
                                            const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);
                                            const idx = years.indexOf(pickerYear);
                                            return idx === -1 ? 10 : idx;
                                        })()}
                                        getItemLayout={(data, index) => ({ length: calScreenWidth, offset: calScreenWidth * index, index })}
                                        keyExtractor={item => item.toString()}
                                        renderItem={({ item: yearItem }) => (
                                            <View style={{ width: calScreenWidth, paddingTop: 5 }}>
                                                <ThemedText style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
                                                    {yearItem}
                                                </ThemedText>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, index) => (
                                                        <TouchableOpacity
                                                            key={m}
                                                            style={{
                                                                width: '30%',
                                                                paddingVertical: 14,
                                                                alignItems: 'center',
                                                                backgroundColor: theme.primary + '15',
                                                                borderRadius: 12,
                                                                marginBottom: 10,
                                                            }}
                                                            onPress={() => {
                                                                const newMonthStr = (index + 1).toString().padStart(2, '0');
                                                                const newDate = `${yearItem}-${newMonthStr}-01`;
                                                                setCalendarCurrent(newDate);
                                                                setCalKey(`cal-${newDate}`);
                                                                setShowMonthPicker(false);
                                                            }}
                                                        >
                                                            <ThemedText style={{ fontWeight: 'bold', color: theme.primary, fontSize: 15 }}>{m}</ThemedText>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    />
                                </View>
                            ) : (
                                /* ===== TAKVİM LİSTESİ (CalendarList) ===== */
                                <CalendarList
                                    key={`${calKey}-${themeName}`}
                                    current={calendarCurrent}
                                    onDayPress={(day) => {
                                        setDateValue(day.dateString.split('-').reverse().join('.')); // DD.MM.YYYY
                                        setIsCalendarVisible(false);
                                        setShowMonthPicker(false);
                                    }}
                                    firstDay={1}
                                    renderHeader={(date) => {
                                        const y = typeof date.getFullYear === 'function' ? date.getFullYear() : date.year;
                                        const mIndex = typeof date.getMonth === 'function' ? date.getMonth() : (date.month - 1);
                                        const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                        const mName = monthsEn[mIndex];
                                        return (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setPickerYear(y || new Date().getFullYear());
                                                    setShowMonthPicker(true);
                                                }}
                                                style={{ padding: 8 }}
                                            >
                                                <ThemedText style={{ fontSize: 17, fontWeight: 'bold' }}>
                                                    {mName} {y}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    horizontal={true}
                                    pagingEnabled={true}
                                    calendarWidth={calScreenWidth}
                                    pastScrollRange={24}
                                    futureScrollRange={24}
                                    markedDates={{
                                        [new Date().toISOString().split('T')[0]]: {
                                            selected: true,
                                            selectedColor: theme.primary + '40',
                                            selectedTextColor: theme.text,
                                        }
                                    }}
                                    theme={{
                                        calendarBackground: theme.background,
                                        textSectionTitleColor: theme.textLight,
                                        dayTextColor: theme.text,
                                        todayTextColor: theme.primary,
                                        textDisabledColor: theme.textLight ? `${theme.textLight}50` : '#d9e1e8',
                                        textDayFontSize: 14,
                                        textDayHeaderFontSize: 14,
                                    }}
                                    style={{ height: 340 }}
                                />
                            )}

                            <TouchableOpacity
                                style={[styles.closeCalendarBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    setIsCalendarVisible(false);
                                    setShowMonthPicker(false);
                                }}
                            >
                                <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>Close</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Spacer height={40} />

                {/* ALTTAN ÇIKAN Features PANELİ */}
                {isFeaturesVisible && (
                    <ThemedView style={styles.bottomSheet}>
                        <View style={{ flex: 1 }}>

                            {/* Panelin Üst Kısmı (Başlık ve Çarpı Butonu) */}
                            <View style={styles.sheetHeader}>
                                <ThemedText title={true} style={{ fontSize: 20 }}>Edit Features</ThemedText>

                                <TouchableOpacity onPress={() => setIsFeaturesVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color={theme.textLight} />
                                </TouchableOpacity>
                            </View>

                            {/* AYIRICI ÇİZGİ */}
                            <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50' }]} />

                            { (hasNote || hasTodos || hasLocation || hasMedia) && (
                                <ThemedText title={true}>Added Features</ThemedText>
                            )}

                            {/* --- NOTES --- */}
                            {hasNote && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push({ pathname: '/note/EditNotePage', params: { boxDataId: boxDataId } })}>
                                        <ThemedCard style={styles.noteCard}>
                                            <Ionicons name="document-text" size={24} color={theme.primary} />
                                            <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                            <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                                Added Notes
                                            </ThemedText>
                                            <Ionicons onPress={() => handleDeleteFeature('note')} name="trash-outline" size={24} color="#EF4444" style={{ marginLeft: "auto" }} />
                                        </ThemedCard>
                                    </TouchableOpacity>
                                    <Spacer height={5} />
                                </>
                            )}

                            {/* --- TODOS --- */}
                            {hasTodos && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push({ pathname: '/todo/[id]', params: { id: boxDataId } })}>
                                        <ThemedCard style={styles.noteCard}>
                                            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.primary} />
                                            <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                            <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                                Added Todos
                                            </ThemedText>
                                            <Ionicons onPress={() => handleDeleteFeature('todos')} name="trash-outline" size={24} color="#EF4444" style={{ marginLeft: "auto" }} />
                                        </ThemedCard>
                                    </TouchableOpacity>
                                    <Spacer height={5} />
                                </>
                            )}

                            {/* --- LOCATION --- */}
                            {hasLocation && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                                        useMediaStore.getState().setLocations(boxData.locations || []);
                                        router.push({ pathname: '/location/EditLocation', params: { boxId: boxDataId } });
                                    }}>
                                        <ThemedCard style={styles.noteCard}>
                                            <Ionicons name="location" size={24} color={theme.primary} />
                                            <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                            <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                                Added Location
                                            </ThemedText>
                                            <Ionicons onPress={() => handleDeleteFeature('location')} name="trash-outline" size={24} color="#EF4444" style={{ marginLeft: "auto" }} />
                                        </ThemedCard>
                                    </TouchableOpacity>
                                    <Spacer height={5} />
                                </>
                            )}

                            {/* --- MEDIA --- */}
                            {hasMedia && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/media/edit/EditPhoto?boxId=${boxDataId}`)}>
                                        <ThemedCard style={styles.noteCard}>
                                            <MaterialCommunityIcons name="paperclip" size={24} color={theme.primary} />
                                            <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                            <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                                Added Media
                                            </ThemedText>
                                            <Ionicons onPress={() => handleDeleteFeature('media')} name="trash-outline" size={24} color="#EF4444" style={{ marginLeft: "auto" }} />
                                        </ThemedCard>
                                    </TouchableOpacity>
                                    <Spacer height={5} />
                                </>
                            )}

                            {(hasNote || hasTodos || hasLocation || hasMedia) && !(hasNote && hasTodos && hasLocation && hasMedia) && (
                                <>
                                    <Spacer height={15} />
                                    <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50' }]} />
                                </>
                            )}

                            {!(hasNote && hasTodos && hasLocation && hasMedia) && (
                                <ThemedText title={true}>Available Features</ThemedText>
                            )}

                            {/* --- NOTES --- */}
                            {!hasNote && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => { router.push({ pathname: '/note/CreateNotePage', params: { boxId: boxDataId } }); }}>
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
                                </>
                            )}

                            {/* --- TODOS --- */}
                            {!hasTodos && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => { router.push({ pathname: '/todo/[id]', params: { id: boxDataId } }); }}>
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
                                </>
                            )}

                            {/* --- LOCATION --- */}
                            {!hasLocation && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => {
                                        useMediaStore.getState().setLocations(boxData.locations || []);
                                        router.push({ pathname: '/location/UploadLocation', params: { boxId: boxDataId } });
                                    }}>
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
                                </>
                            )}

                            {/* --- MEDIA --- */}
                            {!hasMedia && (
                                <>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => { router.push(`/media/create/UploadPhoto?boxId=${boxDataId}`); }}>
                                        <ThemedCard style={styles.noteCard}>
                                            <MaterialCommunityIcons name="paperclip" size={24} color={theme.primary} />
                                            <View style={[styles.featureDividerLine, { backgroundColor: theme.text }]} />
                                            <ThemedText style={{ alignSelf: "center", fontSize: 16 }} title={true}>
                                                Attach Media
                                            </ThemedText>
                                            <Ionicons name="add" size={24} color={theme.primary} style={{ marginLeft: "auto" }} />
                                        </ThemedCard>
                                    </TouchableOpacity>
                                    <Spacer height={5} />
                                </>
                            )}



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
    deleteButton: {
        width: "85%",
        borderWidth: 1.5,
        borderStyle: "solid",
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 15,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarPopup: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    closeCalendarBtn: {
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 15,
    }
});