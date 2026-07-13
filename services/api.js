import axios from 'axios';
import { getToken, removeToken } from './tokenService';

// Backend'in URL'si (Production on Render)
const API_URL = 'https://dailybox-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 20000, // İstek 20 saniye içinde tamamlanmazsa iptal edilir
});

// REQUEST INTERCEPTOR: Giden her isteğe araya girip Token ekler
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR: Gelen cevapları yakalar, 401 hatası (Token süresi dolmuş) varsa çıkış yaptırır
api.interceptors.response.use(
    (response) => {
        return response; // Her şey yolundaysa datayı olduğu gibi bırak
    },
    async (error) => {
        // Eğer token süresi dolmuşsa veya geçersizse backend 401 döner
        if (error.response && error.response.status === 401) {
            console.log('Token geçersiz veya süresi dolmuş, oturum kapatılıyor...');
            await removeToken(); // Şifreli depodan sil

            // Zustand store'u güncelle ve kullanıcıyı çıkış yapmaya zorla (Require cycle hatasını çözmek için lazy require)
            const { useUserStore } = require('../store/useStore');
            useUserStore.getState().logoutUser();
        }
        return Promise.reject(error);
    }
);

export default api;
