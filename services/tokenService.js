import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dailybox_user_token';
const CREDENTIALS_KEY = 'dailybox_user_credentials';

// Token'ı güvenli depoya kaydeder
export const saveToken = async (token) => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('Token kaydedilemedi:', error);
    }
};

// Token'ı depodan okur
export const getToken = async () => {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Token okunamadı:', error);
        return null;
    }
};

// Token'ı depodan siler (Logout işleminde kullanılır)
export const removeToken = async () => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Token silinemedi:', error);
    }
};

// BİYOMETRİK GİRİŞ İÇİN KİMLİK BİLGİLERİ YÖNETİMİ
export const saveCredentials = async (email, password) => {
    try {
        const credentials = JSON.stringify({ email, password });
        await SecureStore.setItemAsync(CREDENTIALS_KEY, credentials);
    } catch (error) {
        console.error('Kimlik bilgileri kaydedilemedi:', error);
    }
};

export const getCredentials = async () => {
    try {
        const credentialsString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (credentialsString) {
            return JSON.parse(credentialsString);
        }
        return null;
    } catch (error) {
        console.error('Kimlik bilgileri okunamadı:', error);
        return null;
    }
};

export const clearCredentials = async () => {
    try {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    } catch (error) {
        console.error('Kimlik bilgileri silinemedi:', error);
    }
};

// BİYOMETRİK AYAR YÖNETİMİ
const BIOMETRIC_SETTING_KEY = 'dailybox_biometric_setting';

export const saveBiometricSetting = async (isEnabled) => {
    try {
        await SecureStore.setItemAsync(BIOMETRIC_SETTING_KEY, JSON.stringify(isEnabled));
    } catch (error) {
        console.error('Biyometrik ayar kaydedilemedi:', error);
    }
};

export const getBiometricSetting = async () => {
    try {
        const setting = await SecureStore.getItemAsync(BIOMETRIC_SETTING_KEY);
        if (setting !== null) {
            return JSON.parse(setting);
        }
        return false;
    } catch (error) {
        console.error('Biyometrik ayar okunamadı:', error);
        return false;
    }
};
