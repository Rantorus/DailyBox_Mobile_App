import axios from 'axios';
import { getToken, removeToken } from './tokenService';

// Backend'in URL'si.
// Android Emülatör kullanıyorsan 10.0.2.2 her zaman en güvenlisidir.
// Fiziksel telefonsa 172.168.100.116 yazılmalıdır.
const API_URL = 'http://172.168.100.116:5001/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 saniye içinde cevap gelmezse hata ver (internet koptu vs.)
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
        }
        return Promise.reject(error);
    }
);

export default api;
