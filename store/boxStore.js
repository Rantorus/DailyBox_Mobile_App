import { create } from 'zustand';
import api from '../services/api.js';
import { useUserStore } from './useStore.jsx'; // activeUser'a ulaşmak gerekirse diye

export const useBoxStore = create((set, get) => ({
    boxes: [],
    isLoading: false,
    error: null,

    // Draft features for CreateBoxPage (where boxId doesn't exist yet)
    draftFeatures: {
        note: null, // { title, content }
        todo: null, 
        location: null,
        media: null
    },

    setDraftFeature: (key, value) => set((state) => ({ 
        draftFeatures: { ...state.draftFeatures, [key]: value } 
    })),
    
    clearDraftFeatures: () => set({ 
        draftFeatures: { note: null, todo: null, location: null, media: null } 
    }),

    // 1. Kullanıcının tüm chapter'larını çek (GET /api/chapters)
    fetchMyBoxes: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/boxes');
            // Backend'den { status: 200, data: [...] } formatında döndüğünü varsayıyoruz
            set({ boxes: response.data.data || response.data, isLoading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Boxlar yüklenirken bir hata oluştu.', 
                isLoading: false 
            });
        }
    },

    // 2. Yeni Box oluştur (POST /api/chapters)
    createBox: async (boxData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/boxes', boxData);
            const newBox = response.data.data || response.data;
            
            // Mevcut listeye ekle
            set((state) => ({
                boxes: [newBox, ...state.boxes],
                isLoading: false
            }));
            return { success: true, data: newBox };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Box oluşturulamadı.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // 3. Box güncelle (PATCH /api/boxes/:id)
    updateBox: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`/boxes/${id}`, updateData);
            const updatedBox = response.data.data || response.data;
            
            // Mevcut listedeki ilgili chapter'ı güncelle
            set((state) => ({
                boxes: state.boxes.map(bx => bx.id === id ? updatedBox : bx),
                isLoading: false
            }));
            return { success: true, data: updatedBox };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Box güncellenemedi.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

     // 4. Box sil (DELETE /api/boxes/:id)
    deleteBox: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/boxes/${id}`);
            
            // Listeden çıkar
            set((state) => ({
                boxes: state.boxes.filter(bx => bx.id !== id),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Box silinemedi.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // 5. State'i temizle (Logout olduğunda çağrılmalı)
    clearBox: () => set({ boxes: [], error: null })
}))