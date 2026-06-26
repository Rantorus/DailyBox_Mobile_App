// store/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  activeUser: null, // Başlangıçta kimse giriş yapmadı
  
  // Login başarılı olunca kullanıcıyı depoya kaydeder
  setActiveUser: (user) => set({ activeUser: user }),
  
  // Logout yapınca depoyu temizler
  logoutUser: () => set({ activeUser: null }),

   // YENİ
    isBiometricEnabled: false,
    setBiometricEnabled: (value) => set({ isBiometricEnabled: value }),

    setActiveUser: (user) => set({ activeUser: user }),
    logoutUser: () => set({ activeUser: null }),
    
}));