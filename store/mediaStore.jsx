// store/mediaStore.js
import { create } from 'zustand';

export const useMediaStore = create((set) => ({
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
    addLocation: (newLocation) => set(state => ({
        locations: [...state.locations, newLocation]
    })),
    removeLocation: (id) => set(state => ({
        locations: state.locations.filter(loc => loc.id !== id)
    })),
}));