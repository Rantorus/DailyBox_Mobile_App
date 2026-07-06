import { create } from 'zustand';
import api from '../services/api';
import { saveToken, removeToken, getToken, saveCredentials, saveBiometricSetting, getBiometricSetting } from '../services/tokenService';

export const useUserStore = create((set, get) => ({
    activeUser: null,
    isBiometricEnabled: false,
    isAuthChecking: true, // Açılışta auth kontrolü yapılana kadar true
    isLoading: false,
    error: null,

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
    }
}));