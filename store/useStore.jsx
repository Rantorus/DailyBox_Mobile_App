import { create } from 'zustand';
import api from '../services/api';
import { saveToken, removeToken, getToken, saveCredentials, saveBiometricSetting, getBiometricSetting } from '../services/tokenService';

export const useUserStore = create((set, get) => ({
    activeUser: null,
    isBiometricEnabled: false,
    isAuthChecking: true, // Açılışta auth kontrolü yapılana kadar true
    isLoading: false,
    isDeleting: false,
    error: null,
    pendingLoginCredentials: null,

    setPendingLoginCredentials: (creds) => set({ pendingLoginCredentials: creds }),

    setBiometricEnabled: (value) => {
        saveBiometricSetting(value);
        set({ isBiometricEnabled: value });
    },

    // Uygulama açılışında biyometrik ayarı yükle
    initBiometricSetting: async () => {
        const isEnabled = await getBiometricSetting();
        set({ isBiometricEnabled: isEnabled });
    },

    // Gerçek API'ye Login İsteği Atar
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login', { email, password });
            const payload = response.data; // { status, message, data: { accessToken: "..." } }

            // 1. Token'ı telefona güvenli kaydet (payload.data.accessToken)
            await saveToken(payload.data.accessToken);

            // Biyometrik için kullanıcı bilgilerini şifreli depoya kaydet
            await saveCredentials(email, password);

            // 2. Token kaydedildiğine göre, backend'den güncel kullanıcıyı getirtelim
            const authResult = await get().checkAuth();

            return { success: authResult.success };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.',
                isLoading: false
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Gerçek API'ye Register İsteği Atar
    register: async (fullName, email, password, location) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/users/register', { fullName, email, password, location });
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.',
                isLoading: false
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Gerçek Logout
    logoutUser: async () => {
        set({ isAuthChecking: true }); // Çıkış yapılırken UserOnly'deki yükleme ekranını tetikler

        // Milisaniyelik flaşlamayı engellemek ve "Çıkış yapılıyor..." hissini 
        // daha pürüzsüz vermek için kısa bir yapay gecikme (800ms) ekliyoruz
        await new Promise(resolve => setTimeout(resolve, 300));

        await removeToken(); // Telefondaki şifreli depodan sil
        set({ activeUser: null, error: null, isAuthChecking: false });
    },

    // Uygulama açılışında Token var mı diye bakar, varsa backend'den kullanıcıyı çeker
    checkAuth: async () => {
        set({ isAuthChecking: true });
        try {
            const token = await getToken();
            if (!token) {
                set({ activeUser: null, isAuthChecking: false });
                return { success: false };
            }

            // Token varsa Backend'den güncel kullanıcıyı getir (token api.js tarafından otomatik header'a eklenir)
            const response = await api.get('/users/current');
            // Backend'deki handleResponse mimarisi response.data.data içinde veriyi yollar
            set({ activeUser: response.data.data, isAuthChecking: false });
            return { success: true };
        } catch (error) {
            console.log("Oturum kontrol hatası: ", error.response?.data || error.message);
            // 401 hatası aldıysa api.js'teki interceptor zaten token'ı silecektir.
            set({ activeUser: null, isAuthChecking: false });
            return { success: false };
        }
    },

    // Avatar Yükleme İşlemi
    uploadAvatar: async (imageUri) => {
        set({ isLoading: true, error: null });
        try {
            const userId = get().activeUser?.id;
            if (!userId) throw new Error("Kullanıcı ID'si bulunamadı");

            const formData = new FormData();
            
            // Dosya adını ve tipini uri'den çıkar
            const uriParts = imageUri.split('/');
            const fileName = uriParts[uriParts.length - 1] || `avatar_${Date.now()}.jpg`;
            
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('avatar', {
                uri: imageUri,
                name: fileName,
                type: type
            });

            // Yükleme işlemini gerçekleştir
            const response = await api.post(`/users/${userId}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Gelen yanıttan güncellenmiş kullanıcı verisini al
            const updatedUser = response.data.data;

            // Zustand store'daki activeUser'ı güncelle
            set((state) => ({
                activeUser: {
                    ...state.activeUser,
                    avatar: updatedUser.avatar
                },
                isLoading: false
            }));

            return { success: true, url: updatedUser.avatar };
        } catch (error) {
            console.error("Avatar upload error:", error);
            set({
                error: error.response?.data?.message || 'Profile photo could not be uploaded.',
                isLoading: false
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Hesabı Silme İşlemi
    deleteAccount: async () => {
        set({ isDeleting: true, error: null });
        try {
            const userId = get().activeUser?.id;
            if (!userId) throw new Error("Kullanıcı ID'si bulunamadı");
            
            await api.delete(`/users/${userId}`);
            
            // Çıkış yap ve state'i temizle
            await get().logoutUser();
            
            set({ isDeleting: false });
            return { success: true };
        } catch (error) {
            console.error("Delete account error:", error);
            set({
                error: error.response?.data?.message || 'Hesap silinemedi.',
                isDeleting: false
            });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Şifre Değiştirme
    changePassword: async (oldPassword, newPassword) => {
        set({ error: null });
        try {
            await api.patch('/users/change-password', { oldPassword, newPassword });
            return { success: true };
        } catch (error) {
            console.error("Change password error:", error);
            const errorMsg = error.response?.data?.message || 'Password could not be changed.';
            return { success: false, error: errorMsg };
        }
    }
}));