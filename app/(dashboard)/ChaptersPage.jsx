import { StyleSheet, View, FlatList, Pressable, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useMemo } from 'react';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import ThemedInput from '../../components/ThemedInput';

import { useSearch } from '../../hooks/useSearch';

import { useRouter } from 'expo-router'

import Ionicons from '@expo/vector-icons/Ionicons';


import { dummyBoxes } from '../../fetchBox/dummyBoxes';
import { dummyChapters } from '../../fetchChapters/dummyChapters';
import Spacer from '../../components/Spacer';

const ChaptersPage = () => {

  const { themeName } = useTheme();
  const theme = Colors[themeName]
  const router = useRouter()
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [sortBy, setSortBy] = useState("new");
  const [tempSortBy, setTempSortBy] = useState('new');

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tempShowFavoritesOnly, setTempShowFavoritesOnly] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [tempSelectedTypes, setTempSelectedTypes] = useState([]);

  // DİNAMİK TİP LİSTESİ ÇIKARMA
  // dummyBoxes içindeki tüm 'type' değerlerini alır ve tekrar edenleri (Set ile) eler.
  const availableTypes = useMemo(() => {
    const allTypes = dummyChapters.map(box => box.type);
    return [...new Set(allTypes)].filter(Boolean); // filter(Boolean) boş olanları temizler
  }, []);

  // ÇOKLU SEÇİM İÇİN YARDIMCI FONKSİYON (Kum havuzu için)
  const toggleTempType = (type) => {
    if (tempSelectedTypes.includes(type)) {
      // Eğer zaten seçiliyse, listeden çıkar
      setTempSelectedTypes(tempSelectedTypes.filter(t => t !== type));
    } else {
      // Seçili değilse, listeye ekle
      setTempSelectedTypes([...tempSelectedTypes, type]);
    }
  };

  // 3. İLK VERİ HAZIRLIĞI (Sonsuz döngüyü çözen useMemo yapısı)
  const filteredData = useMemo(() => {
    return dummyChapters
      .filter((data) => {

        // GERÇEK FAVORİ FİLTRESİ
        const favoriteMatch = showFavoritesOnly
          ? data.isFavorite === true
          : true;

        const typeMatch = selectedTypes.length > 0
          ? selectedTypes.includes(data.type)
          : true;

        return favoriteMatch && typeMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "new": return new Date(b.date) - new Date(a.date);
          case "old": return new Date(a.date) - new Date(b.date);
          case "az": return a.title.localeCompare(b.title);
          case "za": return b.title.localeCompare(a.title);
          default: return 0;
        }
      });
  }, [sortBy, showFavoritesOnly, selectedTypes]); // KRİTİK NOKTA: Sadece bu ikisi değişirse listeyi baştan hesapla

  // 3. ARAMA HOOK'U (query değişkeni BURADA doğuyor)
  const { query, setQuery, results, loading } = useSearch(filteredData);

  // 5. ÖNİZLEME SAYACI (Filtre Paneli İçin)
  const previewCount = dummyChapters.filter((item) => {

    // 2. Arama Filtresi: Arama çubuğundaki yazıyı HEM BAŞLIKTA HEM AÇIKLAMADA ara!
    const searchMatch = query
      ? item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
      : true;

    // 3. FAVORİ FİLTRESİ (Geçici durumu kontrol et)
    const favoriteMatch = tempShowFavoritesOnly
      ? item.isFavorite === true
      : true;

    const typeMatch = tempSelectedTypes.length > 0
      ? tempSelectedTypes.includes(item.type)
      : true;

    // (İleride buraya Seçilen Kategoriler ve Favoriler gibi filtreleri de ekleyeceğiz)

    return searchMatch && favoriteMatch && typeMatch;
  }).length;



  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView safe={true} style={styles.container}>
        <View style={styles.searchWrapper}>
          <ThemedInput
            style={[styles.searchBar, { width: '100%', height: "auto", flexShrink: 0 }]}
            placeholder="Search for chapters..."
            placeholderTextColor={theme.textLight}
            value={query}
            onChangeText={setQuery}
          />

          <TouchableOpacity
            style={styles.filterIcon}
            onPress={() => {
              Keyboard.dismiss();
              setTempSortBy(sortBy);
              setIsFilterVisible(true);
              setTempShowFavoritesOnly(showFavoritesOnly);
              setTempSelectedTypes(selectedTypes);
            }}
          >
            <Ionicons name="filter-circle" size={28} color={theme.textLight} />
          </TouchableOpacity>

        </View>

        <Spacer height={20} />

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`chapter/${item.id}`)}>
              <ThemedCard style={[styles.card, { borderLeftColor: theme.primary }]}>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <ThemedText style={{fontSize:15}}  title={true} >{item.title}</ThemedText>
                  <ThemedText style={{fontSize:15}} >{item.type}</ThemedText>
                </View>

                <ThemedText style={{fontSize:15}} >{item.description}</ThemedText>

                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <ThemedText style={{fontSize:15}} >{item.date.split('T')[0]}</ThemedText>
                  <ThemedText style={{fontSize:15}} >( {item.boxIds.length} boxes )</ThemedText>
                  {item.isFavorite ? (
                    <Ionicons style={{alignSelf:"center"}} name="star" size={25} color={theme.primary} />
                  ) : (
                    <Ionicons style={{alignSelf:"center"}} name="star-outline" size={25} color={theme.border} />
                  )}
                </View>


              </ThemedCard>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 30, color: 'gray' }}>
              No records found for this date.
            </ThemedText>
          }
        />

        {(isFilterVisible || isCreateCardVisible) && (
          <Pressable
            style={styles.overlay}
            onPress={() => {
              // Boşluğa basılınca hangisi açıksa onu kapatır
              setIsFilterVisible(false);
              setIsCreateCardVisible(false);
            }}
          />
        )}

        {isCreateCardVisible && (
          <ThemedCard style={[styles.createCard, { backgroundColor: theme.textLight }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsCreateCardVisible(false);
                
              }}
            >
              <Ionicons name="document-text" size={20} color={theme.primary} />

              <ThemedText style={[styles.menuText, { color: theme.text }]}>Create Chapter</ThemedText>

            </TouchableOpacity>
            


          </ThemedCard>
        )}

        {/* FLOATING ACTION BUTTON (UÇAN BUTON) */}
        <TouchableOpacity
          style={styles.createPlus}
          onPress={() => setIsCreateCardVisible(!isCreateCardVisible)}
        >
          <Ionicons
            name={isCreateCardVisible ? "close-circle" : "add-circle"}
            size={65}
            color={theme.primary}
          />
        </TouchableOpacity>


        {/* ALTTAN ÇIKAN FİLTRE PANELİ */}
        {isFilterVisible && (
          <ThemedView style={styles.bottomSheet}>

            <View style={{ flex: 1 }}>

              {/* Panelin Üst Kısmı (Başlık ve Çarpı Butonu) */}
              <View style={styles.sheetHeader}>
                <ThemedText title={true} style={{ fontSize: 20 }}>Filter Boxes</ThemedText>

                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <Ionicons name="close-circle" size={30} color={theme.textLight} />
                </TouchableOpacity>
              </View>



              {/* AYIRICI ÇİZGİ */}
              <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

              <ThemedText title={true}>SORT BY</ThemedText>
              <Spacer height={10} />

              {/* İÇERİK KISMI (Buraya sonradan butonlar/seçenekler ekleyeceğiz) */}
              <ThemedCard style={styles.sortBar}>
                {/* Newest BUTONU */}
                <TouchableOpacity onPress={() => setTempSortBy("new")}>
                  <ThemedText title={tempSortBy == "new"}>Newest</ThemedText>
                </TouchableOpacity>

                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                {/* Oldest BUTONU */}
                <TouchableOpacity onPress={() => setTempSortBy("old")}>
                  <ThemedText title={tempSortBy == "old"}>Oldest</ThemedText>
                </TouchableOpacity>

                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                {/* A-Z BUTONU */}
                <TouchableOpacity onPress={() => setTempSortBy("az")}>
                  <ThemedText title={tempSortBy == "az"}>A-Z</ThemedText>
                </TouchableOpacity>

                <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

                {/* Z-A BUTONU */}
                <TouchableOpacity onPress={() => setTempSortBy("za")}>
                  <ThemedText title={tempSortBy == "za"}>Z-A</ThemedText>
                </TouchableOpacity>

              </ThemedCard>
            </View>

            {/* --- TYPES CHECKBOX BÖLÜMÜ --- */}
            <Spacer height={25} />
            <ThemedText title={true}>TYPES</ThemedText>
            <Spacer height={10} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingLeft: 5 }}>
              {availableTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' }} // width 45% ile yan yana iki kolon yapar
                  onPress={() => toggleTempType(type)}
                >
                  <Ionicons
                    name={tempSelectedTypes.includes(type) ? "checkbox" : "square-outline"}
                    size={24}
                    color={theme.primary}
                  />
                  <ThemedText title={true} style={{ fontSize: 16 }}>{type}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* --- FAVORİLER CHECKBOX BÖLÜMÜ --- */}
            <Spacer height={25} />
            <ThemedText title={true}>STATUS</ThemedText>
            <Spacer height={10} />

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 5 }}
              onPress={() => setTempShowFavoritesOnly(!tempShowFavoritesOnly)}
            >
              <Ionicons
                name={tempShowFavoritesOnly ? "checkbox" : "square-outline"}
                size={24}
                color={theme.primary}
              />
              <ThemedText title={true} style={{ fontSize: 16 }}>Favorites Only</ThemedText>
            </TouchableOpacity>



            {/* Bottom Action Row */}
            <View style={styles.filterActionRow}>
              <TouchableOpacity onPress={() => {
                setIsFilterVisible(false)
                setSortBy(tempSortBy);
                setShowFavoritesOnly(tempShowFavoritesOnly);
                setSelectedTypes(tempSelectedTypes);
              }}
                style={[styles.filterButton, { backgroundColor: theme.primary }]}>
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>SHOW RESULTS ({previewCount})</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setTempSortBy('new');
                  setTempShowFavoritesOnly(false);
                  setTempSelectedTypes([]);
                }}
              >
                <ThemedText style={{ color: theme.text }}>Clear</ThemedText>
              </TouchableOpacity>
            </View>


          </ThemedView>
        )}

      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default ChaptersPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    width: "80%",
    marginBottom: 20,
    alignSelf: "center",
    marginTop: 30,
    justifyContent: "center",
  },
  searchBar: {
    paddingLeft: 20,
    paddingRight: 50,
    borderRadius: 25,

  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    width: 150,
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 20,
    borderRadius: 15,
    alignSelf: "center"
  },
  // Yeni eklenen sarmalayıcı (Tüm genişliği kaplar ve içeriği sola yaslar)
  categoryHeaderWrapper: {
    width: '90%', // Ekranın tamamını değil, biraz içerde kalması için %90
    alignSelf: 'center', // Yine de ortada durmasını istiyorsan bu kalabilir
    marginTop: 20,
  },
  boxCategoryText: {
    textAlign: 'left', // Yazıyı kendi kutusunun içinde sola yaslar
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  },
  list: { paddingBottom: 20 },
  card: {
    width: "92%",
    height: 185,
    justifyContent:"space-between",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 12,
    gap: 10,

    borderLeftWidth: 5,
    borderRadius: 8,
  },
  createPlus: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  createCard: {
    position: 'absolute',
    bottom: 95,
    right: 50,
    width: 215,
    borderRadius: 15,
    paddingVertical: 5,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '500',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 15,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth, // Yatayda 1 piksel genişlik (dikey çizgi için)
    height: 18,                     // Yazıların yüksekliğiyle uyumlu olsun
  },
  // YENİ KARARTMA EFEKTİ (Blur yerine)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // %40 saydam siyah
    zIndex: 998,
  },
  filterIcon: {
    position: 'absolute',
    right: 15,              // Sağdan hafif bir boşluk bırak
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: "auto", // Şimdilik sabit bir yükseklik, içerik arttıkça "auto" yapabilirsin
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    zIndex: 1000, // Karartmanın (998) ve + butonunun (999) üstünde durması için

    // Alttan çıkan panele derinlik (gölge) katmak için
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, // Gölgeyi yukarı doğru verir
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20, // Android için yüksek gölge
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    width: 300,
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 20,
    borderRadius: 15,
    alignSelf: "center"
  },
  filterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'gray',
    marginTop: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 15,
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
})