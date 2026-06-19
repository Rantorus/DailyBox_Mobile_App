import { StyleSheet, View, FlatList, Pressable, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedCard from '../../components/ThemedCard';

import Ionicons from '@expo/vector-icons/Ionicons';

import { dummyBoxes } from '../../fetchBox/dummyBoxes';
import { CalendarList } from 'react-native-calendars';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const CalendarPage = () => {
  const todayDate = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [calendarCurrent, setCalendarCurrent] = useState(todayDate);
  const [calKey, setCalKey] = useState('cal-initial');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [isCreateCardVisible, setIsCreateCardVisible] = useState(false);

  const router = useRouter();

  const { themeName } = useTheme();
  const theme = Colors[themeName];

  const filteredData = dummyBoxes.filter((item) => {
    return item.date.split('T')[0] === selectedDate;
  });

  const [year, month, day] = selectedDate.split('-');
  const dateObj = new Date(year, month - 1, day);
  const daysInEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysInEnglish[dateObj.getDay()];

  function generateMarkedDates() {
    let marks = {};

    dummyBoxes.forEach((item) => {
      let strDate = item.date.split('T')[0];
      marks[strDate] = {
        marked: true,
        dotColor: theme.primary,
      };
    });

    marks[todayDate] = {
      ...marks[todayDate],
      selected: true,
      selectedColor: theme.primary + '40',
      selectedTextColor: theme.text,
    };

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: theme.primary,
      selectedTextColor: '#fff',
      ...(marks[selectedDate]?.marked && { dotColor: '#fff' })
    };

    return marks;
  }

  const renderMonthPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    let initialIndex = years.indexOf(pickerYear);
    if (initialIndex === -1) {
      initialIndex = 10;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const handleSelectMonth = (selectedYear, monthIndex) => {
      const newMonthStr = (monthIndex + 1).toString().padStart(2, '0');
      const newDate = `${selectedYear}-${newMonthStr}-01`;

      setCalendarCurrent(newDate);
      setCalKey(`cal-${newDate}`);
      setShowMonthPicker(false);
    };

    return (
      <FlatList
        data={years}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        keyExtractor={item => item.toString()}
        renderItem={({ item: yearItem }) => (
          <View style={{ width: screenWidth, paddingHorizontal: 20, paddingTop: 5 }}>
            <ThemedText style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
              {yearItem}
            </ThemedText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {months.map((m, index) => (
                <TouchableOpacity
                  key={m}
                  style={{
                    width: '30%',
                    paddingVertical: 18,
                    alignItems: 'center',
                    backgroundColor: theme.primary + '15',
                    borderRadius: 12,
                    marginBottom: 15,
                  }}
                  onPress={() => handleSelectMonth(yearItem, index)}
                >
                  <ThemedText style={{ fontWeight: 'bold', color: theme.primary, fontSize: 16 }}>{m}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <ThemedView safe={true} style={styles.container}>

      <View style={styles.calendarContainer}>
        {showMonthPicker ? (
          renderMonthPicker()
        ) : (
          <CalendarList
            key={`${calKey}-${themeName}`}
            current={calendarCurrent}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            renderHeader={(date) => {
              const y = typeof date.getFullYear === 'function' ? date.getFullYear() : date.year;
              const mIndex = typeof date.getMonth === 'function' ? date.getMonth() : (date.month - 1);

              const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              const mName = monthsEn[mIndex];

              return (
                <TouchableOpacity
                  onPress={() => {
                    setPickerYear(y || new Date().getFullYear());
                    setShowMonthPicker(true);
                  }}
                  style={{ padding: 10 }}
                >
                  <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {mName} {y}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={screenWidth}
            pastScrollRange={24}
            futureScrollRange={24}
            markedDates={generateMarkedDates()}
            theme={{
              calendarBackground: theme.tabBarBackground,
              textSectionTitleColor: theme.textLight,
              dayTextColor: theme.text,
              todayTextColor: theme.primary,
              textDisabledColor: theme.textLight ? `${theme.textLight}50` : '#d9e1e8',
              textDayFontSize: 14,
              textDayHeaderFontSize: 14,
            }}
            style={{ height: 360 }}
          />
        )}
      </View>

      <ThemedText title={true} style={styles.dateTitle}>
        {dayName}, {selectedDate}
      </ThemedText>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`box/${item.id}`)}>
            <ThemedCard style={[styles.card, { borderLeftColor: theme.primary }]}>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText>{item.date.split('T')[0]}</ThemedText>
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


      {isCreateCardVisible && (
        <Pressable
          style={styles.overlay}
          onPress={() => setIsCreateCardVisible(false)}
        />
      )}

      {/* AÇILAN MENÜ (POPUP KART) */}
      {isCreateCardVisible && (
        <ThemedCard style={[styles.createCard, { backgroundColor: theme.textLight }]}>

          {/* 1. SADECE GEÇMİŞ VEYA BUGÜN İÇİN: Create Log */}
          {selectedDate <= todayDate && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setIsCreateCardVisible(false);
                router.push({
                  pathname: "/box/CreateBoxPage",
                  params: {
                    category: "log",
                    date: selectedDate
                  }
                });
              }}
            >
              <Ionicons name="document-text" size={20} color={theme.primary} />
              <ThemedText style={[styles.menuText, { color: theme.text }]}>Create Log</ThemedText>
            </TouchableOpacity>
          )}

          {/* 2. AYIRICI ÇİZGİ: Sadece her iki buton da göründüğünde (yani gün BUGÜNSE) çıksın */}
          {selectedDate === todayDate && (
            <View style={[styles.menuDivider, { backgroundColor: theme.text + '50' }]} />
          )}

          {/* 3. SADECE GELECEK VEYA BUGÜN İÇİN: Create Plan */}
          {selectedDate >= todayDate && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Create Plan Tıklandı')
                setIsCreateCardVisible(false);
                router.push({
                  pathname: "/box/CreateBoxPage",
                  params: {
                    category: "plan",
                    date: selectedDate
                  }
                });
              }}
            >
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <ThemedText style={[styles.menuText, { color: theme.text }]}>Create Plan</ThemedText>
            </TouchableOpacity>
          )}

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

    </ThemedView>
  );
};

export default CalendarPage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarContainer: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    height: 360,
  },
  dateTitle: { marginHorizontal: 15, marginTop: 15, marginBottom: 10, fontSize: 20 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  list: { paddingBottom: 20 },
  card: {
    width: "92%", marginHorizontal: 15, marginVertical: 8, padding: 12,
    borderLeftWidth: 5, borderRadius: 8,
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
});