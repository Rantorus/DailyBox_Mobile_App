import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'

const BoxesPage = () => {
  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText style={styles.titleText} title={true}>Boxes Page Try</ThemedText>
      <ThemedText title={false}>Boxes Page Try</ThemedText>
      <ThemedText title={false}>Boxes Page Try</ThemedText>
    </ThemedView>
  )
}

export default BoxesPage

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  titleText:{
    fontSize: 24,
  }
})