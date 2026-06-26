import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

import { dummyBoxes } from '../../fetchBox/dummyBoxes';
import { dummyChapters } from "../../fetchChapters/dummyChapters";

// Global Store'lar
import { useMediaStore } from '../../store/mediaStore';
import { useUserStore } from '../../store/useStore'; // USER STORE EKLENDİ

import * as LocalAuthentication from 'expo-local-authentication';

const THEME_OPTIONS = [
  { id: 'darkTheme', label: 'Dark Mode', icon: 'moon' },
  { id: 'lightTheme', label: 'Light Mode', icon: 'sunny' },
  { id: 'oceanTheme', label: 'Deep Ocean', icon: 'water' },
  { id: 'forestTheme', label: 'Forest Green', icon: 'leaf' },
  { id: 'coffeeTheme', label: 'Coffee', icon: 'cafe' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { themeName, setThemeName } = useTheme();
  const theme = Colors[themeName];

  // ==========================================
  // ZUSTAND GLOBAL STORE BAĞLANTILARI
  // ==========================================
  const activeUser = useUserStore((state) => state.activeUser);
  const logoutUser = useUserStore((state) => state.logoutUser);

  // Store'dan çek
  const isBiometricEnabled = useUserStore(state => state.isBiometricEnabled);
  const setBiometricEnabled = useUserStore(state => state.setBiometricEnabled);

  // ==========================================
  // DİNAMİK VERİ HESAPLAMALARI
  // ==========================================
  // 1. Kullanıcı Bilgileri (Store'dan çekiliyor)
  const activeUserName = activeUser?.name || activeUser?.fullName || "Bilinmeyen Kullanıcı";
  const activeUserEmail = activeUser?.email || "E-posta bulunamadı";

  // 2. Kutu ve Bölüm Sayıları
  const boxesCount = dummyBoxes?.length || 0;
  const chaptersCount = dummyChapters?.length || 0;

  // 3. Kutu Tiplerine Göre Filtreleme
  const logsCount = dummyBoxes?.filter(box => box.category === 'log').length || 0;
  const plansCount = dummyBoxes?.filter(box => box.category === 'plan').length || 0;

  // Toggle fonksiyonu
  const handleBiometricToggle = async () => {
    if (!isBiometricEnabled) {
      // Açmadan önce cihazın destekleyip desteklemediğini kontrol et
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert(
          'Desteklenmiyor',
          'Cihazınızda kayıtlı parmak izi veya Face ID bulunamadı.'
        );
        return;
      }

      // Açmak için bir kere doğrulat
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Kimliğinizi doğrulayın',
        cancelLabel: 'İptal',
      });

      if (result.success) {
        setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  // ==========================================
  // YARDIMCI BİLEŞENLER
  // ==========================================
  const SectionTitle = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={theme.primary} style={{ marginRight: 8 }} />
      <ThemedText style={[styles.sectionTitleText, { color: theme.textLight }]}>
        {title}
      </ThemedText>
    </View>
  );

  const SettingItem = ({ icon, label, rightIcon, rightText, disabled }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && { opacity: 0.4 }]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={theme.text} style={{ marginRight: 12 }} />
        <ThemedText style={{ fontSize: 15 }}>{label}</ThemedText>
      </View>
      <View style={styles.settingRight}>
        {rightText && <ThemedText style={{ color: theme.textLight, fontSize: 13, marginRight: 5 }}>{rightText}</ThemedText>}
        {rightIcon && <Ionicons name={rightIcon} size={18} color={theme.primary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- 1. PROFİL BAŞLIĞI (DİNAMİK) --- */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarBox, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <Ionicons name="person" size={40} color={theme.textLight} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>{activeUserName}</ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.textLight, marginTop: 4 }}>{activeUserEmail}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* --- 2. YOUR DIGITAL FOOTPRINT --- */}
        <SectionTitle title="YOUR DIGITAL FOOTPRINT" icon="stats-chart" />
        <View style={[styles.footprintGrid, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>

          <View style={styles.footprintRow}>
            <View style={styles.footprintItem}>
              <Ionicons name="cube" size={18} color="#D97757" />
              <ThemedText style={styles.footprintText}>
                <ThemedText style={{ fontWeight: 'bold' }}>{boxesCount}</ThemedText> Boxes
              </ThemedText>
            </View>
            <View style={styles.footprintItem}>
              <Ionicons name="book" size={18} color="#4ADE80" />
              <ThemedText style={styles.footprintText}>
                <ThemedText style={{ fontWeight: 'bold' }}>{chaptersCount}</ThemedText> Chapters
              </ThemedText>
            </View>
          </View>

          <View style={styles.footprintRow}>
            <View style={styles.footprintItem}>
              <Ionicons name="document-text" size={18} color="#60A5FA" />
              <ThemedText style={styles.footprintText}>
                <ThemedText style={{ fontWeight: 'bold' }}>{logsCount}</ThemedText> Logs
              </ThemedText>
            </View>
            <View style={styles.footprintItem}>
              <Ionicons name="calendar" size={18} color="#F472B6" />
              <ThemedText style={styles.footprintText}>
                <ThemedText style={{ fontWeight: 'bold' }}>{plansCount}</ThemedText> Plans
              </ThemedText>
            </View>
          </View>

        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* --- 3. ACCOUNT & SECURITY --- */}
        <SectionTitle title="ACCOUNT & SECURITY" icon="shield-half" />
        <View style={{ marginBottom: 20 }}>
          <SettingItem icon="key" label="Change Password" rightIcon="chevron-forward" disabled={true} />
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleBiometricToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="scan" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <ThemedText style={{ fontSize: 15 }}>App Lock (FaceID / TouchID)</ThemedText>
            </View>
            <View style={styles.settingRight}>
              <ThemedText style={{
                color: isBiometricEnabled ? theme.primary : theme.textLight,
                fontSize: 13, marginRight: 5, fontWeight: 'bold'
              }}>
                {isBiometricEnabled ? 'ON' : 'OFF'}
              </ThemedText>
              <Ionicons
                name={isBiometricEnabled ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isBiometricEnabled ? theme.primary : theme.textLight}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* --- 4. APPEARANCE (TEMA) --- */}
        <SectionTitle title="APPEARANCE" icon="color-palette" />
        <View style={{ marginBottom: 20 }}>
          {THEME_OPTIONS.map((item) => {
            const itemTheme = Colors[item.id];
            const isSelected = themeName === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.themeOptionBtn,
                  isSelected && { backgroundColor: itemTheme.primary + '15', borderColor: itemTheme.primary }
                ]}
                onPress={() => setThemeName(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.themeOptionLeft}>
                  <Ionicons name={item.icon} size={22} color={itemTheme.primary} style={{ marginRight: 12 }} />
                  <ThemedText style={[
                    { fontSize: 15 },
                    isSelected && { fontWeight: 'bold', color: itemTheme.primary }
                  ]}>
                    {item.label}
                  </ThemedText>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={itemTheme.primary} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* --- 5. DATA MANAGEMENT & ACCESS --- */}
        <SectionTitle title="DATA MANAGEMENT & ACCESS" icon="save" />
        <View style={{ marginBottom: 30 }}>
          <SettingItem icon="document-text" label="Export All Data (ZIP/PDF)" rightIcon="chevron-forward" disabled={true} />
        </View>

        {/* --- 6. ALT AKSİYONLAR (LOGOUT & DELETE) --- */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              logoutUser(); // Çıkış yapıldığında store temizlenir
              router.replace("/");
            }}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <ThemedText style={{ color: "#EF4444", fontWeight: 'bold', marginLeft: 8 }}>Log Out</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { opacity: 0.4 }]}
            disabled={true}
          >
            <Ionicons name="trash" size={20} color={theme.textLight} />
            <ThemedText style={{ color: theme.textLight, fontWeight: 'bold', marginLeft: 8 }}>Delete Account</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    width: '100%',
    marginBottom: 20,
    opacity: 0.5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  footprintGrid: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  footprintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  footprintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 8,
  },
  footprintText: {
    fontSize: 14,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  themeOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  }
});