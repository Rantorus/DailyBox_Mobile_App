import { create } from 'zustand';
import api from '../services/api.js';
import { useUserStore } from './useStore.jsx'; // activeUser'a ulaşmak gerekirse diye

export const useChapterStore = create((set, get) => ({
    chapters: [],
    isLoading: false,
    error: null,

    // 1. Kullanıcının tüm chapter'larını çek (GET /api/chapters)
    fetchMyChapters: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/chapters');
            // Backend'den { status: 200, data: [...] } formatında döndüğünü varsayıyoruz
            set({ chapters: response.data.data || response.data, isLoading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Chapterlar yüklenirken bir hata oluştu.', 
                isLoading: false 
            });
        }
    },

    // 2. Yeni Chapter oluştur (POST /api/chapters)
    createChapter: async (chapterData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/chapters', chapterData);
            const newChapter = response.data.data || response.data;
            
            // Mevcut listeye ekle
            set((state) => ({
                chapters: [newChapter, ...state.chapters],
                isLoading: false
            }));
            return { success: true, data: newChapter };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Chapter oluşturulamadı.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // 3. Chapter güncelle (PUT /api/chapters/:id)
    updateChapter: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/chapters/${id}`, updateData);
            const updatedChapter = response.data.data || response.data;
            
            // Mevcut listedeki ilgili chapter'ı güncelle
            set((state) => ({
                chapters: state.chapters.map(ch => ch.id === id ? updatedChapter : ch),
                isLoading: false
            }));
            return { success: true, data: updatedChapter };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Chapter güncellenemedi.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // 4. Chapter'a kutu ekle (POST /api/chapters/:id/boxes)
    addBoxToChapter: async (chapterId, boxId) => {
        try {
            await api.post(`/chapters/${chapterId}/boxes`, { boxId });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Box could not be added to chapter.' };
        }
    },

    // 5. Chapter'dan kutu çıkar (DELETE /api/chapters/:id/boxes/:boxId)
    removeBoxFromChapter: async (chapterId, boxId) => {
        try {
            await api.delete(`/chapters/${chapterId}/boxes/${boxId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Box could not be removed from chapter.' };
        }
    },

    // 6. Chapter sil (DELETE /api/chapters/:id)
    deleteChapter: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/chapters/${id}`);
            
            // Listeden çıkar
            set((state) => ({
                chapters: state.chapters.filter(ch => ch.id !== id),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Chapter silinemedi.';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // 5. State'i temizle (Logout olduğunda çağrılmalı)
    clearChapters: () => set({ chapters: [], error: null })
}));
