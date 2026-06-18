import { StyleSheet, View, FlatList, Pressable, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { Colors, selectedThemeString } from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';
import ThemedInput from '../../components/ThemedInput';

import { useRouter } from 'expo-router'

import Ionicons from '@expo/vector-icons/Ionicons';


import { dummyBoxes } from '../../fetchBox/dummyBoxes';
import Spacer from '../../components/Spacer';

const BoxesPage = () => {

  const theme = Colors[selectedThemeString]
  const router = useRouter()
  const [query, setQuery] = useState();
  const [shownCategory, setShownCategory] = useState(true);
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const filteredData = dummyBoxes.filter((data) => {
    return shownCategory
      ? data.category.toLowerCase() === 'log'
      : data.category.toLowerCase() === 'plan';
  })

  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView safe={true} style={styles.container}>
        <View style={styles.searchWrapper}>
          <ThemedInput
            style={[styles.searchBar, { width: '100%', height: "auto", flexShrink: 0 }]}
            placeholder="Search for boxes..."
            placeholderTextColor={theme.textLight}
            value={query}
            onChangeText={setQuery}
          />

          <TouchableOpacity 
              style={styles.filterIcon} 
              onPress={() => setIsFilterVisible(true)}
            >
              <Ionicons name="filter-circle" size={28} color={theme.textLight} />
            </TouchableOpacity>

        </View>

        <Spacer height={20}/>

        <ThemedCard style={styles.topBar}>
          {/* LOGS BUTONU */}
          <TouchableOpacity onPress={() => setShownCategory(true)}>
            <ThemedText title={shownCategory === true}>Logs</ThemedText>
          </TouchableOpacity>

          <View style={[styles.verticalDivider, { backgroundColor: theme.textLight + '80' }]} />

          {/* PLANS BUTONU */}
          <TouchableOpacity onPress={() => setShownCategory(false)}>
            <ThemedText title={shownCategory === false}>Plans</ThemedText>
          </TouchableOpacity>
        </ThemedCard>

        <Spacer height={20} />

        <View style={styles.categoryHeaderWrapper}>
          <ThemedText style={styles.boxCategoryText} title={true}>
            {shownCategory ? "Log Boxes" : "Plan Boxes"}
          </ThemedText>
        </View>

        <Spacer height={10} />

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => console.log(`Basildi: ${item.id}`)}>
              <ThemedCard style={[styles.card, { borderLeftColor: theme.primary }]}>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <ThemedText title={true} >{item.title}</ThemedText>
                  <ThemedText >{item.type}</ThemedText>
                </View>

                <ThemedText >{item.description}</ThemedText>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <ThemedText>{item.date.split('T')[0]}</ThemedText>
                  {item.isFavorite ? (
                    <Ionicons name="star" size={24} color={theme.primary} />
                  ) : (
                    <Ionicons name="star-outline" size={24} color={theme.border} />
                  )}
                </View>


                <ThemedText style={{ color: 'gray', marginTop: 5 }}>{item.category.toUpperCase()}</ThemedText>


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
                console.log('Create Log Tıklandı')
                setIsCreateCardVisible(false);
              }}
            >
              <Ionicons name="document-text" size={20} color={theme.primary} />

              <ThemedText style={[styles.menuText, { color: theme.text }]}>Create Log</ThemedText>

            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: theme.text + '50' }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Create Plan Tıklandı')
                setIsCreateCardVisible(false);
              }}
            >
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <ThemedText style={[styles.menuText, { color: theme.text }]}>Create Plan</ThemedText>
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
            
            {/* Panelin Üst Kısmı (Başlık ve Çarpı Butonu) */}
            <View style={styles.sheetHeader}>
              <ThemedText title={true} style={{ fontSize: 20 }}>Filter Boxes</ThemedText>
              
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close-circle" size={30} color={theme.textLight} />
              </TouchableOpacity>
            </View>

            {/* AYIRICI ÇİZGİ */}
            <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

            {/* İÇERİK KISMI (Buraya sonradan butonlar/seçenekler ekleyeceğiz) */}
            <ThemedText style={{ color: 'gray' }}>
              Buraya Favoriler, Türler (Work, Travel vb.) ve Sıralama seçenekleri gelecek...
            </ThemedText>

          </ThemedView>
        )}

      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default BoxesPage

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
    paddingRight:50,
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
    borderRadius:15,
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
    width: 180,
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
    height: 350, // Şimdilik sabit bir yükseklik, içerik arttıkça "auto" yapabilirsin
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
})