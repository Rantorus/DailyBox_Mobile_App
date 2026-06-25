import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, TextInput, Alert, Modal, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Linking, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useMediaStore } from '../../store/mediaStore';

const { width, height } = Dimensions.get('window');

// ==========================================
// ALT BİLEŞEN: KAYDEDİLEN KONUM KARTI
// ==========================================
const LocationCard = ({ item, theme, onRemove }) => {
    const handleOpenInMaps = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${item.title}@${item.latitude},${item.longitude}`,
            android: `geo:0,0?q=${item.latitude},${item.longitude}(${item.title})`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Hata", "Bu cihazda harita uygulaması açılamıyor.");
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
// ANA BİLEŞEN: UPLOAD LOCATION
// ==========================================
export default function UploadLocation() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const addLocation = useMediaStore(state => state.addLocation);
    const removeLocation = useMediaStore(state => state.removeLocation);

    const [localLocations, setLocalLocations] = useState([]);
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

    const openMapPicker = async () => {
        // PERFORMANS: GPS'i beklemeden haritayı anında aç!
        setIsMapVisible(true);
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Haritada konumunuzu görebilmek için GPS izni vermelisiniz.');
                setIsLoading(false);
                return;
            }

            // PERFORMANS: Çok hızlı sonuç veren "getLastKnownPositionAsync" kullanıldı
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
        } catch (error) {
            console.error(error);
            // Hata olursa varsayılan koordinatta kalır, çökmez.
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
            console.error("Arama Hatası:", error);
            Alert.alert("Hata", "Konum aranırken bir sorun oluştu.");
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
    };

    const handleMapPress = (e) => {
        setMarkerCoords(e.nativeEvent.coordinate);
    };

    const handleConfirmLocation = () => {
        if (!markerCoords) {
            Alert.alert("Uyarı", "Lütfen haritadan bir nokta seçin.");
            return;
        }
        setLocationTitle('');
        setShowTitleModal(true);
    };

    const finalizeLocationSave = async () => {
        if (!locationTitle.trim()) {
            Alert.alert("Uyarı", "Lütfen konuma bir başlık verin.");
            return;
        }

        setShowTitleModal(false);
        setIsMapVisible(false);
        setIsLoading(true);

        let resolvedAddress = "Açık adres bulunamadı";
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerCoords.latitude}&lon=${markerCoords.longitude}`,
                { headers: { 'User-Agent': 'DailyBox/1.0 (React Native App)' } }
            );
            const data = await response.json();
            if (data && data.display_name) {
                const addr = data.address;
                const district = addr.suburb || addr.town || addr.district || '';
                const city = addr.province || addr.city || '';
                const country = addr.country || '';
                resolvedAddress = [district, city, country].filter(Boolean).join(', ');
            }
        } catch (error) {
            console.error("Adres çözümleme hatası:", error);
        }

        const newLocation = {
            id: Date.now().toString(),
            title: locationTitle.trim(),
            latitude: markerCoords.latitude,
            longitude: markerCoords.longitude,
            address: resolvedAddress,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };

        addLocation(newLocation); 
        setLocalLocations(prev => [...prev, newLocation]); 
        setSearchQuery('');
        setSearchResults([]);
        setIsLoading(false);
    };

    const handleRemoveLocal = (id) => {
        removeLocation(id);
        setLocalLocations(prev => prev.filter(loc => loc.id !== id));
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            <StatusBar style={theme.statusBarStyle} />

            {/* ANA EKRAN İÇERİĞİ */}
            <View style={styles.contentContainer}>
                {isLoading && !isMapVisible && <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 10 }} />}
                
                {localLocations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                            <Ionicons name="map-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                            <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                                No locations added yet.
                            </ThemedText>
                            <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                                Tap below to pick a location from the map.
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${localLocations.length} location${localLocations.length > 1 ? 's' : ''} added`}
                        </ThemedText>
                        <FlatList
                            data={localLocations}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => <LocationCard item={item} theme={theme} onRemove={handleRemoveLocal} />}
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

            {/* HARİTA EKRANI (Artık Safe Area destekli ThemedView kullanıyor) */}
            {isMapVisible && (
                <ThemedView style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <View style={{ flex: 1 }}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{ width: width, height: height }}
                            region={mapRegion}
                            onRegionChangeComplete={setMapRegion}
                            onPress={handleMapPress}
                        >
                            {markerCoords && (
                                <Marker coordinate={markerCoords} pinColor={theme.primary} />
                            )}
                        </MapView>

                        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search location (e.g. Adana Park)..."
                                placeholderTextColor={theme.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={searchLocation}
                            />
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.primary }]} onPress={searchLocation}>
                                <Ionicons name="search" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {searchResults.length > 0 && (
                            <View style={[styles.resultsDropdown, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.resultItem, { borderBottomColor: theme.border }]}
                                            onPress={() => handleSelectSearchResult(item)}
                                        >
                                            <Ionicons name="location-sharp" size={16} color={theme.primary} style={{ marginRight: 8 }} />
                                            <ThemedText numberOfLines={2} style={{ fontSize: 13, flex: 1 }}>{item.display_name}</ThemedText>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}

                        <View style={styles.mapActions}>
                            <TouchableOpacity style={[styles.mapRoundButton, { backgroundColor: '#ef4444' }]} onPress={() => setIsMapVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.mapConfirmButton, { backgroundColor: theme.primary }]} onPress={handleConfirmLocation}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <ThemedText style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>Confirm Location</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ThemedView>
            )}

            {/* KONUM İSİMLENDİRME MODALI (Artık Opak ve Safe Area destekli ThemedView kullanıyor) */}
            <Modal visible={showTitleModal} animationType="slide" transparent={false}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ThemedView style={styles.modalOverlay} safe={true}>
                        <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                                Give this location a title
                            </ThemedText>
                            
                            <TextInput
                                style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
                                value={locationTitle}
                                onChangeText={setLocationTitle}
                                placeholder="e.g. Favorite Cafe, Gym, Home..."
                                placeholderTextColor={theme.textLight}
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

    searchContainer: { flexDirection: 'row', position: 'absolute', top: 15, left: 15, right: 15, zIndex: 10, padding: 8, borderRadius: 15, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
    searchInput: { flex: 1, height: 44, paddingHorizontal: 12, fontSize: 14 },
    searchButton: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

    resultsDropdown: { position: 'absolute', top: 75, left: 15, right: 15, zIndex: 10, borderRadius: 12, borderWidth: 1, maxHeight: 200, overflow: 'hidden' },
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },

    mapActions: { position: 'absolute', bottom: 25, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mapRoundButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
    mapConfirmButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 50, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },

    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    modalCard: { width: '100%', padding: 25, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
    titleInput: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 25 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalCancelButton: { paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
    modalSaveButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, justifyContent: 'center' }
});