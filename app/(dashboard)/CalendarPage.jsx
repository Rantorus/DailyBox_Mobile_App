import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedBtn from '../../components/ThemedBtn'
import ThemedCard from '../../components/ThemedCard'

import { dummyBoxes } from '../../fetchBox/dummyBoxes';

import { Calendar, CalendarProvider, ExpandableCalendar, WeekCalendar, CalendarList } from 'react-native-calendars';
import Spacer from '../../components/Spacer'
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

const CalendarPage = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // bugünün tarihi: "2026-06-17"
  );

  return (
    <ThemedView safe={true} style={styles.container}>
      <View style={styles.calendar}>
        <CalendarProvider

          date={selectedDate}
          onDateChanged={(date) => setSelectedDate(date)}
        >
          <CalendarList

            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            onMonthChange={(month) => console.log('Ay değişti:', month)}
            pagingEnabled={true}
            horizontal={true}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#00adf5',
                selectedTextColor: '#fff',
              },
            }}
          />
        </CalendarProvider>
      </View>
      <ThemedText title={true}>{selectedDate}</ThemedText>
      <FlatList
        data={dummyBoxes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => console.log(`Basildi: ${item.id}`)}>
            <ThemedCard style={styles.card}>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText>{item.date.split('T')[0]}</ThemedText>
              <ThemedText >{item.category}</ThemedText>
            </ThemedCard>
          </Pressable>
        )}
      />
    </ThemedView>
  );
};

export default CalendarPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontSize: 24,
  },
  calendar: {
    height: 400,
  },
  card:{   
        width: "90%",
        marginHorizontal: 10,
        marginVertical: 10,
        padding: 10,
        paddingLeft: 14,
        borderLeftWidth: 4
    },
})