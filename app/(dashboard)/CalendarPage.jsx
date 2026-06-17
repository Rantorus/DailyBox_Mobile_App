import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'

const CalendarPage = () => {
  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText style={styles.titleText} title={true}>Calendar Page Try</ThemedText>
      <ThemedText title={false}>Calendar Page Try</ThemedText>
      <ThemedText title={false}>Calendar Page Try</ThemedText>
    </ThemedView>

  )
}

export default CalendarPage

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  titleText:{
    fontSize: 24,
  }
})