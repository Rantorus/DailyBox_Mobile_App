import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedBtn from '../../components/ThemedBtn';
import ThemedCard from '../../components/ThemedCard';
import Spacer from '../../components/Spacer';
import { useRouter } from 'expo-router';

import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

// 1. TEMALARI TANIMLIYORUZ (İkonları ve ID'leriyle birlikte)
const THEME_OPTIONS = [
  { id: 'lightTheme', label: 'Light', icon: 'sunny' },
  { id: 'darkTheme', label: 'Dark', icon: 'moon' },
  { id: 'coffeeTheme', label: 'Coffee', icon: 'cafe' },
  { id: 'oceanTheme', label: 'Ocean', icon: 'water' },
  { id: 'forestTheme', label: 'Forest', icon: 'leaf' },
];

const ProfilePage = () => {
  const router = useRouter();
  
  // Aktif temayı öğren ve değiştirme fonksiyonunu al
  const { themeName, setThemeName } = useTheme();
  // Sayfanın genel renkleri için aktif temayı çek
  const activeTheme = Colors[themeName];

  return (
    <ThemedView safe={true} style={styles.container}>
      
      <View style={styles.content}>
        <ThemedText title={true} style={styles.headerText}>Profile</ThemedText>
        <Spacer height={20} />

        {/* --- TEMA SEÇİM KARTI --- */}
        <ThemedCard style={styles.themeCard}>
          <ThemedText style={styles.sectionTitle}>App Theme</ThemedText>
          <Spacer height={15} />

          <View style={styles.gridContainer}>
            {THEME_OPTIONS.map((item) => {
              const isSelected = themeName === item.id;
              // Sadece önizleme için o temanın kendi paletini çekiyoruz!
              const previewColor = Colors[item.id].primary; 
              const previewBg = Colors[item.id].background;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.themeButton,
                    { backgroundColor: previewBg },
                    isSelected && [styles.selectedThemeButton, { borderColor: previewColor }]
                  ]}
                  onPress={() => setThemeName(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: previewColor + '20' }]}>
                    <Ionicons 
                      name={isSelected ? item.icon : `${item.icon}-outline`} 
                      size={24} 
                      color={previewColor} 
                    />
                  </View>
                  <ThemedText style={[styles.themeLabel, isSelected && { fontWeight: 'bold' }]}>
                    {item.label}
                  </ThemedText>
                  
                  {/* Seçiliyse minik bir tik ikonu */}
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={previewColor} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedCard>
      </View>

      {/* --- ÇIKIŞ YAP BUTONU (En alta sabitlendi) --- */}
      <View style={styles.footer}>
        <ThemedBtn onPress={() => router.replace("/")} style={{ backgroundColor: '#EF4444' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <ThemedText style={{ color: "white", fontWeight: 'bold' }}>Logout</ThemedText>
          </View>
        </ThemedBtn>
      </View>

    </ThemedView>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 28,
  },
  themeCard: {
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.7,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeButton: {
    width: '48%', // Yan yana iki tane sığması için
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeButton: {
    // Sınır rengi yukarıdaki dinamik inline style'dan geliyor
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  themeLabel: {
    fontSize: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 30, // iPhone alt çentiği için güvenli alan
  }
});