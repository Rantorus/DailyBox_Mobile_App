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

    // 5. Medya Yükle (POST /api/media/box/:boxId/photo)
    uploadBoxPhoto: async (boxId, photoUri, mimeType, fileName, displayName) => {
        try {
            const formData = new FormData();
            formData.append('photo', {
                uri: photoUri,
                type: mimeType || 'image/jpeg',
                name: fileName || `photo_${Date.now()}.jpg`,
            });
            if (displayName) {
                formData.append('displayName', displayName);
            }

            const response = await api.post(`/media/box/${boxId}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedPhotos = response.data.data; // Server'dan dönen yeni media_photos dizisi

            // Mevcut kutuyu güncelle
            set((state) => ({
                boxes: state.boxes.map(bx =>
                    bx.id === boxId
                        ? { ...bx, media_photos: updatedPhotos, has_media: true }
                        : bx
                )
            }));
            return { success: true, data: updatedPhotos };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Fotoğraf yüklenemedi.';
            return { success: false, error: errorMsg };
        }
    },

    // 6. Medya Sil (DELETE /api/media/box/:boxId/photo)
    deleteBoxPhoto: async (boxId, photoUrl) => {
        try {
            const response = await api.delete(`/media/box/${boxId}/photo`, {
                data: { url: photoUrl } // DELETE request body'de veri yollamak için config.data kullanılır
            });

            const updatedPhotos = response.data.data;

            set((state) => ({
                boxes: state.boxes.map(bx => {
                    if (bx.id === boxId) {
                        // Eğer tüm medyalar boş kaldıysa has_media flag'ini backend'e uyumlu şekilde kapatmak gerekebilir.
                        // Şimdilik sadece array'i güncelliyoruz
                        return { ...bx, media_photos: updatedPhotos };
                    }
                    return bx;
                })
            }));
            return { success: true, data: updatedPhotos };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Fotoğraf silinemedi.';
            return { success: false, error: errorMsg };
        }
    },

    // 7. Ses Yükle (POST /api/media/box/:boxId/audio)
    uploadBoxAudio: async (boxId, audioUri, mimeType, fileName, displayName) => {
        try {
            const formData = new FormData();
            formData.append('audio', {
                uri: audioUri,
                type: mimeType || 'audio/m4a',
                name: fileName || `audio_${Date.now()}.m4a`,
            });
            if (displayName) {
                formData.append('displayName', displayName);
            }

            const response = await api.post(`/media/box/${boxId}/audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedAudios = response.data.data;

            set((state) => ({
                boxes: state.boxes.map(bx =>
                    String(bx.id) === String(boxId)
                        ? { ...bx, media_audio: updatedAudios, has_media: true }
                        : bx
                )
            }));
            return { success: true, data: updatedAudios };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Ses yüklenemedi.';
            return { success: false, error: errorMsg };
        }
    },

    // 8. Ses Sil (DELETE /api/media/box/:boxId/audio)
    deleteBoxAudio: async (boxId, audioUrl) => {
        try {
            const response = await api.delete(`/media/box/${boxId}/audio`, {
                data: { url: audioUrl }
            });

            const updatedAudios = response.data.data;

            set((state) => ({
                boxes: state.boxes.map(bx => {
                    if (bx.id === boxId) {
                        return { ...bx, media_audio: updatedAudios };
                    }
                    return bx;
                })
            }));
            return { success: true, data: updatedAudios };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Ses silinemedi.';
            return { success: false, error: errorMsg };
        }
    },

    // 9. State'i temizle (Logout olduğunda çağrılmalı)
    clearBox: () => set({ boxes: [], error: null })
}))