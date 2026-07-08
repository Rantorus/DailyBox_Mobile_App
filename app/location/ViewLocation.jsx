import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Alert, Linking, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useMediaStore } from '../../store/mediaStore';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

// ==========================================
// ALT BİLEŞEN: SADECE GÖRÜNTÜLEME KARTI
// ==========================================
const LocationCardReadOnly = ({ item, theme, onFocusMap }) => {

    const handleOpenInNativeMaps = () => {
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
            onPress={() => onFocusMap(item.latitude, item.longitude)}
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

            <TouchableOpacity onPress={handleOpenInNativeMaps} style={styles.navigateButton}>
                <Ionicons name="navigate-circle" size={28} color={theme.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// ==========================================
// ANA BİLEŞEN: VIEW LOCATION (READ-ONLY)
// ==========================================
export default function ViewLocation() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const router = useRouter();
    const { boxId } = useLocalSearchParams();

    const mapRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const locations = useMediaStore(state => state.locations) || [];

    const initialRegion = {
        latitude: locations.length > 0 ? locations[0].latitude : 37.0016,
        longitude: locations.length > 0 ? locations[0].longitude : 35.3289,
        latitudeDelta: locations.length > 0 ? 0.05 : 0.01,
        longitudeDelta: locations.length > 0 ? 0.05 : 0.01,
    };

    const fitAllMarkers = () => {
        if (locations.length > 1 && mapRef.current) {
            const coordinates = locations.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude
            }));
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 70, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    };

    useEffect(() => {
        if (locations.length > 0) {
            setTimeout(fitAllMarkers, 300);
        }
    }, [isFullScreen]);

    const focusMapToLocation = (lat, lon) => {
        if (isFullScreen) setIsFullScreen(false);

        setTimeout(() => {
            mapRef.current?.animateToRegion({
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 800);
        }, 100);
    };

    function handleSave() {
        router.back();
    }

    return (
        <ThemedView style={styles.container} safe={false}>
            <StatusBar style={theme.statusBarStyle} />

             {/* Ekranın üstündeki Box detail ve edit yazısı*/}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({
                                    pathname: "/location/EditLocation",
                                    params: { boxId: boxId }
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

            {locations.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.dashedBox, { borderColor: theme.primary }]}>
                        <Ionicons name="map-outline" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
                        <ThemedText style={{ color: theme.textLight, textAlign: 'center', marginBottom: 5 }}>
                            No locations found.
                        </ThemedText>
                        <ThemedText style={{ color: theme.text, textAlign: 'center', fontWeight: '500' }}>
                            You can add locations from the Edit screen.
                        </ThemedText>
                    </View>
                </View>
            ) : (
                <View style={styles.contentContainer}>

                    <View style={isFullScreen ? [styles.fullScreenMap, { backgroundColor: theme.background }] : [styles.mapContainer, { borderBottomColor: theme.border }]}>
                        <MapView
                            ref={mapRef}
                            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                            style={styles.map}
                            initialRegion={initialRegion}
                            onMapReady={fitAllMarkers}
                            zoomEnabled={true}
                            scrollEnabled={true}
                        >
                            {locations.map((loc) => (
                                <Marker
                                    key={loc.id}
                                    coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                                    title={loc.title}
                                    description={loc.address}
                                    pinColor={theme.primary}
                                />
                            ))}
                        </MapView>

                        {/* KATI KIRMIZI KAPATMA BUTONU (SAĞ ÜST) */}
                        {isFullScreen && (
                            <TouchableOpacity
                                style={[styles.closeFullScreenButton, { backgroundColor: '#EF4444' }]}
                                onPress={() => setIsFullScreen(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}

                        {/* KATI TEMA RENGİ TAM EKRAN BUTONU (SAĞ ÜST) */}
                        {!isFullScreen && (
                            <TouchableOpacity
                                style={[styles.expandMapButton, { backgroundColor: theme.primary }]}
                                onPress={() => setIsFullScreen(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="expand" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.listContainer}>
                        <ThemedText style={{ color: theme.textLight, fontSize: 13, marginBottom: 15, marginLeft: 5 }}>
                            {`${locations.length} saved location${locations.length > 1 ? 's' : ''}`}
                        </ThemedText>
                        <FlatList
                            data={locations}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <LocationCardReadOnly
                                    item={item}
                                    theme={theme}
                                    onFocusMap={focusMapToLocation}
                                />
                            )}
                        />
                    </View>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1 },

    emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
    dashedBox: { borderWidth: 1.5, borderStyle: 'dashed', padding: 40, alignItems: 'center', borderRadius: 15, backgroundColor: 'transparent' },

    mapContainer: {
        height: height * 0.40,
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        position: 'relative',
    },
    fullScreenMap: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        elevation: 10,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
    // --- GÜNCELLENEN BUTON KONUMLARI ---
    expandMapButton: {
        position: 'absolute',
        top: 15, // Haritanın sağ üstüne sabitlendi
        right: 15,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    closeFullScreenButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 25, // Tam ekranda da sağ üstte, notch altına hizalı
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },

    listContainer: {
        flex: 1,
        padding: 15,
    },
    locCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    locInfo: { flex: 1, marginLeft: 12, marginRight: 5 },
    navigateButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
});