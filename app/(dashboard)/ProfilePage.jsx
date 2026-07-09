import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Image, Modal, Alert, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedInput from '../../components/ThemedInput';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

import { useBoxStore } from '../../store/boxStore';
import { useChapterStore } from '../../store/chapterStore';

// Global Store'lar
import { useMediaStore } from '../../store/mediaStore';
import { useUserStore } from '../../store/useStore'; 

import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

const THEME_OPTIONS = [
  { id: 'darkTheme', label: 'Dark Mode', icon: 'moon' },
  { id: 'lightTheme', label: 'Light Mode', icon: 'sunny' },
  { id: 'oceanTheme', label: 'Deep Ocean', icon: 'water' },
  { id: 'forestTheme', label: 'Forest Green', icon: 'leaf' },
  { id: 'coffeeTheme', label: 'Coffee', icon: 'cafe' },
  { id: 'burgundyTheme', label: 'Deep Burgundy', icon: 'wine' },
  { id: 'jungleTheme', label: 'Jungle Soda', icon: 'paw' },
  { id: 'plumTheme', label: 'Plum Snow', icon: 'snow' },
  { id: 'rustTheme', label: 'Rust Pearl', icon: 'bonfire' },
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
  const deleteAccount = useUserStore((state) => state.deleteAccount);
  const uploadAvatar = useUserStore((state) => state.uploadAvatar);
  const isDeletingAccount = useUserStore((state) => state.isDeleting);

  const isBiometricEnabled = useUserStore(state => state.isBiometricEnabled);
  const setBiometricEnabled = useUserStore(state => state.setBiometricEnabled);

  // ==========================================
  // PROFİL FOTOĞRAFI STATE'LERİ
  // ==========================================
  // İleride bu veriyi Zustand store'da (activeUser.profilePic vb.) tutabilirsin
  const [profileImage, setProfileImage] = useState(null); 
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isThemesVisible, setIsThemesVisible] = useState(false);

  // ==========================================
  // ŞİFRE DEĞİŞTİRME STATE'LERİ
  // ==========================================
  const [isPasswordPanelVisible, setIsPasswordPanelVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const changePassword = useUserStore((state) => state.changePassword);

  // ==========================================
  // DİNAMİK VERİ HESAPLAMALARI
  // ==========================================
  const activeUserName = activeUser?.full_name || activeUser?.fullName || "Unknown User";
  const activeUserEmail = activeUser?.email || "Email not found";

  const chapters = useChapterStore((state) => state.chapters);
  const boxes = useBoxStore((state) => state.boxes);
  
  const boxesCount = boxes?.length || 0;
  const chaptersCount = chapters?.length || 0;
  const logsCount = boxes?.filter(box => box.category === 'log').length || 0;
  const plansCount = boxes?.filter(box => box.category === 'plan').length || 0;

  // ==========================================
  // FONKSİYONLAR
  // ==========================================
  const handleBiometricToggle = async () => {
    if (!isBiometricEnabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert('Not Supported', 'No registered fingerprint or Face ID found on your device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  // FOTOĞRAF SEÇME VEYA ÇEKME İŞLEMİ
  const pickImage = async (useCamera = false) => {
    let result;
    
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Kare formatta kes
        quality: 0.5,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    }

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setProfileImage(selectedUri); // Geçici olarak lokalde göster
      
      // Sunucuya yükle
      setIsUploadingAvatar(true);
      const uploadResult = await uploadAvatar(selectedUri);
      setIsUploadingAvatar(false);

      if (!uploadResult.success) {
          Alert.alert("Upload Failed", uploadResult.error || "Failed to upload avatar.");
      }
    }
  };

  // KAMERA VE GALERİ SEÇENEKLERİNİ SUNAN ALERT
  const showImageOptions = () => {
    Alert.alert(
      "Profile Photo",
      "Choose a method to add a photo",
      [
        { text: "Camera", onPress: () => pickImage(true) },
        { text: "Gallery", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // AVATARA TIKLANDIĞINDA NE OLACAK?
  const handleAvatarPress = () => {
    if (activeUser?.avatar || profileImage) {
      setIsPhotoModalVisible(true); // Foto varsa büyük modülü aç
    } else {
      showImageOptions(); // Foto yoksa doğrudan seçenekleri sun
    }
  };

  // HESABI SİLME ONAYI
  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) {
              router.replace("/");
            } else {
              Alert.alert("Error", result.error || "Failed to delete account");
            }
          }
        }
      ]
    );
  };

  // ŞİFRE DEĞİŞTİRME İŞLEMİ
  const handlePasswordChange = async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(oldPassword, newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      Alert.alert("Success", "Password changed successfully! You will be logged out.", [
        {
          text: "OK",
          onPress: async () => {
            const passedEmail = activeUserEmail;
            const passedPassword = newPassword;
            
            // Login sayfasında doldurulması için bilgileri global store'a kaydet
            useUserStore.getState().setPendingLoginCredentials({ email: passedEmail, password: passedPassword });

            await logoutUser();
            setIsPasswordPanelVisible(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }
        }
      ]);
    } else {
      Alert.alert("Error", result.error || "Failed to change password.");
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

  const SettingItem = ({ icon, label, rightIcon, rightText, disabled, onPress }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && { opacity: 0.4 }]}
      disabled={disabled}
      activeOpacity={0.7}
      onPress={onPress}
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
          {/* Avatar'ı TouchableOpacity ile sarmaladık */}
          <TouchableOpacity 
            onPress={handleAvatarPress} 
            activeOpacity={0.8}
            style={[styles.avatarBox, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
          >
            {isUploadingAvatar ? (
                <View style={[styles.avatarImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="refresh" size={24} color={theme.textLight} />
                </View>
            ) : activeUser?.avatar || profileImage ? (
                <Image source={{ uri: activeUser?.avatar || profileImage }} style={styles.avatarImage} />
            ) : (
                <Ionicons name="person" size={40} color={theme.textLight} />
            )}
            
            {/* Küçük düzenleme ikonu (Kullanıcıya buraya tıklanabildiğini hissettirir) */}
            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

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
          <SettingItem 
            icon="key" 
            label="Change Password" 
            rightIcon="chevron-forward" 
            disabled={false} 
            onPress={() => setIsPasswordPanelVisible(true)} 
          />
          
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
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}
          onPress={() => setIsThemesVisible(!isThemesVisible)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="color-palette" size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <ThemedText style={[styles.sectionTitleText, { color: theme.textLight }]}>
              APPEARANCE
            </ThemedText>
          </View>
          <Ionicons name={isThemesVisible ? "chevron-up" : "chevron-down"} size={20} color={theme.textLight} />
        </TouchableOpacity>

        {isThemesVisible && (
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
        )}

        {/* --- 6. ALT AKSİYONLAR (LOGOUT & DELETE) --- */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              logoutUser(); 
              router.replace("/");
            }}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <ThemedText style={{ color: "#EF4444", fontWeight: 'bold', marginLeft: 8 }}>Log Out</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={confirmDeleteAccount}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
            <ThemedText style={{ color: "#EF4444", fontWeight: 'bold', marginLeft: 8 }}>Delete Account</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ==========================================
          TAM EKRAN FOTOĞRAF MODALI 
      ========================================== */}
      <Modal visible={isPhotoModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setIsPhotoModalVisible(false)}
              >
                  <Ionicons name="close" size={32} color="#FFF" />
              </TouchableOpacity>

              <Image 
                source={{ uri: activeUser?.avatar || profileImage }} 
                style={styles.fullScreenImage} 
                resizeMode="contain" 
              />

              <TouchableOpacity 
                style={[styles.changePhotoBtn, { backgroundColor: theme.primary }]} 
                onPress={() => {
                  setIsPhotoModalVisible(false);
                  setTimeout(() => showImageOptions(), 300);
                }}
              >
                  <Ionicons name="camera-reverse" size={20} color="#FFF" />
                  <ThemedText style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 8 }}>
                    Change Photo
                  </ThemedText>
              </TouchableOpacity>
          </View>
      </Modal>

    {/* ==========================================
        SİLME/YÜKLEME BEKLEME EKRANI
    ========================================== */}
    <Modal visible={isDeletingAccount} transparent={true} animationType="fade">
      <View style={[styles.modalBackground, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ color: '#FFF', marginTop: 15, fontSize: 16, fontWeight: 'bold' }}>
          Deleting account and all associated data...
        </ThemedText>
        <ThemedText style={{ color: theme.textLight, marginTop: 5, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
          This may take a few moments as we remove your files from the cloud.
        </ThemedText>
      </View>
    </Modal>

    {/* ALTTAN ÇIKAN ŞİFRE DEĞİŞTİRME PANELİ */}
    <Modal visible={isPasswordPanelVisible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={1} 
          onPress={() => {
            if (!isChangingPassword) {
              setIsPasswordPanelVisible(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              Keyboard.dismiss();
            }
          }} 
        />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 40 : 40}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={[styles.bottomSheet, { position: 'relative', bottom: 0, width: '100%' }]}>
              <View style={styles.sheetHeader}>
                <ThemedText title={true} style={{ fontSize: 20 }}>Change Password</ThemedText>
                <TouchableOpacity onPress={() => {
                  setIsPasswordPanelVisible(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  Keyboard.dismiss();
                }}>
                  <Ionicons name="close-circle" size={30} color={theme.textLight} />
                </TouchableOpacity>
              </View>

              <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

              <View style={{ gap: 15 }}>
                <ThemedInput
                  placeholder="Old Password"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  editable={!isChangingPassword}
                  autoCapitalize="none"
                />
                <ThemedInput
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isChangingPassword}
                  autoCapitalize="none"
                />
                <ThemedInput
                  placeholder="Confirm New Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isChangingPassword}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: theme.primary, marginTop: 25 }]}
                onPress={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>SUBMIT</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
      </View>
    </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  
  // Avatar Stilleri
  avatarBox: { 
    width: 76, 
    height: 76, 
    borderWidth: 2, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    position: 'relative', // Badge için gerekli
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18, // Kutunun içini tam kaplaması için biraz kavisli
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF', // Etrafında keskin hat
  },
  
  profileInfo: { flex: 1, justifyContent: 'center' },
  divider: { height: 1, width: '100%', marginBottom: 20, opacity: 0.5 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitleText: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },

  footprintGrid: { borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 20 },
  footprintRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150, 150, 150, 0.2)' },
  footprintItem: { flexDirection: 'row', alignItems: 'center', width: '48%', gap: 8 },
  footprintText: { fontSize: 14 },

  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },

  themeOptionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 6 },
  themeOptionLeft: { flexDirection: 'row', alignItems: 'center' },

  footerActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },

  // Tam Ekran Modal Stilleri
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Derin siyah arka plan
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: width,
    height: width, // Kare formatı korumak için 
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    position: 'absolute',
    bottom: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  // --- BOTTOM SHEET (ŞİFRE DEĞİŞTİRME) STİLLERİ ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 998,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: "auto",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 15,
  },
  filterButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  }
});