import { useEffect, useState } from "react";

export const useSearch = (filteredData) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 1. Arama kutusu boşsa, verinin orijinal halini (hepsini) göster
        if (!query.trim()) {
            setResults(filteredData);
            return;
        }

        // 2. Kullanıcı yazmayı bırakana kadar 500ms bekle
        const timer = setTimeout(() => {
            setLoading(true);
            try {
                // 3. DOĞRU FİLTRELEME: Objelerin 'title' değerinin içine bakıyoruz
                const searchedData = filteredData.filter((item) =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.description.toLowerCase().includes(query.toLowerCase())
                );

                setResults(searchedData); // 4. formatMovies kaldırıldı!
            } catch (err) {
                console.error('Search Error:', err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);

        // 5. filteredData buraya eklendi ki Log/Plan değişince hook kendini güncellesin
    }, [query, filteredData]);

    return { query, setQuery, results, loading };
}