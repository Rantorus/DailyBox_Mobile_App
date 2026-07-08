import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeNameState] = useState('darkTheme');

    // Uygulama ilk açıldığında kaydedilmiş temayı yükle
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('appTheme');
                if (savedTheme) {
                    setThemeNameState(savedTheme);
                }
            } catch (error) {
                console.error("Error loading theme:", error);
            }
        };
        loadTheme();
    }, []);

    // Tema değiştirildiğinde hem state'i hem de belleği güncelle
    const setThemeName = async (newTheme) => {
        setThemeNameState(newTheme);
        try {
            await SecureStore.setItemAsync('appTheme', newTheme);
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
