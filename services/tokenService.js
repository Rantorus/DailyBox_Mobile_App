import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dailybox_user_token';

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
