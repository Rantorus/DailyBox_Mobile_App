// store/mediaStore.js
import { create } from 'zustand';

export const useMediaStore = create((set) => ({
    // Aktif box ID — media ekranları arası paylaşım için
    currentBoxId: null,
    setCurrentBoxId: (id) => set({ currentBoxId: id }),

    // FOTOĞRAFLAR
    images: [],
    addImage: (newImage) => set(state => ({
        images: [...state.images, newImage]
    })),
    removeImage: (id) => set(state => ({
        images: state.images.filter(img => img.id !== id)
    })),

    // SES DOSYALARI (YENİ EKLENEN KISIM)
    audios: [],
    addAudio: (newAudio) => set(state => ({
        audios: [...state.audios, newAudio]
    })),
    removeAudio: (id) => set(state => ({
        audios: state.audios.filter(audio => audio.id !== id)
    })),

    // BELGELER (DOCS)
    docs: [],
    addDoc: (newDoc) => set(state => ({
        docs: [...state.docs, newDoc]
    })),
    removeDoc: (id) => set(state => ({
        docs: state.docs.filter(doc => doc.id !== id)
    })),

    locations: [],
    setLocations: (locs) => set({ locations: locs }),
    addLocation: (newLocation) => set(state => ({
        locations: [...state.locations, newLocation]
    })),
    removeLocation: (id) => set(state => ({
        locations: state.locations.filter(loc => loc.id !== id)
    })),

    // TEMİZLEME FONKSİYONU
    clearMedia: () => set({
        currentBoxId: null,
        images: [],
        audios: [],
        docs: [],
        locations: []
    })
}));