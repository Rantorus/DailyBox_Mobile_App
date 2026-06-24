// store/mediaStore.js
import { create } from 'zustand';

export const useMediaStore = create((set) => ({
    images: [],

    addImage: (newImage) => set(state => ({
        images: [...state.images, newImage]
    })),

    removeImage: (id) => set(state => ({
        images: state.images.filter(img => img.id !== id)
    })),
}));