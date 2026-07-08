import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, TextInput, Alert, Modal, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Linking, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedInput from '../../components/ThemedInput'; 
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useMediaStore } from '../../store/mediaStore';
import { useBoxStore } from '../../store/boxStore';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

// ==========================================
// ALT BİLEŞEN: DÜZENLEME MODU KONUM KARTI
// ==========================================
const LocationCardEdit = ({ item, theme, onRemove }) => {
    // Tıklandığında telefonun kendi harita uygulamasında (navigasyon) açar
    const handleOpenInMaps = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${item.title}@${item.latitude},${item.longitude}`,
            android: `geo:0,0?q=${item.latitude},${item.longitude}(${item.title})`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Error", "Maps application cannot be opened on this device.");
            }
        });
    };

    return (
        <TouchableOpacity
            onPress={handleOpenInMaps}
            activeOpacity={0.7}
            style={[styles.locCard, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="location" size={24} color={theme.primary} />
            </View>
            <View style={styles.locInfo}>
                <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }} numberOfLines={1}>
                    {item.title}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.textLight }} numberOfLines={2}>
                    {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                </ThemedText>
            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)} style={{ padding: 10 }}>
                <Ionicons name="trash-outline" size={22} color="rgba(239, 68, 68, 0.9)" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// ==========================================
// ANA BİLEŞEN: EDIT LOCATION
// ==========================================
export default function EditLocation() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const router = useRouter();
    const { boxId } = useLocalSearchParams();
    const updateBox = useBoxStore(state => state.updateBox);
    const mapRef = useRef(null);

    // GLOBAL STORE (Yerel vitrin yok, her şey doğrudan ana depodan okunup yazılır)
    const locations = useMediaStore(state => state.locations);
    const addLocation = useMediaStore(state => state.addLocation);
    const removeLocation = useMediaStore(state => state.removeLocation);

    const [isMapVisible, setIsMapVisible] = useState(false);
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mapRegion, setMapRegion] = useState({
        latitude: 37.0016,
        longitude: 35.3289,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [markerCoords, setMarkerCoords] = useState(null);

    const [locationTitle, setLocationTitle] = useState('');
    const [resolvedAddress, setResolvedAddress] = useState('');

    // ==========================================
    // SİLME İŞLEMİ (ONAYLI VE GLOBAL)
    // ==========================================
    const handleRemove = (id) => {
        Alert.alert(
            "Delete Location",
            "Are you sure you want to delete this location?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeLocation(id) // Doğrudan globalden silinir, liste otomatik güncellenir
                }
            ]
        );
    };

    // ==========================================
    // HARİTA VE ARAMA İŞLEMLERİ
    // ==========================================
    const openMapPicker = async () => {
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'GPS permission is required to view your location on the map.');
                setIsLoading(false);
                return;
            }

            let currentLocation = await Location.getLastKnownPositionAsync({});
            if (!currentLocation) {
                currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            }

            const initialRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
            };

            setMapRegion(initialRegion);
            setMarkerCoords({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude
            });

            // Haritayı, izinler ve konum alındıktan SONRA render et (Android GL çökmesini önler)
            setIsMapVisible(true);

            setTimeout(() => {
                mapRef.current?.animateToRegion(initialRegion, 800);
            }, 500);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const searchLocation = async () => {
        if (!searchQuery.trim()) return;
        Keyboard.dismiss();
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
                { headers: { 'User-Agent': 'DailyBox/1.0 (React Native App)' } }
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Geocoding hatası:", error);
            Alert.alert("Error", "An error occurred while searching for the location.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSearchResult = (item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const newRegion = { latitude: lat, longitude: lon, latitudeDelta: 0.005, longitudeDelta: 0.005 };

        setMapRegion(newRegion);
        setMarkerCoords({ latitude: lat, longitude: lon });
        setSearchResults([]);

        mapRef.current?.animateToRegion(newRegion, 800);
    };

    const handleMapPress = (e) => {
        Keyboard.dismiss();
        setMarkerCoords(e.nativeEvent.coordinate);
    };

    const handleConfirmLocation = async () => {
        if (!markerCoords) {
            Alert.alert("Warning", "Please select a point on the map.");
            return;
        }

        setIsLoading(true);

        let suggestedTitle = `Location ${locations.length + 1}`;
        let fullAddress = "Açık adres bulunamadı";

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerCoords.latitude}&lon=${markerCoords.longitude}`,
                { headers: { 'User-Agent': 'DailyBox/1.0 (React Native App)' } }
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                suggestedTitle = addr.amenity || addr.shop || addr.building || addr.tourism || addr.road || addr.suburb || data.name || suggestedTitle;

                const district = addr.suburb || addr.town || addr.district || '';
                const city = addr.province || addr.city || '';
                const country = addr.country || '';
                fullAddress = [district, city, country].filter(Boolean).join(', ') || data.display_name;
            }
        } catch (error) {
            console.error("Adres çözümleme hatası:", error);
        }

        setResolvedAddress(fullAddress);
        setLocationTitle(suggestedTitle);

        setIsLoading(false);
        setShowTitleModal(true);
    };

    const finalizeLocationSave = () => {
        if (!locationTitle.trim()) {
            Alert.alert("Warning", "Please provide a title for the location.");
            return;
        }

        const newLocation = {
            id: Date.now().toString(),
            title: locationTitle.trim(),
            latitude: markerCoords.latitude,
            longitude: markerCoords.longitude,
            address: resolvedAddress,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };

        addLocation(newLocation); // Global depoya eklendiği an FlatList bunu hemen ekranda gösterir

        setShowTitleModal(false);
        setIsMapVisible(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* Header Sağ Üst "Save" Butonu */}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={async () => {
                                if (boxId) {
                                    setIsLoading(true);
                                    const locs = useMediaStore.getState().locations;
                                    const result = await updateBox(boxId, { locations: locs, hasLocation: locs.length > 0 });
                                    setIsLoading(false);
                                    
                                    if (!result.success) {
                                        Alert.alert("Error", result.error || "Failed to update locations.");
                                        return;
                                    }
                                }
                                router.back();
                            }}
                            style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
                        >
                            <Ionicons name="checkmark-outline" size={20} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 15 }}>
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />

            {/* ANA EKRAN İÇERİĞİ (TÜM KAYITLI KONUMLAR) */}
            <View style={styles.contentContainer}>
                {isLoading && !isMapVisible && <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 10 }} />}

                {locations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                            <Ionicons name="map-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                            <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                                No locations found.
                            </ThemedText>
                            <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                                Tap below to add a new location.
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${locations.length} location${locations.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        <FlatList
                            data={locations}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => <LocationCardEdit item={item} theme={theme} onRemove={handleRemove} />}
                        />
                    </View>
                )}
            </View>

            <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={openMapPicker}>
                    <Ionicons name="location-outline" size={20} color="#fff" />
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Add Location</ThemedText>
                </TouchableOpacity>
            </View>

            {/* HARİTA MODALI (Tam Ekran Mantığı Yok, Üzerine Binen Modal Mantığı Var) */}
            {isMapVisible && (
                <ThemedView style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <View style={{ flex: 1 }}>
                        <MapView
                            ref={mapRef}
                            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                            style={{ width: width, height: height }}
                            initialRegion={mapRegion}
                            onPress={handleMapPress}
                            onPanDrag={() => Keyboard.dismiss()} // Kaydırırken klavye kapanır
                        >
                            {markerCoords && (
                                <Marker coordinate={markerCoords} pinColor={theme.primary} />
                            )}
                        </MapView>

                        {/* --- OPAK SABİT RENKLİ ARAMA KUTUSU --- */}
                        <View style={styles.searchContainer}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    placeholder="Search location (e.g. Adana Park)..."
                                    placeholderTextColor="#8E8E93"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={searchLocation}
                                    style={styles.searchInputOverride}
                                />
                            </View>
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.primary }]} onPress={searchLocation}>
                                <Ionicons name="search" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* --- OPAK SABİT RENKLİ SONUÇ LİSTESİ --- */}
                        {searchResults.length > 0 && (
                            <View style={styles.resultsDropdownCard}>
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item, index) => index.toString()}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.resultItem}
                                            onPress={() => handleSelectSearchResult(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="location-sharp" size={16} color={theme.primary} style={{ marginRight: 8 }} />
                                            <ThemedText numberOfLines={2} style={{ fontSize: 13, flex: 1, color: '#FFFFFF' }}>
                                                {item.display_name}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}

                        {/* --- HARİTA ALT BUTONLARI (KAPAT VE ONAYLA) --- */}
                        <View style={styles.mapActions}>
                            <TouchableOpacity style={[styles.mapRoundButton, { backgroundColor: '#ef4444' }]} onPress={() => setIsMapVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.mapConfirmButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.8 : 1 }]}
                                onPress={handleConfirmLocation}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                )}
                                <ThemedText style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>
                                    {isLoading ? "Fetching..." : "Confirm Location"}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ThemedView>
            )}

            {/* KONUM İSİMLENDİRME MODALI */}
            <Modal visible={showTitleModal} animationType="slide" transparent={false}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ThemedView style={styles.modalOverlay} safe={true}>
                        <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                                Give this location a title
                            </ThemedText>

                            <ThemedInput
                                value={locationTitle}
                                onChangeText={setLocationTitle}
                                placeholder="e.g. Favorite Cafe, Gym, Home..."
                                autoFocus
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setShowTitleModal(false)} style={styles.modalCancelButton}>
                                    <ThemedText style={{ color: theme.textLight, fontWeight: 'bold' }}>Cancel</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={finalizeLocationSave} style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}>
                                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 15 },
    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    dashedBox: { borderWidth: 1.5, borderStyle: 'dashed', padding: 40, alignItems: 'center', borderRadius: 15, backgroundColor: 'transparent' },

    locCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    locInfo: { flex: 1, marginLeft: 12, marginRight: 5 },

    bottomBar: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderRadius: 15, gap: 8, justifyContent: 'center' },

    searchContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 25, // Çentik altı güvenli bölge
        left: 15,
        right: 15,
        zIndex: 9999,
        elevation: 25,
        padding: 6,
        borderRadius: 15,
        alignItems: 'center',
        backgroundColor: '#1A1A1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5
    },
    searchInputOverride: {
        borderWidth: 0,
        marginBottom: 0,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#FFFFFF',
        backgroundColor: 'transparent'
    },
    searchButton: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    
    resultsDropdownCard: {
        position: 'absolute',
        top: 90,
        left: 15,
        right: 15,
        zIndex: 10000,
        elevation: 26,
        borderRadius: 12,
        maxHeight: 200,
        overflow: 'hidden',
        backgroundColor: '#1A1A1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#2C2C2E'
    },

    mapActions: { position: 'absolute', bottom: 35, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 999, elevation: 15 },
    mapRoundButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
    mapConfirmButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 50, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },

    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    modalCard: { width: '100%', padding: 25, gap: 13, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalCancelButton: { paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
    modalSaveButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, justifyContent: 'center' }
});